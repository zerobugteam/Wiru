/**
 * Smart Aquaculture IoT System - Prototype & Simulator
 * ZeroBug Team x SMKS Perikanan dan Kelautan Puger
 */

// --- Global State ---
const state = {
  role: 'guru', // 'admin', 'guru', 'siswa'
  isOnline: true,
  autoStream: true,
  packetCount: 124,
  offlineBuffer: 0,
  currentPond: 'Kolam A',
  sensors: {
    temp: 28.5,
    ph: 7.4,
    salinity: 18,
    do: 5.4,
    turbidity: 32
  },
  thresholds: {
    doMin: 5.0,
    tempMin: 26.0,
    tempMax: 31.0,
    phMin: 7.0,
    phMax: 8.5,
    salinityMin: 15,
    salinityMax: 25,
    turbidityMax: 50
  },
  actuators: {
    aerator: false,
    pump: false,
    feederAuto: true
  },
  logs: [
    { time: '14:00:00', event: 'Sistem Terhubung', param: 'DO: 5.2 mg/L', action: 'Monitoring Berkala Aktif', status: 'Normal' },
    { time: '14:10:00', event: 'Oksigen Kolam Menurun', param: 'DO: 4.6 mg/L', action: 'Aerator Otomatis ON & Notifikasi WA Terkirim', status: 'Peringatan' },
    { time: '14:40:00', event: 'Oksigen Kembali Stabil', param: 'DO: 5.4 mg/L', action: 'Aerator Mati Otomatis', status: 'Normal' }
  ]
};

let chartInstance = null;
let streamInterval = null;
let liveClockInterval = null;

// --- Inisialisasi Saat Dokumen Siap ---
document.addEventListener('DOMContentLoaded', () => {
  initLucide();
  initClock();
  initTabs();
  initChart();
  initControls();
  initSliders();
  initScenarios();
  initTerminal();
  renderLogs();
  applyRolePermissions();
  startAutoStream();

  console.log("ZeroBug Aquaculture IoT Simulator Ready.");
});

function initLucide() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// --- Live Clock Real-Time ---
function initClock() {
  const clockEl = document.getElementById('liveClock');
  function update() {
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  }
  update();
  liveClockInterval = setInterval(update, 1000);
}

// --- Tab Navigation ---
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
      });

      const activeContent = document.getElementById(targetId);
      if (activeContent) {
        activeContent.classList.remove('hidden');
      }

      // Re-trigger Chart resize and Lucide icons
      if (targetId === 'tab-dashboard' && chartInstance) {
        chartInstance.resize();
      }
      initLucide();
    });
  });
}

// --- Inisialisasi Chart.js ---
function initChart() {
  const ctx = document.getElementById('aquacultureChart').getContext('2d');

  const initialLabels = ['13:30', '13:40', '13:50', '14:00', '14:10', '14:20', '14:30', '14:40', 'Sekarang'];
  const doData = [5.3, 5.2, 5.1, 5.2, 4.6, 4.7, 5.1, 5.4, state.sensors.do];
  const tempData = [28.2, 28.4, 28.4, 28.5, 28.6, 28.6, 28.5, 28.5, state.sensors.temp];

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: initialLabels,
      datasets: [
        {
          label: 'Oksigen Terlarut (DO)',
          data: doData,
          borderColor: '#22d3ee', // Cyan 400
          backgroundColor: 'rgba(34, 211, 238, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#06b6d4',
          yAxisID: 'y'
        },
        {
          label: 'Suhu Air (°C)',
          data: tempData,
          borderColor: '#fb7185', // Rose 400
          borderDash: [4, 4],
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#f43f5e',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + (context.datasetIndex === 0 ? ' mg/L' : ' °C');
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(51, 65, 85, 0.3)'
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 10 }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          min: 2,
          max: 9,
          title: {
            display: true,
            text: 'Oksigen DO (mg/L)',
            color: '#22d3ee',
            font: { size: 11, weight: 'bold' }
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.3)'
          },
          ticks: {
            color: '#22d3ee'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 22,
          max: 36,
          title: {
            display: true,
            text: 'Suhu (°C)',
            color: '#fb7185',
            font: { size: 11, weight: 'bold' }
          },
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#fb7185'
          }
        }
      }
    }
  });

  document.getElementById('clearChartBtn').addEventListener('click', () => {
    chartInstance.data.labels = ['Sekarang'];
    chartInstance.data.datasets[0].data = [state.sensors.do];
    chartInstance.data.datasets[1].data = [state.sensors.temp];
    chartInstance.update();
    showToast('Grafik berhasil di-reset.', 'info');
  });
}

