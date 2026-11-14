<div align="center">

  <!-- Tech Badge Header -->
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js">
  <img src="https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mosquitto&logoColor=white" alt="MQTT">

  <br><br>

  <!-- Project Title -->
  <h1>🐟 Wiru : Water Intelligence for Raising Underwater life</h1>

  <p><strong>Prototipe Interaktif & Simulator Sistem Akuakultur Pintar Berbasis Internet of Things</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square">
    <img src="https://img.shields.io/badge/Status-Prototype-green?style=flat-square">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square">
  </p>

</div>

---

## 🚀 Tentang Project

**Wiru** adalah aplikasi web interaktif yang dibuat sebagai ilustrasi dan representasi langsung dari dokumen proposal:  
📄 *"Proposal_IoT_SMK-Perikanan_Puger_ZeroBugTeam.pdf"* **(Perikanan Cerdas Berbasis Internet of Things)**.

Dikembangkan oleh **ZeroBug Team** bekerja sama dengan **SMKS Perikanan dan Kelautan Puger**, platform ini menyediakan simulasi real-time untuk monitoring kualitas air dan kontrol aktuator kolam ikan. Sistem ini mengusung arsitektur 4 lapisan (Perangkat Fisik, Transmisi Jaringan, Server & Database, serta Pengguna) yang siap diimplementasikan pada hardware ESP32.

Cocok untuk:
- 📊 Monitoring 5 parameter kualitas air real-time (Suhu, pH, Salinitas, DO, Kekeruhan)
- 🎮 Simulasi dan pengujian skenario lapangan (Oksigen drop, Wi-Fi putus, dll)
- ⚙️ Kendali aktuator otomatis (Aerator, Pompa Sirkulasi, Auto-Feeder)
- 🎓 Media edukasi dan praktikum vokasi (Trainer Kit Siswa)
- 👥 Manajemen akses multi-role (Admin, Guru/Teknisi, Siswa)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📊 **Dashboard Real-Time** | Visualisasi data Suhu, pH, Salinitas, Oksigen Terlarut (DO), dan Kekeruhan menggunakan Chart.js |
| 🎮 **Simulator Skenario** | Pengujian kondisi ekstrem: Oksigen Drop (<5.0 mg/L), Jadwal Pakan, Wi-Fi Terputus (Offline Buffer), dan Normalisasi |
| ⚙️ **Kontrol Aktuator** | Simulasi kendali relai untuk Aerator/Kincir, Pompa Sirkulasi, dan Motor Pakan (Feeder) |
| 👥 **Multi-Role Access** | Hak akses berbeda: Admin (Konfigurasi), Guru/Teknisi (Operasional & Alert), Siswa (Read-only praktikum) |
| 📁 **Audit Trail & Ekspor** | Pencatatan riwayat anomali dan otomatisasi yang dapat diekspor langsung ke format `.csv` |
| 🎓 **Trainer Kit Digital** | Modul kurikulum praktik: Kalibrasi probe, Logika hysteresis ESP32, dan Transmisi MQTT |
| 📱 **Responsive Design** | Tampilan antarmuka modern yang optimal di desktop, tablet, dan mobile |
| 📡 **Arsitektur 4 Lapisan** | Desain sistem yang memisahkan Hardware, Network, Backend (Laravel/MySQL), dan User Interface |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | HTML5, JavaScript (ES6+), CSS3 |
| **Styling & UI** | Tailwind CSS / Bootstrap 5, Chart.js |
| **Backend (Referensi)** | Laravel (PHP) REST API |
| **Database** | MySQL / MariaDB |
| **Komunikasi IoT** | MQTT Broker, HTTPS, Wi-Fi 2.4GHz |
| **Hardware (Referensi)** | ESP32, Sensor DS18B20, pH-4502C, DO Probe, Relay 30A |
| **Version Control** | Git & GitHub |

---
