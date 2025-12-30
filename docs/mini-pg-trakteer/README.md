# Trakteer Automation Suite 🚀

Automasi pembayaran QRIS Trakteer dan verifikasi unit secara terprogram.
Project ini memungkinkan Anda membuat transaksi QRIS Trakteer murni menggunakan API (tanpa browser automation berat) dan menemukan Unit ID yang valid.

## 📂 Struktur Project

```
trakteer-pg/
├── requests/
│   ├── create-requests.mjs   # Script utama generate QRIS
│   └── discover-units.mjs    # Script pencari Unit ID & Harga
├── package.json              # Definisi dependency
└── .env                      # Konfigurasi Environment (opsional)
```

## 🛠️ Instalasi

1.  **Requirement**: Node.js v16+ (Disarankan v18+).
2.  **Install Library**:
    ```bash
    npm install
    ```
    _Command ini akan menginstall `axios`, `cheerio`, `tough-cookie`, dan lain-lain sesuai `package.json`._

## 🚀 Cara Penggunaan

### 1. Mencari Unit ID & Harga (Wajib di awal)

Sebelum membuat transaksi, Anda perlu tahu `unit_id` apa yang aktif dan berapa harganya.

```bash
npm run discover
# atau
node requests/discover-units.mjs
```

**Output:**

```text
Creator ID Found: l0865...
[DEFAULT] Name: Cendol | Price: 5000 | ID: kbqg5...
```

_Copy `ID` yang muncul untuk digunakan di langkah selanjutnya._

### 2. Membuat QRIS Transaksi

Generate kode QRIS siap bayar.

1.  Buka `requests/create-requests.mjs`.
2.  Edit bagian `CONFIG` di atas file:
    ```javascript
    const CONFIG = {
      targetUsername: 'trisna_nugraha2',
      unit_id: 'PASTE_UNIT_ID_DISINI', // Hasil langkah 1
      quantity: 1,
      ...
    };
    ```
3.  Jalankan:

### 3. Menjalankan Webhook Listener (Optional)

Jika Anda ingin menerima notifikasi real-time.

1.  Jalankan Listener:
    ```bash
    npm run webhook
    ```
2.  Jalankan Tunnel (Public URL):
    ```bash
    npm run tunnel
    # atau manual: .\ngrok.exe http 3001
    ```
3.  Copy URL `https://....ngrok-free.app` -> Tambah `/webhook` -> Pasang di Dashboard Trakteer.

**Output:**

```text
[2] Sending Payload: { ... }
[3] Success! Checkout URL: https://trakteer.id/checkout/...
=== RAW QRIS PAYLOAD ===
00020101021226650013CO.XENDIT...
```

_String QRIS tersebut bisa langsung di-generate menjadi gambar QR Code atau dibayar via e-wallet._

## ⚙️ Penjelasan Teknis

### Logic `discover-units.mjs`

1.  **Internal ID Discovery**: Mengambil halaman profil (`trakteer.id/username`) untuk mencari **Creator ID** (UUID internal).
2.  **API Call**: Menggunakan ID tersebut untuk memanggil endpoint API `v2/fe/creator/{id}/summary`.
3.  **Result**: Endpoint ini mengembalikan JSON lengkap berisi Unit aktif, harga, dan konfigurasi rewards.

### Logic `create-requests.mjs`

1.  **CSRF & Session**: Fetch halaman profil untuk mendapatkan `X-CSRF-TOKEN` dan cookies sesi.
2.  **Payload Construction**: Menyusun payload JSON berisi `creator_id` dan `unit_id`.
3.  **Direct API POST**: Mengirim payload langsung ke `https://trakteer.id/pay/xendit/qris` (bypassing form UI).
4.  **QRIS Extraction**: Membuka URL redirect checkout dan menggunakan Regular Expression untuk mengambil raw string QRIS (`000201...`) dari source code halaman.

---

**Note**: Gunakan dengan bijak untuk keperluan testing dan integrasi pembayaran.
