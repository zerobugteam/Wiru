# 🐟 WIRU: Water Intelligence for Raising Underwater life

> **Prototipe Interaktif & Simulator Sistem Akuakultur Pintar Berbasis Internet of Things**  
> Representasi digital sistem *"Perikanan Cerdas Berbasis IoT"* untuk **SMKS Perikanan dan Kelautan Puger**.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Web%20%26%20IoT-blue.svg)](#)
[![Education](https://img.shields.io/badge/Target-Edukasi%20Vokasi-orange.svg)](#)

</div>

---

## 🚀 Fitur Utama Sesuai Dokumen Proposal

1. **Dashboard Monitoring Real-Time (Gambar 4 Proposal)**
   * Menampilkan pembacaan 5 parameter kualitas air: **Suhu Air (°C)**, **pH Air**, **Salinitas (ppt)**, **Oksigen Terlarut DO (mg/L)**, dan **Kekeruhan (NTU)**.
   * Grafik riwayat waktu nyata (*Chart.js*) dengan garis batas kritis Oksigen Terlarut ($5.0\text{ mg/L}$).
   * Kendali perangkat aktuator relai kolam: Aerator/kincir air, pompa sirkulasi air, dan pakan ikan otomatis (*auto-feeder*).

2. **Simulator Sensor & Pengujian Skenario Lapangan (Bab 5 & 6)**
   * **Skenario 1 (Oksigen Drop < 5.0 mg/L)**: Menstimulasikan DO turun ke $4.6\text{ mg/L}$, sistem seketika menyalakan kincir aerator dan mengirim pesan peringatan otomatis.
   * **Skenario 2 (Jadwal Pakan Tiba)**: Aktuasi motor feeder mengeluarkan pakan $250\text{ gram}$.
   * **Skenario 3 (Wi-Fi Terputus / Gangguan Jaringan)**: Menguji fitur ketahanan *offline buffer/caching* internal ESP32, lalu sinkronisasi otomatis saat internet pulih.
   * **Skenario 4 (Normalisasi)**: Mengembalikan kondisi parameter kolam ke batas aman stabil ($5.4\text{ mg/L}$) yang mematikan aerator otomatis (*energy saving*).
   * Sliders manual untuk menguji rentang ekstrem suhu, pH, DO, dan salinitas.

3. **Diagram 4 Lapisan Sistem Dinamis (Gambar 1 Proposal)**
   * Lapisan 1: Perangkat Fisik (Sensor DS18B20, pH-4502C, DO probe, ESP32, Relay 30A)
   * Lapisan 2: Transmisi Jaringan (Wi-Fi 2.4GHz, MQTT Broker, TLS/HTTPS)
   * Lapisan 3: Server & Database (Laravel REST API, MySQL, Automation Rule Engine)
   * Lapisan 4: Pengguna (Dashboard Web, Mobile App Flutter, Bot WhatsApp/Telegram)

4. **Multi-Role & Hak Akses Pengguna**
   * **Admin**: Konfigurasi penuh batas aman & jadwal.
   * **Guru / Teknisi**: Pengendalian operasional aktuator, menerima alert WhatsApp, dan unduh laporan.
   * **Siswa**: Mode *read-only* pengamatan grafik & sarana praktikum edukasi.

5. **Log Riwayat (*Audit Trail*) & Ekspor CSV**
   * Pencatatan riwayat anomali dan otomatisasi yang dapat diekspor langsung ke file `.csv`.

6. **Trainer Kit Siswa (Edukasi Vokasi)**
   * Modul kurikulum praktik (Kalibrasi probe, Logika hysteresis ESP32, dan Transmisi MQTT).

---

## 💻 Cara Menjalankan

### Cara 1: Menggunakan Python Server (Direkomendasikan)
Jalankan perintah berikut di terminal:
```bash
python server.py
```
Browser akan otomatis terbuka di `http://localhost:8080/index.html`.

### Cara 2: Langsung Buka di Browser
Cukup klik dua kali (atau *double-click*) file `index.html` pada File Explorer untuk membukanya di browser Google Chrome / Microsoft Edge.
