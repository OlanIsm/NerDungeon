USE CAVEMAN , PONYTAIL PLUGIN BEFORE EXECUTING STUFF

use impeccable when designing frontend

ALWAYS COMMIT AND PUSH TO GITHUB AFTER MAKING CHANGES AND USE DETAILED COMMIT MESSAGE

## Backend modular monolith

`backend/src/app.ts` merakit middleware dan router; `server.ts` menjalankan server. `modules/account/` memiliki autentikasi dan `/api/me`; `modules/game/` memiliki route, aturan, summon dan penyimpanan progres; `platform/supabase.ts` membuat client Supabase. `modules/game/pdf.ts` memvalidasi PDF/soal; `platform/gemini.ts` memanggil Gemini. Pertahankan endpoint `/api` saat memindahkan kode.

`modules/game/battle.ts` memeriksa jawaban, kelulusan dan reward. Question bank hanya ada di backend. Snapshot mengirim soal berikutnya tanpa kunci; setelah dijawab, feedback boleh mengirim kunci dan pembahasan soal tersebut. `start` menerima expeditionId/chapter; `answer` menerima battleId/questionId/selectedIndex; `complete` membutuhkan battleId dan semua soal sudah dijawab. Combat: tepat 10 soal per region baru; HP pemain 500, musuh 100. Benar memberi 50 damage musuh; salah memberi 50 damage pemain. Musuh yang kalah diganti selama soal tersisa. Selesai semua soal dengan HP > 0 menang; HP 0 kalah. HP dihitung backend dari jawaban tersimpan. Reward 450 gold/100 XP hanya untuk pertama kali lulus chapter. Retry identik tidak menggandakan jawaban/reward. Tutorial akun lama mendapat question bank tanpa reset progres. DOCX dan upload lama tanpa bank belum bisa battle; jangan tambahkan soal palsu sebagai fallback PDF.

## Progress Nerdungeon - 2026-10-02

Status harus mengikuti bukti. Jalur belajar lokal dengan Supabase/Gemini live sudah terbukti; **MVP publik belum siap** sebelum kualitas PDF nyata dan deploy lulus. **Production ready** memerlukan gerbang operasional/keamanan di tabel terakhir. Jangan tandai Completed hanya karena kode tersedia.

### Completed