// Update grafik dengan data terbaru
function pushDataToChart(doVal, tempVal) {
  if (!chartInstance) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  chartInstance.data.labels.push(timeStr);
  chartInstance.data.datasets[0].data.push(doVal);
  chartInstance.data.datasets[1].data.push(tempVal);

  if (chartInstance.data.labels.length > 15) {
    chartInstance.data.labels.shift();
    chartInstance.data.datasets[0].data.shift();
    chartInstance.data.datasets[1].data.shift();
  }

  chartInstance.update();
  document.getElementById('chartLastUpdated').innerText = `Diperbarui: ${timeStr} WIB`;
}

// --- Kontrol Perangkat & Aktuator ---
function initControls() {
  const switchAerator = document.getElementById('switchAerator');
  const switchPump = document.getElementById('switchPump');
  const switchFeeder = document.getElementById('switchFeeder');
  const btnFeedNow = document.getElementById('btnFeedNow');
  const roleSelect = document.getElementById('userRoleSelector');
  const pondSelect = document.getElementById('pondSelector');
  const dismissAlertBtn = document.getElementById('dismissAlertBtn');

  // Aerator Switch
  switchAerator.addEventListener('change', (e) => {
    setAeratorState(e.target.checked, 'Manual oleh ' + state.role.toUpperCase());
  });

  // Pump Switch
  switchPump.addEventListener('change', (e) => {
    state.actuators.pump = e.target.checked;
    updateActuatorVisuals();
    logEvent(e.target.checked ? 'Pompa Sirkulasi Dinyalakan' : 'Pompa Sirkulasi Dimatikan', '-', 'Manual switch');
    showToast(e.target.checked ? 'Pompa sirkulasi aktif' : 'Pompa sirkulasi berhenti', 'info');
  });

  // Feeder Auto Switch
  switchFeeder.addEventListener('change', (e) => {
    state.actuators.feederAuto = e.target.checked;
    logEvent(e.target.checked ? 'Jadwal Pakan Diaktifkan' : 'Jadwal Pakan Dinonaktifkan', 'Timer: 3x/hari', 'Setting');
  });

  // Feed Now Manual Button
  btnFeedNow.addEventListener('click', () => {
    dispenseFeed();
  });

  // Role Selector
  roleSelect.addEventListener('change', (e) => {
    state.role = e.target.value;
    applyRolePermissions();
    showToast(`Beralih ke peran: ${e.target.selectedOptions[0].text}`, 'info');
  });

  // Pond Selector
  pondSelect.addEventListener('change', (e) => {
    state.currentPond = e.target.value;
    logTerminal(`[APP] Memuat konfigurasi dan telemetri ${state.currentPond}...`, 'text-cyan-400');
    showToast(`Memantau: ${state.currentPond}`, 'info');
  });

  // Dismiss alert
  dismissAlertBtn.addEventListener('click', () => {
    document.getElementById('dynamicAlertBanner').classList.add('hidden');
  });

  // Test WA
  document.getElementById('btnSendTestWA').addEventListener('click', () => {
    sendMockWhatsAppAlert("🧪 Uji Coba Notifikasi Gateway ZeroBug IoT: Sistem Beroperasi Normal.");
    showToast("Pesan uji coba dikirim ke chat preview", "success");
  });
}

