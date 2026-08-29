# Forum API

Back-End API aplikasi forum diskusi **Garuda Game** — submission akhir kelas Dicoding
*Menjadi Back-End Developer Expert* (Modul **CI/CD dan Security**).

Proyek ini dibangun di atas **Express 5** + **PostgreSQL**, menerapkan **Clean Architecture**
4 lapis, diuji otomatis (unit, integration, dan functional/server test) dengan **100% test
coverage**, dideploy otomatis lewat **GitHub Actions**, serta diamankan dengan **rate limit**
dan **HTTPS**.

---

## Fitur

| Fitur | Endpoint | Auth |
|---|---|---|
| Registrasi pengguna | `POST /users` | – |
| Login | `POST /authentications` | – |
| Refresh access token | `PUT /authentications` | – |
| Logout | `DELETE /authentications` | – |
| Menambahkan thread | `POST /threads` | ✅ |
| Melihat detail thread | `GET /threads/{threadId}` | – |
| Menambahkan komentar | `POST /threads/{threadId}/comments` | ✅ |
| Menghapus komentar (*soft delete*) | `DELETE /threads/{threadId}/comments/{commentId}` | ✅ |
| Menambahkan balasan komentar | `POST /threads/{threadId}/comments/{commentId}/replies` | ✅ |
| Menghapus balasan (*soft delete*) | `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` | ✅ |
| Menyukai / batal menyukai komentar | `PUT /threads/{threadId}/comments/{commentId}/likes` | ✅ |

Menyukai komentar bersifat *toggle*: bila pengguna belum menyukai komentar maka aksinya
adalah menyukai, dan bila sudah menyukai maka aksinya adalah batal menyukai. Jumlah suka
ditampilkan sebagai `likeCount` pada setiap item komentar di detail thread.

Komentar dan balasan dihapus secara **soft delete** (kolom `is_delete`). Saat detail thread
diakses, kontennya ditampilkan sebagai `**komentar telah dihapus**` dan
`**balasan telah dihapus**`. Komentar dan balasan diurutkan **ascending** berdasarkan waktu.

---

## Arsitektur

```
src/
├── Domains/           # Entities + abstraksi repository (tanpa dependensi framework)
├── Applications/      # Use case + abstraksi security
├── Infrastructures/   # Implementasi konkret: PostgreSQL, bcrypt, JWT, HTTP server
├── Interfaces/        # Router, handler, dan middleware Express
└── Commons/           # Konfigurasi dan exception
```

Aturan dependensi mengarah ke dalam: `Interfaces → Applications → Domains`, sedangkan
`Infrastructures` hanya mengimplementasikan kontrak yang dideklarasikan `Domains`.
Dependency injection ditangani `instances-container` pada `src/Infrastructures/container.js`.

---

## Tech Stack

| Kebutuhan | Pilihan |
|---|---|
| Runtime | Node.js 22 LTS (ESM) |
| HTTP framework | Express 5 |
| Database | PostgreSQL |
| Migrasi | node-pg-migrate |
| Autentikasi | JWT (`jsonwebtoken`) |
| Hash password | bcrypt |
| Testing | Vitest + Supertest |
| Coverage | `@vitest/coverage-v8` |
| Lint | ESLint (`eslint-config-dicodingacademy`) |
| CI/CD | GitHub Actions |
| Reverse proxy | NGINX (rate limit + TLS) |
| Process manager | PM2 |

---

## Menjalankan Secara Lokal

### 1. Prasyarat

- Node.js 22 LTS
- PostgreSQL 13+

### 2. Instalasi

```bash
npm install
```

### 3. Konfigurasi environment

```bash
cp .env.example .env
cp .test.env.example .test.env
```

Sesuaikan kredensial database pada kedua berkas tersebut.

| Variabel | Keterangan |
|---|---|
| `HOST`, `PORT` | Alamat HTTP server |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Koneksi PostgreSQL |
| `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY` | Kunci penandatanganan JWT |
| `ACCESS_TOKEN_AGE` | Umur access token (detik) |

### 4. Migrasi database

```bash
npm run migrate up        # database utama (.env)
npm run migrate:test up   # database pengujian (.test.env)
```

### 5. Menjalankan server

```bash
npm start        # produksi
npm run start:dev  # mode pengembangan (nodemon)
```

---

## Pengujian

```bash
npm test              # seluruh pengujian
npm run test:coverage # pengujian + laporan coverage
npm run lint          # pemeriksaan gaya penulisan
```

Pengujian mencakup tiga tingkat:

- **Unit test** — entity, use case, dan abstraksi repository (memakai *test double*).
- **Integration test** — implementasi repository terhadap PostgreSQL sungguhan.
- **Functional test** — seluruh alur HTTP melalui Supertest (`src/Infrastructures/http/_test`).

---

## Continuous Integration

Berkas: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

- Berjalan pada event **pull request** ke branch `main`.
- Menjalankan lint dan seluruh pengujian (unit, integration, functional).
- Database pengujian disediakan lewat **PostgreSQL service container**, sehingga tidak
  memerlukan database publik dan pipeline berjalan jauh lebih cepat.

Secret repository yang dipakai: `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`.

---

## Continuous Deployment

Berkas: [`.github/workflows/cd.yml`](.github/workflows/cd.yml)

- Berjalan pada event **push** ke branch `main` (termasuk hasil merge pull request).
- Deploy lewat SSH (`appleboy/ssh-action`): `git reset --hard origin/main`,
  `npm ci --omit=dev`, `npm run migrate up`, lalu `pm2 reload forum-api`.

Secret repository yang dipakai: `SSH_HOST`, `SSH_USERNAME`, `SSH_KEY`, `SSH_PORT`.

---

## Limit Access

Berkas: [`nginx.conf`](nginx.conf)

Resource `/threads` beserta seluruh path di dalamnya dibatasi **90 permintaan per menit
per alamat IP** menggunakan modul `limit_req` NGINX:

```nginx
limit_req_zone $binary_remote_addr zone=forumapi_threads:10m rate=90r/m;
limit_req_status 429;

location /threads {
    limit_req zone=forumapi_threads burst=90 nodelay;
    proxy_pass http://forumapi_backend;
}
```

Resource lain (`/users`, `/authentications`) sengaja tidak dibatasi sesuai ketentuan
submission. Permintaan yang melewati kuota dijawab `429 Too Many Requests`.

---

## HTTPS

Seluruh trafik HTTP dialihkan permanen ke HTTPS. Sertifikat diterbitkan Let's Encrypt
melalui Certbot dan diperbarui otomatis oleh timer systemd bawaan Certbot.

---

## Lisensi

ISC — Nafiul Irsad.