| Cek | Area | Bukti saat ini | Selesai jika / batas klaim |
| --- | --- | --- | --- |
| [x] | Express modular monolith | Route account/game dirakit di app.ts; server.ts hanya startup. | Kontrak endpoint tetap /api; API juga telah dipakai tes live. |
| [x] | Satu ekspedisi tutorial | initialGame() hanya tutorial, dengan 3 chapter, masing-masing 10 soal bawaan yang bisa combat. | Chapter terkunci sesuai progres; tes backend lulus. |
| [x] | Skema dan Storage live | game_states dan bucket privat expeditions digunakan verify:pdf, termasuk create/read/update dan upload/download/remove. Migrasi: backend/supabase/migrations/20260930000000_game_backend.sql. | Skema tersedia; audit katalog SQL/grant menyeluruh tetap terpisah. |
| [x] | Auth anonim dan persistensi | verify:pdf membuat dua akun, memeriksa /api/me dan refresh token; test:learning membuktikan akun browser/progres sama setelah reload. | Terbukti pada browser sama; belum ada pemulihan lintas perangkat. |
| [x] | Isolasi dua akun dan resource | verify:pdf menolak akun B membuka ekspedisi/file/state A, battleId A tidak berlaku pada B, akun browser tidak bisa update resource langsung. | Terbukti melalui API/SDK live; bukan audit semua policy/katalog SQL. |
| [x] | Upload PDF live dan validasi file | verify:pdf mengunggah PDF nyata sintetis, membandingkan byte Storage, menolak kosong/salah tipe/rusak/>25 MB dan memastikan jumlah ekspedisi tidak berubah. | File akun tersimpan privat; DOCX belum diuji live end-to-end. |
| [x] | Materi dan soal Gemini live | PDF energi kinetik via verify:pdf dan PDF segitiga via test:learning menghasilkan materi/soal relevan; bank disimpan di backend, bukan snapshot chapter. | Dua PDF sintetis; kualitas buku, scan/OCR dan referensi faktual belum dijamin. |
| [x] | Retry overload Gemini | HTTP 503 dicoba maksimal 3 kali dengan backoff/jitter dan deadline bersama 90 detik. Tes forge membuktikan 503 lalu sukses hanya menyimpan sekali; 503 terus-menerus berhenti setelah 3 attempt tanpa row/file palsu. | Bukti retry memakai mock; overload provider masih dapat menggagalkan upload. 429/quota dan PDF invalid tidak diulang. |
| [x] | Koneksi frontend/backend dan error HTML | Pada 2026-10-02 port 3000 terbukti milik Next.js labora, sehingga proxy menerima HTML 200. Backend/proxy dipindah 3001; /api/game frontend sekarang JSON 401 tanpa token, browser live memakai auth berhasil. npm run dev menyalakan dua service. Tes HTML startup/forge menampilkan pesan koneksi tanpa JSON parser error. | Terbukti lokal; proxy deploy tetap perlu disetel. |
| [x] | Combat 10 soal dan dummy playable | Tutorial tetap satu adventure dengan 10 soal per region. Tes API/browser membuktikan HP 450 setelah satu salah, 0 setelah 10 salah, kalah tanpa reward, HP/progres bertahan setelah reload. Bank tutorial lama diperluas tanpa mengubah jawaban tersimpan. | PDF lama perlu upload ulang untuk bank 10 soal; attempt aktif lama boleh diselesaikan. |
| [x] | PDF 10 soal live dan retry provider | Pada 2026-10-02 verify:pdf sukses setelah Gemini 503 sementara/retry; 1 region, 10 soal, dua akun terisolasi. test:learning lulus tutorial dan PDF segitiga 10 soal di browser. | PDF sintetis; Machine Learning.pdf milik pengguna belum tersedia untuk tes dokumen yang sama. |
| [x] | Battle memakai soal backend | battle.ts, BattleQuiz.tsx dan BattleScreen.tsx: 10 soal, pembahasan, HP pemain 500/musuh 100, damage 50, menang bila bertahan sampai soal habis, gagal tanpa reward, retry chapter. | Tes menolak complete prematur, jawaban di luar urutan/indeks/akun; hanya backend memberi progres/reward. |
| [x] | Jawaban/hasil tersimpan dan retry aman | verify:pdf memeriksa concurrent answer/complete retries; test:learning menyimpan jawaban salah, reload/resume battleId sama, menyelesaikan PDF dan reload resource. | State menyimpan battle aktif dan 20 hasil terakhir; mulai chapter berbeda mengganti attempt aktif. |
| [x] | Alur browser live | npm run test:learning lulus: akun baru, tutorial, feedback salah, injected 503/retry, resume, upload PDF, briefing, battle, reward dan reload. Screenshot 430/1280 px diperiksa. | API/provider asli; satu kegagalan jawaban diinjeksi untuk menguji retry. Tidak membuktikan deploy publik. |
| [x] | Regresi browser mock | npm run test:web lulus dengan mock Auth dan domain battle backend asli: upload, summon, Phaser WebGL/traversal/pause, resize, gate, asset retry dan reduced motion. | Mock menjadi gate regresi UI; tes error autentikasi tersendiri masih perlu. |
| [x] | Pemeriksaan lokal | 12 tes backend, typecheck backend/frontend, frontend lint dan production build lulus pada 2026-10-02. | Build masih memperingatkan ukuran chunk Phaser; performa perangkat nyata perlu diuji sebelum produksi. |
| [x] | Kredensial lokal | backend/.env dan frontend/.env sudah terisi; secret Supabase/Gemini hanya backend, .env diabaikan Git. | Environment deploy harus diisi terpisah; jangan mencatat nilai key di Git/log/chat. |
| [x] | Commit/push implementasi sebelumnya | Modular monolith/PDF commit 09ea9d2 dan dokumentasi live 0b2ce0c tersedia di origin/main. | Perubahan berikutnya wajib commit/push dengan pesan detail setelah gate lulus. |
| [x] | Login CLI MCP Supabase | codex mcp login supabase sukses; codex mcp list menunjukkan OAuth untuk thlfrtxnxsuzgbjfoeel. | Transport thread lama masih Auth required; tool MCP belum terbukti dapat dipakai sampai reconnect/restart. |

