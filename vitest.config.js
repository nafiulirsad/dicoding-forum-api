import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Jalankan berkas uji satu per satu supaya integration test tidak saling
    // menimpa data pada database pengujian.
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: [
        'src/**/_test/**',
        // entry point aplikasi, tidak mengandung logika yang perlu diuji
        'src/app.js',
      ],
    },
  },
});
