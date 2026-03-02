# 🚀 Kasir PRO — XYZ Technologies

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.5.0--Pro-blue.svg)](#)
[![Platform](https://img.shields.io/badge/Platform-Web--Browser-brightgreen.svg)](#)

**Kasir PRO** adalah aplikasi Point of Sale (POS) berbasis web satu-file (*Single File HTML*) yang ringan, responsif, dan modern. Dirancang khusus untuk UMKM atau bisnis retail yang membutuhkan sistem kasir cepat tanpa perlu instalasi server yang rumit.

---

## ✨ Fitur Utama

Aplikasi ini dilengkapi dengan fitur-fitur mutakhir untuk menunjang produktivitas:

| Fitur | Deskripsi |
| :--- | :--- |
| 🔍 **Auto-Response Search** | Pencarian item di tab kasir secara real-time untuk mempercepat input transaksi. |
| 🏷️ **Smart Badge Counter** | Indikator angka berwarna terang pada item yang dipilih untuk memantau jumlah Qty secara visual. |
| 📄 **Professional Invoice** | Layout invoice modern dengan logo (kiri) serta detail transaksi & nomor INV otomatis (kanan). |
| 📸 **Snapshot Export** | Fitur ekspor invoice langsung menjadi file gambar (PNG/JPG) berkualitas HD. |
| 📂 **Data Portability** | Sistem Ekspor & Impor database barang menggunakan format JSON. |
| 🌙 **Modern Dark Mode** | Antarmuka gelap (Dark UI) yang elegan dan nyaman di mata untuk penggunaan jangka panjang. |

---

## 🛠️ Fungsi Utama & Navigasi

Aplikasi dibagi menjadi 3 modul utama yang saling terintegrasi:

### 1. Modul Manajemen Barang (Menu)
* Menambah, mengedit, dan menghapus daftar produk.
* Penyimpanan otomatis menggunakan `LocalStorage` browser.
* Fitur backup data (Export/Import).

### 2. Modul Kasir (Transaksi)
* **Pencarian Cepat:** Ketik nama barang, sistem akan langsung memfilter.
* **One-Click Add:** Klik kartu produk untuk menambah ke keranjang.
* **Kalkulasi Otomatis:** Menghitung total belanja dan kembalian pembeli secara instan.

### 3. Modul Invoice (Cetak)
* Menghasilkan nomor invoice unik berbasis timestamp.
* Opsi cetak langsung (Print) atau simpan sebagai gambar untuk dikirim via WhatsApp.

---

## 💾 Panduan Ekspor & Impor (JSON)

Fitur ini sangat krusial untuk menjaga keamanan data Anda.

### 📤 Cara Ekspor Data (Backup)
1. Pergi ke Tab **Menu Barang**.
2. Klik tombol **Export Data**.
3. File `data_barang_xyz.json` akan terunduh. File ini berisi seluruh database barang dan harga Anda.

### 📥 Cara Impor Data (Restore)
1. Klik tombol **Import Data**.
2. Pilih file JSON hasil ekspor sebelumnya.
3. Konfirmasi peringatan (Data lama akan tertimpa).
4. Data barang Anda akan kembali pulih 100%.

---

## 🚀 Cara Penggunaan

Karena aplikasi ini bersifat *standalone*, Anda hanya perlu:
1. Copy script HTML yang tersedia.
2. Simpan sebagai file `.html` (contoh: `index.html`).
3. Pastikan Anda memiliki akses internet (untuk memuat CDN FontAwesome & html2canvas).
4. Jalankan di browser pilihan Anda (Chrome/Edge direkomendasikan).

---

## 🎨 Kustomisasi Logo Invoice
Untuk mengubah logo toko pada invoice, cari bagian berikut di dalam kode HTML:
```html
<img src="logo.png" alt="Logo Toko" id="invLogoImg">