function setAeratorState(isActive, triggerReason = 'Otomatisasi') {
  state.actuators.aerator = isActive;
  document.getElementById('switchAerator').checked = isActive;
  updateActuatorVisuals();

  logEvent(
    isActive ? 'Aerator / Kincir Menyala' : 'Aerator / Kincir Mati',
    `DO: ${state.sensors.do} mg/L`,
    triggerReason,
    isActive ? (state.sensors.do < state.thresholds.doMin ? 'Peringatan' : 'Manual') : 'Normal'
  );

  logTerminal(`[RELAY] GPIO23 -> Aerator ${isActive ? 'HIGH (ON)' : 'LOW (OFF)'} [${triggerReason}]`, isActive ? 'text-amber-300' : 'text-slate-400');
}

function updateActuatorVisuals() {
  const iconAerator = document.getElementById('iconAerator');
  const iconAeratorBg = document.getElementById('iconAeratorBg');
  const iconPump = document.getElementById('iconPump');
  const iconPumpBg = document.getElementById('iconPumpBg');

  if (state.actuators.aerator) {
    iconAeratorBg.classList.remove('bg-slate-800', 'text-slate-400');
    iconAeratorBg.classList.add('bg-cyan-500/20', 'text-cyan-400');
    iconAerator.classList.add('animate-spin-slow');
    document.getElementById('subAeratorStatus').innerText = 'Status: Berputar (Aktif)';
  } else {
    iconAeratorBg.classList.remove('bg-cyan-500/20', 'text-cyan-400');
    iconAeratorBg.classList.add('bg-slate-800', 'text-slate-400');
    iconAerator.classList.remove('animate-spin-slow');
    document.getElementById('subAeratorStatus').innerText = 'Otomatisasi: Aktif saat DO < 5.0';
  }

  if (state.actuators.pump) {
    iconPumpBg.classList.remove('bg-slate-800', 'text-slate-400');
    iconPumpBg.classList.add('bg-emerald-500/20', 'text-emerald-400');
    iconPump.classList.add('animate-spin');
  } else {
    iconPumpBg.classList.remove('bg-emerald-500/20', 'text-emerald-400');
    iconPumpBg.classList.add('bg-slate-800', 'text-slate-400');
    iconPump.classList.remove('animate-spin');
  }
}

function dispenseFeed() {
  const btn = document.getElementById('btnFeedNow');
  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Memutar Motor Feeder (250g)...`;
  initLucide();

  logTerminal(`[FEEDER] PWM Servo GPIO18 menggerakkan ulir pakan (250 gram)...`, 'text-emerald-400');

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i> Beri Pakan Sekarang (Dispense 250g)`;
    initLucide();
    logEvent('Pemberian Pakan Selesai', 'Takaran: 250 gram', 'Dispenser Sukses', 'Normal');
    showToast('Pakan 250 gram telah dikeluarkan ke kolam.', 'success');
  }, 2000);
}

