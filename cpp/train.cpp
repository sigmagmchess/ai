// VEGA-CPP: karakter düzeyi nöral dil modeli eğiticisi
// Mimari: ctx(32) x emb(48) -> ReLU(2048) -> softmax(vocab)  (~3.4M parametre)
// Saf C++17 + OpenMP. Gerçek geri yayılım, SGD + momentum, kosinüs lr.
// Derleme: g++ -O3 -march=native -fopenmp -o train train.cpp
// Kullanım: ./train train.txt <adım> <model.bin>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cmath>
#include <vector>
#include <string>
#include <random>
#include <chrono>
#include <algorithm>
#ifdef _OPENMP
#include <omp.h>
#endif

using namespace std;

static const int CTX = 32, EMB = 48, HID = 2048;
static int V = 0;                       // sözlük boyutu (veriden)
static const int BATCH = 96;

struct Timer {
    chrono::steady_clock::time_point t0 = chrono::steady_clock::now();
    double sec() {
        return chrono::duration<double>(chrono::steady_clock::now() - t0).count();
    }
};

int main(int argc, char **argv) {
    const char *path = argc > 1 ? argv[1] : "train.txt";
    int STEPS = argc > 2 ? atoi(argv[2]) : 3000;
    const char *outPath = argc > 3 ? argv[3] : "model-vega-cpp.bin";

    // ---- Veriyi oku, sözlük kur (en sık 127 karakter + UNK) ----
    FILE *f = fopen(path, "rb");
    if (!f) { fprintf(stderr, "veri yok: %s\n", path); return 1; }
    fseek(f, 0, SEEK_END); long N = ftell(f); fseek(f, 0, SEEK_SET);
    vector<unsigned char> raw(N);
    if (fread(raw.data(), 1, N, f) != (size_t)N) return 1;
    fclose(f);

    long freq[256] = {0};
    for (long i = 0; i < N; i++) freq[raw[i]]++;
    vector<pair<long,int>> byF;
    for (int c = 0; c < 256; c++) if (freq[c] > 0) byF.push_back({-freq[c], c});
    sort(byF.begin(), byF.end());
    int charOf[128], idxOf[256];
    for (int i = 0; i < 256; i++) idxOf[i] = 0;       // 0 = UNK
    V = 1;
    for (auto &p : byF) {
        if (V >= 128) break;
        idxOf[p.second] = V;
        charOf[V] = p.second;
        V++;
    }
    charOf[0] = ' ';
    vector<unsigned char> data(N);
    for (long i = 0; i < N; i++) data[i] = (unsigned char)idxOf[raw[i]];
    long cut = (long)(N * 0.98);                       // %2 doğrulama
    printf("veri: %ld karakter, sözlük: %d, eğitim/val: %ld/%ld\n",
           N, V, cut, N - cut);

    // ---- Parametreler ----
    const int IN = CTX * EMB;
    vector<float> Wemb((size_t)V * EMB), W1((size_t)IN * HID), b1(HID, 0),
                  W2((size_t)HID * V), b2(V, 0);
    long PARAMS = (long)Wemb.size() + W1.size() + b1.size() + W2.size() + b2.size();
    printf("parametre: %ld (%.2f M)\n", PARAMS, PARAMS / 1e6);

    mt19937 rng(42);
    auto initv = [&](vector<float> &w, float s) {
        normal_distribution<float> d(0.f, s);
        for (auto &x : w) x = d(rng);
    };
    initv(Wemb, 0.08f);
    initv(W1, sqrtf(2.f / IN));
    initv(W2, sqrtf(2.f / HID));

    // momentum tamponları
    vector<float> mEmb(Wemb.size(), 0), m1(W1.size(), 0), mb1(HID, 0),
                  m2(W2.size(), 0), mb2(V, 0);

    // batch tamponları
    vector<int>   ix(BATCH * CTX), ty(BATCH);
    vector<float> X(BATCH * IN), Z1(BATCH * HID), A1(BATCH * HID),
                  P(BATCH * V), dZ1(BATCH * HID);

    uniform_int_distribution<long> pickT(CTX, cut - 2), pickV(cut + CTX, N - 2);

    auto forward = [&](int B) {
        // Z1 = X*W1 + b1 ; A1 = relu ; P = softmax(A1*W2 + b2)
        #pragma omp parallel for schedule(static)
        for (int b = 0; b < B; b++) {
            float *z = &Z1[(size_t)b * HID];
            const float *x = &X[(size_t)b * IN];
            for (int h = 0; h < HID; h++) z[h] = b1[h];
            for (int i = 0; i < IN; i++) {
                float xv = x[i];
                if (xv == 0.f) continue;
                const float *w = &W1[(size_t)i * HID];
                for (int h = 0; h < HID; h++) z[h] += xv * w[h];
            }
            float *a = &A1[(size_t)b * HID];
            for (int h = 0; h < HID; h++) a[h] = z[h] > 0 ? z[h] : 0;
            float *p = &P[(size_t)b * V];
            for (int o = 0; o < V; o++) p[o] = b2[o];
            for (int h = 0; h < HID; h++) {
                float av = a[h];
                if (av == 0.f) continue;
                const float *w = &W2[(size_t)h * V];
                for (int o = 0; o < V; o++) p[o] += av * w[o];
            }
            float mx = p[0];
            for (int o = 1; o < V; o++) mx = max(mx, p[o]);
            float s = 0;
            for (int o = 0; o < V; o++) { p[o] = expf(p[o] - mx); s += p[o]; }
            for (int o = 0; o < V; o++) p[o] /= s;
        }
    };

    auto makeBatch = [&](int B, bool val) {
        for (int b = 0; b < B; b++) {
            long pos = val ? pickV(rng) : pickT(rng);
            for (int c = 0; c < CTX; c++) {
                int ch = data[pos - CTX + c];
                ix[b * CTX + c] = ch;
                memcpy(&X[((size_t)b * CTX + c) * EMB], &Wemb[(size_t)ch * EMB],
                       EMB * sizeof(float));
            }
            ty[b] = data[pos];
        }
    };

    Timer total;
    double lastLoss = 0, valLoss = 0;
    printf("eğitim başlıyor: %d adım, batch %d, %d iş parçacığı\n", STEPS, BATCH,
#ifdef _OPENMP
           omp_get_max_threads()
#else
           1
#endif
    );

    for (int s = 1; s <= STEPS; s++) {
        float lr = 0.05f * (0.5f * (1 + cosf(3.14159f * s / STEPS))) + 0.002f;
        makeBatch(BATCH, false);
        forward(BATCH);

        // kayıp + dZ2 = (P - onehot)/B  (W2'ye ve A1'e geri yay)
        double loss = 0;
        for (int b = 0; b < BATCH; b++)
            loss += -log(max(1e-9f, P[(size_t)b * V + ty[b]]));
        lastLoss = loss / BATCH;

        #pragma omp parallel for schedule(static)
        for (int b = 0; b < BATCH; b++) {
            float *p = &P[(size_t)b * V];
            for (int o = 0; o < V; o++) p[o] /= BATCH;
            p[ty[b]] -= 1.0f / BATCH;
        }
        // dA1 = dZ2 * W2^T ; relu türevi
        #pragma omp parallel for schedule(static)
        for (int b = 0; b < BATCH; b++) {
            const float *p = &P[(size_t)b * V];
            const float *z = &Z1[(size_t)b * HID];
            float *dz = &dZ1[(size_t)b * HID];
            for (int h = 0; h < HID; h++) {
                if (z[h] <= 0) { dz[h] = 0; continue; }
                const float *w = &W2[(size_t)h * V];
                float acc = 0;
                for (int o = 0; o < V; o++) acc += p[o] * w[o];
                dz[h] = acc;
            }
        }
        // W2 güncelle (momentumlu SGD) — h üzerinde paralel
        #pragma omp parallel for schedule(static)
        for (int h = 0; h < HID; h++) {
            float *w = &W2[(size_t)h * V], *m = &m2[(size_t)h * V];
            for (int o = 0; o < V; o++) {
                float g = 0;
                for (int b = 0; b < BATCH; b++)
                    g += A1[(size_t)b * HID + h] * P[(size_t)b * V + o];
                m[o] = 0.9f * m[o] + g;
                w[o] -= lr * m[o];
            }
        }
        for (int o = 0; o < V; o++) {
            float g = 0;
            for (int b = 0; b < BATCH; b++) g += P[(size_t)b * V + o];
            mb2[o] = 0.9f * mb2[o] + g;
            b2[o] -= lr * mb2[o];
        }
        // W1 güncelle + dX (embedding gradyanı) — i üzerinde paralel
        #pragma omp parallel for schedule(static)
        for (int i = 0; i < IN; i++) {
            float *w = &W1[(size_t)i * HID], *m = &m1[(size_t)i * HID];
            for (int h = 0; h < HID; h++) {
                float g = 0;
                for (int b = 0; b < BATCH; b++)
                    g += X[(size_t)b * IN + i] * dZ1[(size_t)b * HID + h];
                m[h] = 0.9f * m[h] + g;
                w[h] -= lr * m[h];
            }
        }
        for (int h = 0; h < HID; h++) {
            float g = 0;
            for (int b = 0; b < BATCH; b++) g += dZ1[(size_t)b * HID + h];
            mb1[h] = 0.9f * mb1[h] + g;
            b1[h] -= lr * mb1[h];
        }
        // embedding güncelle: dX[b,i] = dZ1[b,:] . W1[i,:]
        for (int b = 0; b < BATCH; b++) {
            for (int c = 0; c < CTX; c++) {
                int ch = ix[b * CTX + c];
                float *e = &Wemb[(size_t)ch * EMB];
                for (int d = 0; d < EMB; d++) {
                    int i = c * EMB + d;
                    const float *w = &W1[(size_t)i * HID];
                    const float *dz = &dZ1[(size_t)b * HID];
                    float g = 0;
                    for (int h = 0; h < HID; h++) g += dz[h] * w[h];
                    e[d] -= lr * g;
                }
            }
        }

        if (s % 100 == 0 || s == STEPS) {
            makeBatch(BATCH, true);
            forward(BATCH);
            double vl = 0;
            for (int b = 0; b < BATCH; b++)
                vl += -log(max(1e-9f, P[(size_t)b * V + ty[b]]));
            valLoss = vl / BATCH;
            printf("adım %5d/%d  eğitim %.3f  doğrulama %.3f  lr %.4f  %.0f sn\n",
                   s, STEPS, lastLoss, valLoss, lr, total.sec());
            fflush(stdout);
        }
    }
    printf("EĞİTİM BİTTİ: %.1f dk, son eğitim kaybı %.3f, doğrulama %.3f\n",
           total.sec() / 60, lastLoss, valLoss);

    // ---- Örnek üretim (sıcaklık örneklemesi) ----
    auto generate = [&](const string &prompt, int n, float temp) {
        string out = prompt;
        vector<int> ctx(CTX, idxOf[(unsigned char)' ']);
        for (size_t i = 0; i < prompt.size() && i < (size_t)CTX; i++)
            ctx[CTX - min(prompt.size(), (size_t)CTX) + i] =
                idxOf[(unsigned char)prompt[prompt.size() -
                      min(prompt.size(), (size_t)CTX) + i]];
        for (int t = 0; t < n; t++) {
            for (int c = 0; c < CTX; c++)
                memcpy(&X[(size_t)c * EMB], &Wemb[(size_t)ctx[c] * EMB],
                       EMB * sizeof(float));
            forward(1);
            vector<double> logits(V);
            double sum = 0;
            for (int o = 1; o < V; o++) {
                logits[o] = pow((double)max(1e-9f, P[o]), 1.0 / temp);
                sum += logits[o];
            }
            double r = uniform_real_distribution<double>(0, sum)(rng);
            int pick = 1;
            for (int o = 1; o < V; o++) { r -= logits[o]; if (r <= 0) { pick = o; break; } }
            out += (char)charOf[pick];
            for (int c = 0; c < CTX - 1; c++) ctx[c] = ctx[c + 1];
            ctx[CTX - 1] = pick;
        }
        return out;
    };
    const char *prompts[] = {"def ", "function ", "const veri = ", "SELECT "};
    for (auto p : prompts) {
        string g = generate(p, 90, 0.75f);
        for (auto &ch : g) if (ch == '\n') ch = ' ';
        printf("ÜRETİM[%s]: %s\n", p, g.c_str());
    }

    // ---- Modeli kaydet (int8 nicemleme: matris başına ölçek) ----
    FILE *o = fopen(outPath, "wb");
    auto dumpQ = [&](vector<float> &w) {
        float mx = 1e-9f;
        for (auto x : w) mx = max(mx, fabsf(x));
        float scale = mx / 127.f;
        fwrite(&scale, 4, 1, o);
        for (auto x : w) {
            signed char q = (signed char)lroundf(x / scale);
            fwrite(&q, 1, 1, o);
        }
    };
    int hdr[4] = {V, CTX, EMB, HID};
    fwrite(hdr, 4, 4, o);
    for (int i = 0; i < V; i++) { char c = (char)charOf[i]; fwrite(&c, 1, 1, o); }
    dumpQ(Wemb); dumpQ(W1); dumpQ(b1); dumpQ(W2); dumpQ(b2);
    fclose(o);
    printf("model kaydedildi: %s (int8 nicemleme)\n", outPath);
    return 0;
}
