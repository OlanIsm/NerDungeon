USE CAVEMAN , PONYTAIL PLUGIN BEFORE  EXECUTING STUFF

use impeccable when designing frontend

ALWAYS COMMIT AND PUSH TO GITHUB AFTER MAKING CHANGES

## Backend modular monolith

`backend/src/app.ts` merakit middleware dan router; `server.ts` hanya menjalankan server. `modules/account/` memiliki autentikasi dan `/api/me`; `modules/game/` memiliki route, aturan, data summon, dan penyimpanan progres game; `platform/supabase.ts` membuat client Supabase. `modules/game/pdf.ts` memvalidasi PDF dan hasil chapter/soal; `platform/gemini.ts` memanggil Gemini. Question bank dan kunci jawaban hanya di state backend; snapshot API tidak mengirimnya. Pertahankan kontrak `/api` saat memindahkan kode.

## Progress Nerdungeon — 2026-10-01

Status di bawah harus mengikuti bukti, bukan keberadaan kode saja. **MVP belum siap** sampai jalur PDF → materi/soal → battle → progres berjalan dengan Supabase live. **Production ready** perlu semua gerbang keamanan dan operasional di tabel terakhir. Jangan ubah baris menjadi `Completed` sebelum kriteria pada kolom "Selesai jika" terbukti.

### Completed

| Cek | Area | Bukti saat ini | Selesai jika / batas klaim |
| --- | --- | --- | --- |
| [x] | Express menggantikan Next.js API | `backend/src/app.ts` merakit router dari `backend/src/modules/account/` dan `backend/src/modules/game/`; `backend/src/server.ts` menjalankan server. Route `/api/me`, `/api/game`, `/api/game/forge` ada. | Kode dan kontrak API tersedia. Belum membuktikan koneksi Supabase live. |
| [x] | Auth dan data per akun di kode | `frontend/src/gameApi.ts` membuat sesi anonim dan mengirim Bearer token; modul akun memverifikasi token; `backend/src/modules/game/store.ts` memakai `user_id` dan version check. | Implementasi ada. Isolasi dua akun masih perlu uji live. |
| [x] | Skema database dan bucket disiapkan | `backend/supabase/migrations/20260930000000_game_backend.sql` membuat `game_states` dan bucket privat `expeditions`. | File migrasi siap ditinjau. Belum ada bukti sudah diterapkan ke project remote. |
| [x] | Endpoint upload PDF/DOCX di kode | `backend/src/modules/game/index.ts` membatasi satu file, 25 MB, nama dan magic bytes; menyimpan ke Storage lalu mencatat ekspedisi. | Implementasi upload ada. Belum ada bukti upload sukses end-to-end ke Storage live. |
| [x] | Satu ekspedisi awal untuk tutorial | `backend/src/modules/game/state.ts` membuat hanya `tutorial`; ekspedisi baru muncul hanya setelah upload. Chapter terkunci sesuai progres dan hadiah chapter tidak berulang. | Tes `backend/tests/game.test.ts` lulus. |
| [x] | Cek dasar lokal | Pada 2026-09-30: 4 tes backend lulus; typecheck backend/frontend, lint dan build frontend lulus. | Ini cek kode lokal, bukan uji deploy atau database live. |
| [x] | Kredensial aplikasi lokal terpasang | Pada workspace ini `backend/.env` dan `frontend/.env` sudah berisi URL dan publishable key; secret key hanya di backend. Nilai key tidak dicatat di Git. | Format dan pemisahan key terverifikasi; environment deploy tetap perlu diisi sendiri. |

| [x] | Implementasi PDF/Gemini dan validasi lokal | `backend/src/modules/game/pdf.ts`, `backend/src/platform/gemini.ts`, dan `backend/tests/pdf.test.ts`; 7 tes backend, typecheck backend/frontend, lint dan build frontend lulus pada 2026-10-01. Briefing materi PDF diuji dengan mock pada viewport 430 dan 1280 px. | Bukti lokal dengan mock provider; kualitas soal dan penyimpanan live belum dinyatakan lulus. |

### On progress — tuntaskan sebelum klaim MVP