// --- Role Permissions ---
function applyRolePermissions() {
  const isSiswa = state.role === 'siswa';
  const roleBadge = document.getElementById('roleBadgeControl');

  const switchAerator = document.getElementById('switchAerator');
  const switchPump = document.getElementById('switchPump');
  const switchFeeder = document.getElementById('switchFeeder');
  const btnFeedNow = document.getElementById('btnFeedNow');

  switchAerator.disabled = isSiswa;
  switchPump.disabled = isSiswa;
  switchFeeder.disabled = isSiswa;
  btnFeedNow.disabled = isSiswa;

  if (isSiswa) {
    roleBadge.innerText = 'Siswa (Read-Only)';
    roleBadge.className = 'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30';
    btnFeedNow.classList.add('opacity-50', 'cursor-not-allowed');
  } else if (state.role === 'admin') {
    roleBadge.innerText = 'Admin (Full Access)';
    roleBadge.className = 'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30';
    btnFeedNow.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    roleBadge.innerText = 'Guru / Teknisi';
    roleBadge.className = 'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30';
    btnFeedNow.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

// --- Manual Sliders Sensor & Logic Evaluator ---
function initSliders() {
  const sliderDO = document.getElementById('simSliderDO');
  const sliderTemp = document.getElementById('simSliderTemp');
  const sliderPH = document.getElementById('simSliderPH');
  const sliderSalinity = document.getElementById('simSliderSalinity');

  sliderDO.addEventListener('input', (e) => {
    state.sensors.do = parseFloat(e.target.value);
    document.getElementById('sliderValDO').innerText = state.sensors.do.toFixed(1) + ' mg/L';
    evaluateSystemRules();
  });

  sliderTemp.addEventListener('input', (e) => {
    state.sensors.temp = parseFloat(e.target.value);
    document.getElementById('sliderValTemp').innerText = state.sensors.temp.toFixed(1) + ' °C';
    evaluateSystemRules();
  });

  sliderPH.addEventListener('input', (e) => {
    state.sensors.ph = parseFloat(e.target.value);
    document.getElementById('sliderValPH').innerText = state.sensors.ph.toFixed(1);
    evaluateSystemRules();
  });

  sliderSalinity.addEventListener('input', (e) => {
    state.sensors.salinity = parseInt(e.target.value);
    document.getElementById('sliderValSalinity').innerText = state.sensors.salinity + ' ppt';
    evaluateSystemRules();
  });
}

// Evaluasi aturan otomasi sesuai Dokumen Proposal Bab 5 & 6
function evaluateSystemRules() {
  updateDashboardCards();

  const doVal = state.sensors.do;
  const tempVal = state.sensors.temp;
  const alertBanner = document.getElementById('dynamicAlertBanner');
  const alertTitle = document.getElementById('alertTitle');
  const alertDesc = document.getElementById('alertDescription');

  let hasCriticalIssue = false;

  // Rule 1: DO < 5.0 mg/L -> Otomatisasi Aerator Hidup & Notifikasi WA
  if (doVal < state.thresholds.doMin) {
    hasCriticalIssue = true;
    if (!state.actuators.aerator) {
      setAeratorState(true, 'Otomatis (DO Kritis < 5.0 mg/L)');
      sendMockWhatsAppAlert(`⚠️ DARURAT OKSIGEN! Kadar DO ${state.currentPond} turun menjadi ${doVal.toFixed(1)} mg/L (Batas aman: 5.0 mg/L). Aerator diaktifkan otomatis.`);
      showToast(`Peringatan: Oksigen Rendah (${doVal.toFixed(1)} mg/L)! Aerator dihidupkan.`, 'danger');
    }
    alertBanner.className = 'rounded-xl border border-red-500/50 bg-red-950/40 p-4 transition-all duration-300 flex items-start gap-4';
    alertTitle.innerText = `PERINGATAN KRITIS: OKSIGEN TERLARUT RENDAH (${doVal.toFixed(1)} mg/L)`;
    alertDesc.innerText = `Kadar oksigen di bawah ambang aman 5.0 mg/L. Aerator kincir otomatis diaktifkan untuk mencegah stres/kematian ikan. Notifikasi terkirim via WhatsApp guru.`;
    alertBanner.classList.remove('hidden');
  } 
  // Rule 2: DO >= 5.4 mg/L -> Hysteresis: Matikan aerator otomatis jika sebelumnya aktif karena otomasi
  else if (doVal >= 5.4 && state.actuators.aerator) {
    setAeratorState(false, 'Otomatis (Kondisi DO Stabil & Hemat Energi)');
    sendMockWhatsAppAlert(`✅ INFO STABIL: Kadar oksigen ${state.currentPond} kembali aman (${doVal.toFixed(1)} mg/L). Aerator dimatikan otomatis.`);
    showToast(`Oksigen kembali stabil (${doVal.toFixed(1)} mg/L). Aerator dimatikan.`, 'success');
    alertBanner.classList.add('hidden');
  } else if (!hasCriticalIssue) {
    alertBanner.classList.add('hidden');
  }

  // Update visual kartu sensor
  updateCardBadges();
}

function updateDashboardCards() {
  document.getElementById('val-temp').innerText = state.sensors.temp.toFixed(1);
  document.getElementById('val-ph').innerText = state.sensors.ph.toFixed(1);
  document.getElementById('val-salinity').innerText = state.sensors.salinity;
  document.getElementById('val-do').innerText = state.sensors.do.toFixed(1);
  document.getElementById('val-turbidity').innerText = state.sensors.turbidity;
}

function updateCardBadges() {
  // DO Badge
  const badgeDO = document.getElementById('badge-do');
  if (state.sensors.do < 4.5) {
    badgeDO.innerText = 'Bahaya';
    badgeDO.className = 'status-badge bg-red-500/20 text-red-400 border border-red-500/30';
  } else if (state.sensors.do < 5.0) {
    badgeDO.innerText = 'Rendah';
    badgeDO.className = 'status-badge bg-amber-500/20 text-amber-400 border border-amber-500/30';
  } else {
    badgeDO.innerText = 'Normal';
    badgeDO.className = 'status-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  }

  // Suhu Badge
  const badgeTemp = document.getElementById('badge-temp');
  if (state.sensors.temp > 32.0 || state.sensors.temp < 24.0) {
    badgeTemp.innerText = 'Abnormal';
    badgeTemp.className = 'status-badge bg-amber-500/20 text-amber-400 border border-amber-500/30';
  } else {
    badgeTemp.innerText = 'Normal';
    badgeTemp.className = 'status-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  }
}

// --- Skenario Interaktif Sesuai Dokumen Proposal ---
function initScenarios() {
  // Skenario 1: Drop Oksigen (Proposal Hal 3: Contoh Skenario)
  document.getElementById('scenarioDropOxygen').addEventListener('click', () => {
    state.sensors.do = 4.6;
    document.getElementById('simSliderDO').value = 4.6;
    document.getElementById('sliderValDO').innerText = '4.6 mg/L';
    logTerminal('[SCENARIO] Simulasi: Oksigen terlarut kolam merosot ke 4.6 mg/L!', 'text-rose-400 font-bold');
    evaluateSystemRules();
    pushDataToChart(4.6, state.sensors.temp);
  });

  // Skenario 2: Jadwal Pakan Tiba
  document.getElementById('scenarioFeedSchedule').addEventListener('click', () => {
    logTerminal('[SCENARIO] Trigger timer pakan otomatis jadwal 11:30 WIB...', 'text-cyan-400 font-bold');
    dispenseFeed();
  });

  // Skenario 3: Koneksi Terputus (Offline mode & buffering)
  document.getElementById('scenarioNetworkCut').addEventListener('click', () => {
    toggleNetworkConnection();
  });

  // Skenario 4: Pulihkan Kondisi Normal
  document.getElementById('scenarioRestoreNormal').addEventListener('click', () => {
    state.sensors.do = 5.4;
    state.sensors.temp = 28.5;
    state.sensors.ph = 7.4;
    state.sensors.salinity = 18;

    document.getElementById('simSliderDO').value = 5.4;
    document.getElementById('sliderValDO').innerText = '5.4 mg/L';
    document.getElementById('simSliderTemp').value = 28.5;
    document.getElementById('sliderValTemp').innerText = '28.5 °C';
    document.getElementById('simSliderPH').value = 7.4;
    document.getElementById('sliderValPH').innerText = '7.4';
    document.getElementById('simSliderSalinity').value = 18;
    document.getElementById('sliderValSalinity').innerText = '18 ppt';

    if (!state.isOnline) {
      toggleNetworkConnection(true);
    }

    logTerminal('[SCENARIO] Parameter dipulihkan ke ambang normal dan sehat.', 'text-emerald-400 font-bold');
    evaluateSystemRules();
    pushDataToChart(5.4, 28.5);
    showToast('Kondisi kolam dinormalkan.', 'success');
  });

  // Auto-Random Stream Toggle
  const btnToggleStream = document.getElementById('btnToggleRandomStream');
  btnToggleStream.addEventListener('click', () => {
    state.autoStream = !state.autoStream;
    if (state.autoStream) {
      btnToggleStream.className = 'px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition flex items-center gap-1.5';
      btnToggleStream.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5"></i> Berjalan`;
      showToast('Data stream otomatis diaktifkan', 'info');
    } else {
      btnToggleStream.className = 'px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5';
      btnToggleStream.innerHTML = `<i data-lucide="pause" class="w-3.5 h-3.5"></i> Dijeda`;
      showToast('Data stream otomatis dijeda', 'info');
    }
    initLucide();
  });
}

function toggleNetworkConnection(forceOnline = false) {
  state.isOnline = forceOnline ? true : !state.isOnline;
  const badge = document.getElementById('connectionStatusBadge');
  const text = document.getElementById('connectionStatusText');

  if (state.isOnline) {
    badge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium';
    badge.innerHTML = `
      <span class="relative flex h-2.5 w-2.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <span>ESP32: Online (Wi-Fi)</span>
    `;
    logTerminal(`[WIFI] Terkoneksi kembali ke AP! Mengirim ${state.offlineBuffer} data cache yang tertunda...`, 'text-emerald-400');
    if (state.offlineBuffer > 0) {
      showToast(`Koneksi pulih. ${state.offlineBuffer} data cache berhasil disinkronisasi ke server MySQL!`, 'success');
      state.packetCount += state.offlineBuffer;
      state.offlineBuffer = 0;
      document.getElementById('offlineBufferCount').innerText = '0';
      document.getElementById('packetCount').innerText = state.packetCount;
    }
  } else {
    badge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-medium';
    badge.innerHTML = `
      <span class="relative flex h-2.5 w-2.5">
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
      </span>
      <span>ESP32: Offline (Caching Lokal)</span>
    `;
    logTerminal(`[WIFI] Internet Terputus! ESP32 mengalihkan penyimpanan ke Flash SPIFFS...`, 'text-amber-400');
    showToast('Internet terputus! Data disimpan sementara di memori internal ESP32.', 'warning');
  }
}

// --- Data Stream Otomatis (Interval 5 Detik) ---
function startAutoStream() {
  streamInterval = setInterval(() => {
    if (!state.autoStream) return;

    if (state.isOnline) {
      // Fluktuasi natural kecil
      const dDO = (Math.random() - 0.48) * 0.05;
      const dTemp = (Math.random() - 0.5) * 0.05;

      // Jaga dalam range jika tidak sedang dipaksa skenario
      if (state.sensors.do > 4.7 && state.sensors.do < 6.5) {
        state.sensors.do = parseFloat(Math.max(3.0, Math.min(8.0, state.sensors.do + dDO)).toFixed(2));
      }
      state.sensors.temp = parseFloat(Math.max(25.0, Math.min(34.0, state.sensors.temp + dTemp)).toFixed(1));

      evaluateSystemRules();
      pushDataToChart(state.sensors.do, state.sensors.temp);

      state.packetCount++;
      document.getElementById('packetCount').innerText = state.packetCount;

      logTerminal(`[MQTT PUSH] topic: "zerobug/puger/kolamA/telemetry" payload: {"do":${state.sensors.do},"temp":${state.sensors.temp},"ph":${state.sensors.ph}}`, 'text-slate-500');
    } else {
      // Mode offline: bertambah di buffer
      state.offlineBuffer++;
      document.getElementById('offlineBufferCount').innerText = state.offlineBuffer;
      logTerminal(`[SPIFFS CACHE] Menyimpan record #${state.offlineBuffer} di memori lokal ESP32...`, 'text-amber-400/80');
    }
  }, 5000);
}

// --- Terminal Logger ---
function initTerminal() {
  document.getElementById('btnClearTerminal').addEventListener('click', () => {
    document.getElementById('espTerminalOutput').innerHTML = '<div class="text-slate-500">[TERMINAL CLEARED]</div>';
  });

  document.getElementById('btnManualPush').addEventListener('click', () => {
    state.packetCount++;
    document.getElementById('packetCount').innerText = state.packetCount;
    logTerminal(`[MQTT MANUAL] Paket telemetri dikirim langsung oleh pengguna.`, 'text-cyan-400');
    showToast('Paket telemetri berhasil di-push ke server.', 'info');
  });
}

function logTerminal(message, colorClass = 'text-slate-400') {
  const terminal = document.getElementById('espTerminalOutput');
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID');
  const line = document.createElement('div');
  line.className = colorClass;
  line.innerText = `${timeStr} ${message}`;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

// --- Event Logs & Export CSV ---
function logEvent(event, param, action, status = 'Normal') {
  const now = new Date();
  const time = now.toLocaleTimeString('id-ID');

  const newLog = { time, event, param, action, status };
  state.logs.unshift(newLog);
  if (state.logs.length > 30) state.logs.pop();

  renderLogs();
}

function renderLogs() {
  const tbody = document.getElementById('logsTableBody');
  tbody.innerHTML = '';

  state.logs.forEach(log => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/40 transition';

    let statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">Normal</span>';
    if (log.status === 'Peringatan') {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">Peringatan</span>';
    } else if (log.status === 'Manual') {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">Manual</span>';
    }

    tr.innerHTML = `
      <td class="p-3 text-slate-400">${log.time}</td>
      <td class="p-3 font-semibold text-white">${log.event}</td>
      <td class="p-3 text-cyan-300">${log.param}</td>
      <td class="p-3 text-slate-300">${log.action}</td>
      <td class="p-3">${statusBadge}</td>
    `;
    tbody.appendChild(tr);
  });

  // Export CSV Handler
  document.getElementById('btnExportCSV').onclick = exportLogsToCSV;
  document.getElementById('btnClearLogs').onclick = () => {
    state.logs = [];
    renderLogs();
    showToast('Log riwayat dikosongkan.', 'info');
  };
}

function exportLogsToCSV() {
  let csv = 'Waktu,Kejadian,Parameter,Aksi Sistem,Status\n';
  state.logs.forEach(l => {
    csv += `"${l.time}","${l.event}","${l.param}","${l.action}","${l.status}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan_kualitas_air_smk_puger_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('File CSV laporan berhasil diunduh.', 'success');
}

// --- WhatsApp Mockup Preview ---
function sendMockWhatsAppAlert(message) {
  const preview = document.getElementById('previewNotifText');
  preview.innerText = message;

  const chatBubble = document.getElementById('dynamicChatBubble');
  const chatText = document.getElementById('chatAlertText');
  const chatTime = document.getElementById('chatAlertTime');

  chatText.innerHTML = message.replace(/\n/g, '<br>');
  chatTime.innerText = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  chatBubble.classList.remove('hidden');
}

// --- Toast Notification System ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');

  let borderBg = 'bg-slate-800 border-slate-700 text-slate-200';
  let iconName = 'info';

  if (type === 'success') {
    borderBg = 'bg-slate-900 border-emerald-500/50 text-emerald-300';
    iconName = 'check-circle';
  } else if (type === 'danger') {
    borderBg = 'bg-slate-900 border-red-500/50 text-red-300';
    iconName = 'alert-triangle';
  } else if (type === 'warning') {
    borderBg = 'bg-slate-900 border-amber-500/50 text-amber-300';
    iconName = 'alert-circle';
  }

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-medium pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0 ${borderBg}`;
  toast.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i><span>${message}</span>`;

  container.appendChild(toast);
  initLucide();

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