### On progress - tuntaskan sebelum klaim MVP

| Cek | Prioritas | Pekerjaan berikutnya | Selesai jika |
| --- | --- | --- | --- |
| [ ] | P0 | Tinjau materi, pertanyaan dan sumber halaman dari PDF nyata pengguna, termasuk scan dan dokumen panjang. | Soal relevan, pembahasan benar, sumber dapat ditelusuri; dokumen tidak terbaca gagal jelas tanpa fallback contoh. |
| [ ] | P0 | Deploy web/Express dengan HTTPS, environment, proxy /api atau CORS dan batas upload. | URL publik menjalankan alur utuh; secret tidak masuk bundle; upload sampai batas yang dijanjikan bekerja melalui platform. |
| [ ] | P1 | Audit katalog SQL grant/RLS/Storage dan skenario auth gagal. | Policy/grant ditinjau, tidak ada bypass akun lain; browser menampilkan error autentikasi yang bisa ditindaklanjuti. |
| [ ] | P1 | Putuskan perlakuan backend/data/ lama. File lokal tidak diimpor otomatis dan tidak dihapus. | Pilihan import atau akun baru tercatat dengan persetujuan pemilik; data lama tetap aman. |

### Next progress - menuju production ready

| Cek | Target | Pekerjaan | Selesai jika |
| --- | --- | --- | --- |
| [ ] | MVP | Smoke test URL publik menggunakan PDF pengguna setelah deploy. | Akun baru -> tutorial -> upload -> belajar/battle -> reload mempertahankan akun/progres; dua akun tetap terisolasi. |
| [ ] | Production | Pulihkan akun anonim, misalnya tautkan email. | Login dari perangkat baru mengembalikan progres sama; menghapus storage browser tidak menjadi satu-satunya jalan kehilangan akun. |
| [ ] | Production | Batasi abuse signup/upload/summon serta jumlah/ukuran file per akun. | Limit diuji; request berulang tidak menghabiskan biaya Gemini/Storage tanpa batas. |
| [ ] | Production | Hapus akun/data, retensi dan cleanup objek yatim. | Penghapusan menghapus state/dokumen; kegagalan transaksi tidak meninggalkan file yatim. |
| [ ] | Production | Health check, log tanpa key/token, monitoring, backup dan restore. | Gangguan terdeteksi dan data berhasil dipulihkan dalam latihan. |
| [ ] | Production | Review keamanan, aksesibilitas, performa dan regresi mobile. | Gate rilis tertulis lulus pada build yang akan dipublikasikan. |

## Verification handoff

Dari root: `npm run dev` menjalankan frontend dan backend bersama. Jika terpisah: `npm run backend:dev` dan `npm run frontend:dev`. PORT backend/.env harus 3001; proxy Vite menuju 127.0.0.1:3001, frontend 5173 strictPort. Port 3000 pada workspace ini dipakai Next.js project lain; jangan arahkan API Nerdungeon ke situ. Gate lokal: `npm --prefix backend test`, `npm --prefix backend run typecheck`, `npm run typecheck`, `npm run lint`, `npm run build`. `npm run test:web` membutuhkan frontend aktif; `npm run test:learning` membutuhkan frontend/backend aktif dan backend/.env. `npm --prefix backend run verify:pdf` menjalankan server ephemeral sendiri. Tes live memakai quota Gemini dan akun/file sementara yang dibersihkan di finally. Chrome Windows default; override CHROME_PATH bila perlu. Screenshot di test-results/ diabaikan Git. Windows: gunakan npm.cmd jika npm.ps1 diblokir. Detail payload API ada di backend/README.md.