| Cek | Prioritas | Pekerjaan berikutnya | Selesai jika |
| --- | --- | --- | --- |
| [ ] | P0 | Commit dan push perubahan modular monolith serta PDF/Gemini. Akses tulis Git telah pulih pada 2026-10-01; staging berhasil. | Semua perubahan sesi masuk commit dan tersedia di GitHub; file `.env` tetap tidak diikutkan. |
| [ ] | P0 | Terapkan migrasi SQL ke project `thlfrtxnxsuzgbjfoeel`; periksa tabel, grant, RLS, dan bucket privat. Cek live 2026-10-01: `game_states` masih memberi `PGRST205`; bucket privat `expeditions` sudah dibuat dengan limit 25 MB dan MIME PDF/DOCX. | Query remote menunjukkan skema ada; akun biasa tidak bisa menulis `game_states` atau membaca file akun lain secara langsung. |
| [ ] | P0 | Uji Anonymous Sign-Ins di Supabase Auth. Pada 2026-10-01 akun anonim sementara berhasil dibuat oleh `verify:pdf`; `/api/me` dan persistensi sesi browser masih perlu dibuktikan. | Akun anonim bisa dibuat, `/api/me` mengembalikan user valid, reload mempertahankan akun. |
| [ ] | P0 | Uji jalur PDF live dengan dua akun: unggah PDF valid, refresh, buka ekspedisi; tolak file rusak, kosong, salah tipe, dan lebih dari 25 MB. | File tersimpan di bucket privat, row akun A bertambah, akun B tidak melihat row/file A, error upload tidak meninggalkan row palsu. |
| [ ] | P0 | Perbarui `scripts/verify-game-entry.cjs`: saat ini hanya mock `/api/game` dan forge, belum mock/menjalankan Supabase Auth. | Tes browser berjalan ulang dengan alur token baru dan memeriksa upload, summon, tutorial, battle, serta error auth. |
| [ ] | P0 | Tentukan perlakuan `backend/data/` lama; data lokal tidak otomatis diimpor ke Supabase. | Pilihan migrasi atau mulai akun baru tercatat dan diverifikasi tanpa menghapus data lama diam-diam. |

### Next progress — urutan menuju MVP lalu production ready

| Cek | Target | Pekerjaan | Selesai jika |
| --- | --- | --- | --- |
| [ ] | MVP | Jalankan `npm --prefix backend run verify:pdf` setelah migrasi SQL diterapkan. Akses jaringan telah pulih. Pada 2026-10-01 Gemini `gemini-2.5-flash` memberi 404, `gemini-3.8-flash` overloaded (503), dan `gemini-3.5-flash` berhasil menghasilkan konten yang lolos validator PDF; default kini `gemini-3.5-flash`. Penyimpanan live masih terhalang tabel `game_states` yang belum ada. | Model memakai isi PDF yang diunggah dan gagal dengan pesan jelas saat dokumen tidak dapat diproses; hasil tersimpan dan reload berhasil. |
| [ ] | MVP | Tinjau kualitas chapter, materi, referensi halaman dan soal dari PDF nyata. JSON terstruktur, validasi backend dan penyimpanan question bank sudah diimplementasikan; DOCX tetap memakai starter chapters. PDF tidak memakai fallback starter chapters. | Ekspedisi baru memuat materi/soal yang relevan dengan PDF; sumber atau halaman bisa ditelusuri; soal contoh tidak tampil sebagai hasil PDF. |
| [ ] | MVP | Hubungkan soal PDF ke battle dan simpan jawaban/hasil di backend. Saat ini battle memakai encounter tetap dan frontend mengirim `complete` sendiri. | Pemain benar-benar menjawab soal; backend memvalidasi hasil sebelum memberi progres/hadiah; request `complete` langsung tidak bisa melewati battle. |
| [ ] | MVP | Uji alur utuh di project uji: akun baru → tutorial → upload PDF → belajar/battle → refresh/login ulang → progres tetap ada. | Tes otomatis dan smoke test browser lulus tanpa mock API; dua akun tetap terisolasi. |
| [ ] | MVP | Deploy web dan Express dengan HTTPS, environment variables, migrasi, serta routing `/api`/CORS yang benar. | URL publik menjalankan alur utuh; secret key tidak masuk bundle frontend; upload 25 MB berhasil lewat proxy/platform deploy. |
| [ ] | Production | Tambah cara memulihkan akun anonim, misalnya tautkan email; akun anonim saat ini hilang bila storage browser dihapus. | User bisa masuk lagi di perangkat/browser baru dan progres yang sama muncul. |
| [ ] | Production | Batasi abuse untuk pendaftaran anonim, upload, summon, dan ukuran/jumlah file per akun; tinjau akses Storage serta validasi konten. | Batas diuji; akun lain tidak bisa membaca/menimpa file; biaya dan Storage tidak bisa dihabiskan dengan request berulang. |
| [ ] | Production | Sediakan hapus akun/data, kebijakan retensi file, dan pembersihan file yatim bila transaksi gagal. | Menghapus akun menghapus state dan dokumen terkait; kegagalan upload tidak meninggalkan objek yatim. |
| [ ] | Production | Tambah health check, log error tanpa token/key, monitoring, backup dan uji restore database/Storage. | Gangguan terdeteksi, penyebab bisa ditelusuri, dan data bisa dipulihkan lewat latihan restore. |
| [ ] | Production | Jalankan review keamanan, aksesibilitas, performa PDF/battle, serta regresi mobile sebelum rilis. | Gate rilis tertulis dan lulus pada build yang akan dipublikasikan. |
