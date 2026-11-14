/**
 * WIRU - Water Intelligence for Raising Underwater life
 * SMKS Perikanan dan Kelautan Puger
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
    ph: 7.40,
    salinity: 18,
    do: 5.40,
    turbidity: 32
  },
  thresholds: {
    doMin: 5.00,
    tempMin: 26.0,
    tempMax: 31.0,
    phMin: 7.00,
    phMax: 8.50,
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
    { time: '14:00:00', event: 'Sistem Terhubung', param: 'DO: 5.20 mg/L', action: 'Monitoring Berkala Aktif', status: 'Normal' },
    { time: '14:10:00', event: 'Oksigen Kolam Menurun', param: 'DO: 4.60 mg/L', action: 'Aerator Otomatis ON & Notifikasi WA Terkirim', status: 'Peringatan' },
    { time: '14:40:00', event: 'Oksigen Kembali Stabil', param: 'DO: 5.40 mg/L', action: 'Aerator Mati Otomatis', status: 'Normal' }
  ]
};

let chartInstance = null;
let streamInterval = null;
let liveClockInterval = null;
let siloRemainingKg = 15.6;

// --- Inisialisasi Saat Dokumen Siap ---
document.addEventListener('DOMContentLoaded', () => {
  try { initThemeToggle(); } catch (e) { console.warn('Theme error:', e); }
  try { initLucide(); } catch (e) { console.warn('Lucide error:', e); }
  try { initClock(); } catch (e) { console.warn('Clock error:', e); }
  try { initTabs(); } catch (e) { console.warn('Tabs error:', e); }
  try { initMobileTabs(); } catch (e) { console.warn('Mobile tabs error:', e); }
  try { initChart(); } catch (e) { console.warn('Chart error:', e); }
  try { initControls(); } catch (e) { console.warn('Controls error:', e); }
  try { initSliders(); } catch (e) { console.warn('Sliders error:', e); }
  try { initScenarios(); } catch (e) { console.warn('Scenarios error:', e); }
  try { initTerminal(); } catch (e) { console.warn('Terminal error:', e); }
  try { initHardwareView(); } catch (e) { console.warn('Hardware view error:', e); }
  try { renderLogs(); } catch (e) { console.warn('Logs error:', e); }
  try { applyRolePermissions(); } catch (e) { console.warn('Role permissions error:', e); }
  try { startAutoStream(); } catch (e) { console.warn('Auto stream error:', e); }

  console.log("WIRU (Water Intelligence for Raising Underwater life) Simulator Ready.");
});

function initLucide() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// --- Mobile Sidebar Toggle ---
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebarNav');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar) return;

  const isOpen = !sidebar.classList.contains('-translate-x-full');
  if (isOpen) {
    sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  } else {
    sidebar.classList.remove('-translate-x-full');
    if (backdrop) backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

// --- Mobile Tab Navigation ---
function initMobileTabs() {
  const mobileTabs = document.querySelectorAll('.mobile-tab');
  const sidebarTabs = document.querySelectorAll('.nav-tab');

  mobileTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute('data-tab');

      // Sync mobile tabs active state
      mobileTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Sync sidebar tabs active state
      sidebarTabs.forEach(t => {
        t.classList.remove('active');
        if (t.getAttribute('data-tab') === targetId) {
          t.classList.add('active');
        }
      });

      // Switch tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
      });
      const activeContent = document.getElementById(targetId);
      if (activeContent) {
        activeContent.classList.remove('hidden');
      }

      // Re-trigger Chart resize and Lucide icons
      if ((targetId === 'tab-cockpit' || targetId === 'tab-correlation') && chartInstance) {
        setTimeout(() => chartInstance.resize(), 50);
      }
      initLucide();
    });
  });
}

// --- Manajemen Tema Terang / Gelap (Light & Dark Theme) ---
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function initThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('wiru_theme') || 'dark';
  applyTheme(savedTheme, false);

  if (btn) {
    btn.addEventListener('click', () => {
      const current = getCurrentTheme();
      const nextTheme = current === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme, true);
    });
  }
}

function applyTheme(theme, showNotification = false) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('wiru_theme', theme); } catch (e) {}

  const icon = document.getElementById('themeToggleIcon');
  const text = document.getElementById('themeToggleText');
  const btn = document.getElementById('themeToggleBtn');

  if (theme === 'light') {
    if (icon) {
      icon.setAttribute('data-lucide', 'moon');
      icon.className = 'w-3.5 h-3.5 text-indigo-500';
    }
    if (text) text.innerText = 'Gelap';
    if (btn) btn.title = 'Ubah ke Tema Gelap (Dark Mode)';
  } else {
    if (icon) {
      icon.setAttribute('data-lucide', 'sun');
      icon.className = 'w-3.5 h-3.5 text-amber-400';
    }
    if (text) text.innerText = 'Terang';
    if (btn) btn.title = 'Ubah ke Tema Terang (Light Mode)';
  }

  initLucide();
  applyChartTheme(theme);

  if (showNotification) {
    showToast(theme === 'light' ? 'Mode Terang diaktifkan.' : 'Mode Gelap diaktifkan.', 'info');
  }
}

function applyChartTheme(theme) {
  if (!chartInstance) return;

  const isLight = theme === 'light';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.03)';
  const tickColor = isLight ? '#64748b' : '#85858b';
  const tooltipBg = isLight ? '#ffffff' : '#0f0f10';
  const tooltipTitle = isLight ? '#0f172a' : '#ededed';
  const tooltipBody = isLight ? '#334155' : '#a1a1a6';
  const tooltipBorder = isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.12)';

  if (chartInstance.options.scales.x) {
    chartInstance.options.scales.x.grid.color = gridColor;
    chartInstance.options.scales.x.ticks.color = tickColor;
  }

  if (chartInstance.options.plugins && chartInstance.options.plugins.tooltip) {
    chartInstance.options.plugins.tooltip.backgroundColor = tooltipBg;
    chartInstance.options.plugins.tooltip.titleColor = tooltipTitle;
    chartInstance.options.plugins.tooltip.bodyColor = tooltipBody;
    chartInstance.options.plugins.tooltip.borderColor = tooltipBorder;
  }

  // Update Dataset 4 (Delta baseline silhouette)
  if (chartInstance.data.datasets && chartInstance.data.datasets[4]) {
    chartInstance.data.datasets[4].borderColor = isLight ? 'rgba(15, 23, 42, 0.22)' : 'rgba(255, 255, 255, 0.22)';
    chartInstance.data.datasets[4].backgroundColor = isLight ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.02)';
  }

  chartInstance.update('none');
}

// --- Live Clock Real-Time ---
function initClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;
  function update() {
    const now = new Date();
    if (clockEl) {
      clockEl.innerText = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    }
  }
  update();
  liveClockInterval = setInterval(update, 1000);
}

// --- Tab Navigation ---
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const mobileTabs = document.querySelectorAll('.mobile-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = tab.getAttribute('data-tab');

      // Sync mobile tab bar
      mobileTabs.forEach(mt => {
        mt.classList.remove('active');
        if (mt.getAttribute('data-tab') === targetId) {
          mt.classList.add('active');
        }
      });

      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
      });

      const activeContent = document.getElementById(targetId);
      if (activeContent) {
        activeContent.classList.remove('hidden');
      }

      // Close mobile sidebar after tab switch
      if (window.innerWidth < 1024) {
        toggleMobileSidebar();
      }

      // Re-trigger Chart resize and Lucide icons
      if ((targetId === 'tab-cockpit' || targetId === 'tab-correlation') && chartInstance) {
        setTimeout(() => chartInstance.resize(), 50);
      }
      initLucide();
    });
  });
}

// --- Inisialisasi Chart.js (WIRU Light Mode) ---
function initChart() {
  const chartEl = document.getElementById('aquacultureChart');
  if (!chartEl) return;
  const ctx = chartEl.getContext('2d');

  // Initial 12 rolling real-time points up to current time
  const rollingPoints = 12;
  const initialLabels = [];
  const doData = [];
  const criticalLimitData = [];
  const tempData = [];
  const phData = [];
  const mirrorDeltaData = [];

  const nowMs = Date.now();
  for (let i = rollingPoints - 1; i >= 0; i--) {
    const t = new Date(nowMs - i * 3000);
    initialLabels.push(t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    
    const baseDO = 5.36 + Math.sin((rollingPoints - i) * 0.4) * 0.12;
    doData.push(parseFloat(baseDO.toFixed(2)));
    criticalLimitData.push(5.00);
    tempData.push(parseFloat((28.4 + Math.cos(i * 0.3) * 0.15).toFixed(1)));
    phData.push(parseFloat((7.38 + Math.sin(i * 0.2) * 0.04).toFixed(2)));
    mirrorDeltaData.push(parseFloat((-(Math.abs(baseDO - 5.40) * 1.5 + 0.4)).toFixed(2)));
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: initialLabels,
      datasets: [
        // 1. Oksigen Terlarut (DO mg/L) - WIRU Teal #0aa094
        {
          label: 'Oksigen (DO)',
          data: doData,
          borderColor: '#0aa094',
          backgroundColor: 'rgba(10, 160, 148, 0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#0aa094',
          yAxisID: 'y'
        },
        // 2. Ambang Kritis 5.00 mg/L (Amber Warning Line)
        {
          label: 'Ambang Kritis (5.00 mg/L)',
          data: criticalLimitData,
          borderColor: '#f59e0b',
          borderDash: [5, 5],
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          yAxisID: 'y'
        },
        // 3. Suhu Air (°C) - Coral Rose #f43f5e
        {
          label: 'Suhu Air (°C)',
          data: tempData,
          borderColor: '#f43f5e',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#f43f5e',
          fill: false,
          yAxisID: 'y1'
        },
        // 4. pH Air Kolam - Sky Blue #38bdf8
        {
          label: 'pH Air',
          data: phData,
          borderColor: '#38bdf8',
          tension: 0.4,
          borderWidth: 1.8,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#38bdf8',
          fill: false,
          yAxisID: 'y'
        },
        // 5. Mirrored Comparison Delta (Historical Baseline, Below 0)
        {
          label: 'Baseline Kemarin (Δ)',
          data: mirrorDeltaData,
          borderColor: 'rgba(255, 255, 255, 0.22)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          fill: true,
          tension: 0.4,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 0,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 400,
        easing: 'easeOutQuart'
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f0f10',
          titleColor: '#ededed',
          bodyColor: '#a1a1a6',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                if (context.datasetIndex === 0 || context.datasetIndex === 1) {
                  label += context.parsed.y.toFixed(2) + ' mg/L';
                } else if (context.datasetIndex === 2) {
                  label += context.parsed.y.toFixed(1) + ' °C';
                } else if (context.datasetIndex === 3) {
                  label += context.parsed.y.toFixed(2) + ' pH';
                } else {
                  label += context.parsed.y.toFixed(2) + ' Δ delta';
                }
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.03)'
          },
          ticks: {
            color: '#85858b',
            font: { size: 10, family: 'Geist Mono, JetBrains Mono' },
            maxRotation: 0,
            padding: 8
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          min: -2.0,
          max: 8.5,
          grid: {
            color: function(context) {
              if (context.tick.value === 5.0) return 'rgba(245, 158, 11, 0.35)'; // Amber line at critical 5.00
              if (context.tick.value === 0) return 'rgba(255, 255, 255, 0.2)';   // Zero baseline line
              return 'rgba(255, 255, 255, 0.04)';
            },
            lineWidth: function(context) {
              return (context.tick.value === 5.0 || context.tick.value === 0) ? 1.5 : 1;
            }
          },
          ticks: {
            stepSize: 1.5,
            color: function(context) {
              if (context.tick.value === 5.0) return '#f59e0b';
              return '#85858b';
            },
            font: { size: 10, family: 'Geist Mono, JetBrains Mono' },
            callback: function(val) {
              if (val === 5.0) return '5.00 (Kritis DO)';
              if (val === 0) return '0.00 (Baseline)';
              if (val < 0) return '-' + Math.abs(val).toFixed(1) + ' Δ';
              return val.toFixed(1) + ' mg/L';
            }
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          min: 22,
          max: 36,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#f43f5e',
            font: { size: 10, family: 'Geist Mono, JetBrains Mono' },
            callback: function(val) {
              return val + ' °C';
            }
          }
        }
      }
    }
  });

  const clearBtn = document.getElementById('clearChartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      chartInstance.data.labels = [timeStr];
      chartInstance.data.datasets[0].data = [state.sensors.do];
      chartInstance.data.datasets[1].data = [5.00];
      chartInstance.data.datasets[2].data = [state.sensors.temp];
      chartInstance.data.datasets[3].data = [state.sensors.ph];
      chartInstance.data.datasets[4].data = [-0.5];
      chartInstance.update();
      showToast('Riwayat telemetri di-reset ke waktu saat ini.', 'info');
    });
  }

  applyChartTheme(getCurrentTheme());
}

// Update grafik dengan data terbaru (Live Streaming)
function pushDataToChart(doVal, tempVal) {
  if (!chartInstance) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // 1. Shift timestamps forward
  chartInstance.data.labels.push(timeStr);
  if (chartInstance.data.labels.length > 14) {
    chartInstance.data.labels.shift();
  }

  // 2. Push real sensor readings
  const phVal = state.sensors.ph;
  const deltaMirror = -(Math.abs(doVal - 5.40) * 1.4 + 0.4);

  // Dataset 0: DO
  chartInstance.data.datasets[0].data.push(doVal);
  if (chartInstance.data.datasets[0].data.length > 14) chartInstance.data.datasets[0].data.shift();

  // Dataset 1: Critical Threshold 5.00
  chartInstance.data.datasets[1].data.push(5.00);
  if (chartInstance.data.datasets[1].data.length > 14) chartInstance.data.datasets[1].data.shift();

  // Dataset 2: Suhu Air
  chartInstance.data.datasets[2].data.push(tempVal);
  if (chartInstance.data.datasets[2].data.length > 14) chartInstance.data.datasets[2].data.shift();

  // Dataset 3: pH Air
  chartInstance.data.datasets[3].data.push(phVal);
  if (chartInstance.data.datasets[3].data.length > 14) chartInstance.data.datasets[3].data.shift();

  // Dataset 4: Mirrored Comparison
  chartInstance.data.datasets[4].data.push(deltaMirror);
  if (chartInstance.data.datasets[4].data.length > 14) chartInstance.data.datasets[4].data.shift();

  // Dynamic alert color if DO is under 5.0
  if (doVal < 5.00) {
    chartInstance.data.datasets[0].borderColor = '#e5484d';
    chartInstance.data.datasets[0].backgroundColor = 'rgba(229, 72, 77, 0.15)';
  } else {
    chartInstance.data.datasets[0].borderColor = '#0aa094';
    chartInstance.data.datasets[0].backgroundColor = 'rgba(10, 160, 148, 0.08)';
  }

  chartInstance.update('none');

  // 3. Update Chart Header Metrik
  const heroMetric = document.getElementById('chartHeroMetric');
  const heroTrend = document.getElementById('chartHeroTrend');
  const updateEl = document.getElementById('chartLastUpdated');

  if (heroMetric) {
    heroMetric.innerHTML = `${doVal.toFixed(2)} <span class="text-base text-neutral-400 font-sans">mg/L</span>`;
  }

  if (heroTrend) {
    if (doVal < 5.00) {
      const diff = (5.00 - doVal).toFixed(2);
      heroTrend.className = 'text-xs text-red-400 font-mono mt-1 font-semibold';
      heroTrend.innerText = `Peringatan Anoksia: ${diff} mg/L di bawah batas kritis (5.00 mg/L)!`;
    } else {
      const diff = (doVal - 5.00).toFixed(2);
      heroTrend.className = 'text-xs text-emerald-400 font-mono mt-1';
      heroTrend.innerText = `+${diff} mg/L di atas batas kritis (5.00 mg/L) • Aerasi Efisien`;
    }
  }

  if (updateEl) updateEl.innerText = `Diperbarui: ${timeStr} WIB`;
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
  if (switchAerator) {
    switchAerator.addEventListener('change', (e) => {
      setAeratorState(e.target.checked, 'Manual oleh ' + state.role.toUpperCase());
    });
  }

  // Pump Switch
  if (switchPump) {
    switchPump.addEventListener('change', (e) => {
      state.actuators.pump = e.target.checked;
      updateActuatorVisuals();
      logEvent(e.target.checked ? 'Pompa Sirkulasi Dinyalakan' : 'Pompa Sirkulasi Dimatikan', '-', 'Manual switch');
      showToast(e.target.checked ? 'Pompa sirkulasi aktif' : 'Pompa sirkulasi berhenti', 'info');
    });
  }

  // Feeder Auto Switch
  if (switchFeeder) {
    switchFeeder.addEventListener('change', (e) => {
      state.actuators.feederAuto = e.target.checked;
      logEvent(e.target.checked ? 'Jadwal Pakan Diaktifkan' : 'Jadwal Pakan Dinonaktifkan', 'Timer: 4x/hari', 'Setting');
    });
  }

  // Feed Now Manual Button
  if (btnFeedNow) {
    btnFeedNow.addEventListener('click', () => {
      dispenseFeed();
    });
  }

  // Role Selector
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      state.role = e.target.value;
      applyRolePermissions();
      showToast(`Beralih ke peran: ${e.target.selectedOptions[0].text}`, 'info');
    });
  }

  // Pond Selector
  if (pondSelect) {
    pondSelect.addEventListener('change', (e) => {
      state.currentPond = e.target.value;
      logTerminal(`[APP] Memuat konfigurasi dan telemetri ${state.currentPond}...`, 'text-teal-600');
      showToast(`Memantau: ${state.currentPond}`, 'info');
    });
  }

  // Dismiss alert
  if (dismissAlertBtn) {
    dismissAlertBtn.addEventListener('click', () => {
      const banner = document.getElementById('dynamicAlertBanner');
      if (banner) banner.classList.add('hidden');
    });
  }

  // Test WA
  const testWaBtn = document.getElementById('btnSendTestWA');
  if (testWaBtn) {
    testWaBtn.addEventListener('click', () => {
      sendMockWhatsAppAlert("Uji Coba WIRU Gateway: Sistem Beroperasi Normal.");
      showToast("Pesan uji coba dikirim ke chat preview", "success");
    });
  }
}

function setAeratorState(isActive, triggerReason = 'Otomatisasi') {
  state.actuators.aerator = isActive;
  const switchEl = document.getElementById('switchAerator');
  if (switchEl) switchEl.checked = isActive;
  updateActuatorVisuals();

  logEvent(
    isActive ? 'Kincir Aerator Menyala' : 'Kincir Aerator Mati',
    `DO: ${state.sensors.do.toFixed(2)} mg/L`,
    triggerReason,
    isActive ? (state.sensors.do < state.thresholds.doMin ? 'Peringatan' : 'Manual') : 'Normal'
  );

  logTerminal(`[RELAY] GPIO23 -> Aerator ${isActive ? 'HIGH (ON)' : 'LOW (OFF)'} [${triggerReason}]`, isActive ? 'text-amber-600 font-bold' : 'text-slate-500');
}

function updateActuatorVisuals() {
  const iconAerator = document.getElementById('iconAerator');
  const iconAeratorBg = document.getElementById('iconAeratorBg');
  const iconPump = document.getElementById('iconPump');
  const iconPumpBg = document.getElementById('iconPumpBg');

  if (iconAerator && iconAeratorBg) {
    if (state.actuators.aerator) {
      iconAeratorBg.className = 'w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center';
      iconAerator.classList.add('animate-spin-slow');
      const sub = document.getElementById('subAeratorStatus');
      if (sub) sub.innerText = 'Status: Berputar (Aktif)';
    } else {
      iconAeratorBg.className = 'w-8 h-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center';
      iconAerator.classList.remove('animate-spin-slow');
      const sub = document.getElementById('subAeratorStatus');
      if (sub) sub.innerText = 'Otomatis saat DO < 5.0';
    }
  }

  // Update Arus & Daya Listrik Kincir (1 HP Motor Tambak)
  const aeratorCurrentEl = document.getElementById('aeratorCurrentText');
  const aeratorPowerEl = document.getElementById('aeratorPowerText');
  if (aeratorCurrentEl) aeratorCurrentEl.innerText = state.actuators.aerator ? '3.4 A' : '0.0 A';
  if (aeratorPowerEl) aeratorPowerEl.innerText = state.actuators.aerator ? '750 W' : '0 W';

  if (iconPump && iconPumpBg) {
    if (state.actuators.pump) {
      iconPumpBg.className = 'w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center';
      iconPump.classList.add('animate-spin');
    } else {
      iconPumpBg.className = 'w-8 h-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center';
      iconPump.classList.remove('animate-spin');
    }
  }

  const btnQuickPump = document.getElementById('btnQuickPondPump');
  if (btnQuickPump) {
    btnQuickPump.innerText = state.actuators.pump ? 'Matikan Pompa' : 'Nyalakan Pompa';
  }

  // Sinkronisasi status di canvas dan box panel
  updateHardwarePanelVisuals();
}

function dispenseFeed() {
  const btn = document.getElementById('btnFeedNow');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Melontarkan Pakan...`;
    initLucide();
  }

  logTerminal(`[FEEDER] PWM Servo GPIO18 menggerakkan ulir pakan (250 gram)...`, 'text-teal-700');

  // Trigger lontaran pakan visual di canvas kolam
  if (typeof spawnPondFeed === 'function') {
    spawnPondFeed();
  }

  setTimeout(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="send" class="w-3.5 h-3.5 text-amber-500"></i> Lontarkan Pakan Sekarang (250g)`;
      initLucide();
    }

    // Kurangi stok pakan silo
    siloRemainingKg = Math.max(0, parseFloat((siloRemainingKg - 0.25).toFixed(2)));
    const percent = Math.round((siloRemainingKg / 20.0) * 100);
    const siloLevelEls = document.querySelectorAll('.silo-fill-level');
    siloLevelEls.forEach(el => el.style.transform = `scaleY(${percent / 100})`);
    const siloCapText = document.getElementById('siloCapacityText');
    if (siloCapText) siloCapText.innerText = `${percent}% (${siloRemainingKg.toFixed(1)} kg)`;

    logEvent('Lontaran Pakan Selesai', 'Takaran: 250 gram', 'Feeder Sukses', 'Normal');
    showToast(`Pakan 250 gram terlontar ke kolam. Sisa silo: ${siloRemainingKg.toFixed(1)} kg`, 'success');
  }, 1800);
}

// --- Role Permissions ---
function applyRolePermissions() {
  const isSiswa = state.role === 'siswa';
  const roleBadge = document.getElementById('roleBadgeControl');

  const switchAerator = document.getElementById('switchAerator');
  const switchPump = document.getElementById('switchPump');
  const switchFeeder = document.getElementById('switchFeeder');
  const btnFeedNow = document.getElementById('btnFeedNow');

  if (switchAerator) switchAerator.disabled = isSiswa;
  if (switchPump) switchPump.disabled = isSiswa;
  if (switchFeeder) switchFeeder.disabled = isSiswa;
  if (btnFeedNow) btnFeedNow.disabled = isSiswa;

  if (roleBadge) {
    if (isSiswa) {
      roleBadge.innerText = 'Siswa (Read-Only)';
      roleBadge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200';
    } else if (state.role === 'admin') {
      roleBadge.innerText = 'Admin (Full Access)';
      roleBadge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200';
    } else {
      roleBadge.innerText = 'Guru / Teknisi';
      roleBadge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200';
    }
  }
}

// --- Manual Sliders Sensor & Logic Evaluator ---
function initSliders() {
  const sliderDO = document.getElementById('simSliderDO');
  const sliderTemp = document.getElementById('simSliderTemp');
  const sliderPH = document.getElementById('simSliderPH');
  const sliderSalinity = document.getElementById('simSliderSalinity');

  if (sliderDO) {
    sliderDO.addEventListener('input', (e) => {
      state.sensors.do = parseFloat(e.target.value);
      const valEl = document.getElementById('sliderValDO');
      if (valEl) valEl.innerText = state.sensors.do.toFixed(2) + ' mg/L';
      evaluateSystemRules();
    });
  }

  if (sliderTemp) {
    sliderTemp.addEventListener('input', (e) => {
      state.sensors.temp = parseFloat(e.target.value);
      const valEl = document.getElementById('sliderValTemp');
      if (valEl) valEl.innerText = state.sensors.temp.toFixed(1) + ' °C';
      evaluateSystemRules();
    });
  }

  if (sliderPH) {
    sliderPH.addEventListener('input', (e) => {
      state.sensors.ph = parseFloat(e.target.value);
      const valEl = document.getElementById('sliderValPH');
      if (valEl) valEl.innerText = state.sensors.ph.toFixed(2);
      evaluateSystemRules();
    });
  }

  if (sliderSalinity) {
    sliderSalinity.addEventListener('input', (e) => {
      state.sensors.salinity = parseInt(e.target.value);
      const valEl = document.getElementById('sliderValSalinity');
      if (valEl) valEl.innerText = state.sensors.salinity + ' ppt';
      evaluateSystemRules();
    });
  }
}

// Evaluasi aturan otomasi sesuai Dokumen Proposal Bab 5 & 6
function evaluateSystemRules() {
  updateDashboardCards();

  const doVal = state.sensors.do;
  const alertBanner = document.getElementById('dynamicAlertBanner');
  const alertTitle = document.getElementById('alertTitle');
  const alertDesc = document.getElementById('alertDescription');

  let hasCriticalIssue = false;

  // Rule 1: DO < 5.00 mg/L -> Otomatisasi Aerator Hidup & Notifikasi WA
  if (doVal < state.thresholds.doMin) {
    hasCriticalIssue = true;
    if (!state.actuators.aerator) {
      setAeratorState(true, 'Otomatis (DO Kritis < 5.00 mg/L)');
      sendMockWhatsAppAlert(`DARURAT OKSIGEN! Kadar DO ${state.currentPond} turun menjadi ${doVal.toFixed(2)} mg/L (Batas aman: 5.00 mg/L). Kincir aerator diaktifkan otomatis.`);
      showToast(`Peringatan: Oksigen Rendah (${doVal.toFixed(2)} mg/L)! Kincir aerator dihidupkan.`, 'danger');
    }
    if (alertBanner && alertTitle && alertDesc) {
      alertBanner.className = 'rounded border border-red-300 bg-red-50 p-3.5 transition-colors flex items-start justify-between gap-3 font-mono text-xs text-red-900';
      alertTitle.innerText = `Peringatan anoksia: Oksigen terlarut di bawah 5.00 mg/L (${doVal.toFixed(2)} mg/L)`;
      alertDesc.innerText = `Kadar DO kolam merosot. Relai kincir aerator otomatis dinyalakan dan notifikasi darurat telah dipancarkan ke WhatsApp teknisi tambak.`;
      alertBanner.classList.remove('hidden');
    }
  } 
  // Rule 2: DO >= 5.40 mg/L -> Hysteresis: Matikan aerator otomatis jika stabil
  else if (doVal >= 5.40 && state.actuators.aerator) {
    setAeratorState(false, 'Otomatis (Kondisi DO Stabil & Hemat Energi)');
    sendMockWhatsAppAlert(`INFO STABIL: Kadar oksigen ${state.currentPond} kembali aman (${doVal.toFixed(2)} mg/L). Kincir aerator dimatikan otomatis.`);
    showToast(`Oksigen kembali stabil (${doVal.toFixed(2)} mg/L). Kincir aerator dimatikan.`, 'success');
    if (alertBanner) alertBanner.classList.add('hidden');
  } else if (!hasCriticalIssue && alertBanner) {
    alertBanner.classList.add('hidden');
  }

  updateCardBadges();
}

function updateDashboardCards() {
  const elTemp = document.getElementById('val-temp');
  const elPH = document.getElementById('val-ph');
  const elSal = document.getElementById('val-salinity');
  const elDO = document.getElementById('val-do');
  const elTurb = document.getElementById('val-turbidity');

  if (elTemp) elTemp.innerText = state.sensors.temp.toFixed(1);
  if (elPH) elPH.innerText = state.sensors.ph.toFixed(2);
  if (elSal) elSal.innerText = state.sensors.salinity;
  if (elDO) elDO.innerText = state.sensors.do.toFixed(2);
  if (elTurb) elTurb.innerText = state.sensors.turbidity;

  // Sinkronisasi ke Layar OLED dan Panel Fisik WIRU
  updateHardwarePanelVisuals();
}

function updateCardBadges() {
  const badgeDO = document.getElementById('badge-do');
  if (badgeDO) {
    if (state.sensors.do < 4.50) {
      badgeDO.innerText = 'Bahaya';
      badgeDO.className = 'text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-mono font-semibold';
    } else if (state.sensors.do < 5.00) {
      badgeDO.innerText = 'Rendah';
      badgeDO.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono font-semibold';
    } else {
      badgeDO.innerText = 'Optimal';
      badgeDO.className = 'text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-mono font-semibold';
    }
  }

  const badgeTemp = document.getElementById('badge-temp');
  if (badgeTemp) {
    if (state.sensors.temp > 32.0 || state.sensors.temp < 24.0) {
      badgeTemp.innerText = 'Abnormal';
      badgeTemp.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono font-semibold';
    } else {
      badgeTemp.innerText = 'Normal';
      badgeTemp.className = 'text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-mono font-semibold';
    }
  }
}

// --- Skenario Interaktif Sesuai Dokumen Proposal ---
function initScenarios() {
  const scDrop = document.getElementById('scenarioDropOxygen');
  if (scDrop) {
    scDrop.addEventListener('click', () => {
      state.sensors.do = 4.60;
      const slider = document.getElementById('simSliderDO');
      if (slider) slider.value = 4.60;
      const valEl = document.getElementById('sliderValDO');
      if (valEl) valEl.innerText = '4.60 mg/L';
      logTerminal('[SCENARIO] Simulasi: Oksigen terlarut kolam merosot ke 4.60 mg/L!', 'text-red-600 font-bold');
      evaluateSystemRules();
      pushDataToChart(4.60, state.sensors.temp);
    });
  }

  const scFeed = document.getElementById('scenarioFeedSchedule');
  if (scFeed) {
    scFeed.addEventListener('click', () => {
      logTerminal('[SCENARIO] Trigger timer pakan otomatis jadwal 11:30 WIB...', 'text-teal-700 font-bold');
      dispenseFeed();
    });
  }

  const scNet = document.getElementById('scenarioNetworkCut');
  if (scNet) {
    scNet.addEventListener('click', () => {
      toggleNetworkConnection();
    });
  }

  const scNorm = document.getElementById('scenarioRestoreNormal');
  if (scNorm) {
    scNorm.addEventListener('click', () => {
      state.sensors.do = 5.40;
      state.sensors.temp = 28.5;
      state.sensors.ph = 7.40;
      state.sensors.salinity = 18;

      const sDO = document.getElementById('simSliderDO');
      if (sDO) sDO.value = 5.40;
      const sTemp = document.getElementById('simSliderTemp');
      if (sTemp) sTemp.value = 28.5;
      const sPH = document.getElementById('simSliderPH');
      if (sPH) sPH.value = 7.40;
      const sSal = document.getElementById('simSliderSalinity');
      if (sSal) sSal.value = 18;

      if (!state.isOnline) {
        toggleNetworkConnection(true);
      }

      logTerminal('[SCENARIO] Parameter dipulihkan ke ambang normal dan sehat.', 'text-emerald-700 font-bold');
      evaluateSystemRules();
      pushDataToChart(5.40, 28.5);
      showToast('Kondisi kolam dinormalkan.', 'success');
    });
  }

  const btnToggleStream = document.getElementById('btnToggleRandomStream');
  if (btnToggleStream) {
    btnToggleStream.addEventListener('click', () => {
      state.autoStream = !state.autoStream;
      btnToggleStream.innerText = state.autoStream ? 'Berjalan' : 'Dijeda';
      showToast(state.autoStream ? 'Data stream otomatis diaktifkan' : 'Data stream dijeda', 'info');
    });
  }
}

function toggleNetworkConnection(forceOnline = false) {
  state.isOnline = forceOnline ? true : !state.isOnline;
  const badge = document.getElementById('connectionStatusBadge');
  const text = document.getElementById('connectionStatusText');

  if (state.isOnline) {
    if (badge) {
      badge.className = 'flex items-center gap-2 px-2.5 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono';
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span id="connectionStatusText">ESP32: Online</span>
      `;
    }
    logTerminal(`[WIFI] Terkoneksi kembali ke AP! Mengirim ${state.offlineBuffer} data cache yang tertunda...`, 'text-teal-700');
    if (state.offlineBuffer > 0) {
      showToast(`Koneksi pulih. ${state.offlineBuffer} data cache berhasil disinkronisasi ke server!`, 'success');
      state.packetCount += state.offlineBuffer;
      state.offlineBuffer = 0;
      const bufEl = document.getElementById('offlineBufferCount');
      if (bufEl) bufEl.innerText = '0';
      const pktEl = document.getElementById('packetCount');
      if (pktEl) pktEl.innerText = state.packetCount;
    }
  } else {
    if (badge) {
      badge.className = 'flex items-center gap-2 px-2.5 py-1.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono';
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        <span id="connectionStatusText">ESP32: Offline (Caching)</span>
      `;
    }
    logTerminal(`[WIFI] Internet Terputus! ESP32 mengalihkan penyimpanan ke Flash SPIFFS...`, 'text-amber-700');
    showToast('Internet terputus! Data disimpan sementara di memori internal ESP32.', 'warning');
  }
}

// --- Data Stream Otomatis (Interval 3 Detik) ---
function startAutoStream() {
  streamInterval = setInterval(() => {
    if (!state.autoStream) return;

    if (state.isOnline) {
      const dDO = (Math.random() - 0.48) * 0.04;
      const dTemp = (Math.random() - 0.5) * 0.04;

      if (state.sensors.do > 4.70 && state.sensors.do < 6.50) {
        state.sensors.do = parseFloat(Math.max(3.0, Math.min(8.0, state.sensors.do + dDO)).toFixed(2));
      }
      state.sensors.temp = parseFloat(Math.max(25.0, Math.min(34.0, state.sensors.temp + dTemp)).toFixed(1));

      evaluateSystemRules();
      pushDataToChart(state.sensors.do, state.sensors.temp);

      state.packetCount++;
      const pktEl = document.getElementById('packetCount');
      if (pktEl) pktEl.innerText = state.packetCount;

      logTerminal(`[MQTT PUSH] topic: "wiru/kolamA/telemetry" payload: {"do":${state.sensors.do.toFixed(2)},"temp":${state.sensors.temp.toFixed(1)},"ph":${state.sensors.ph.toFixed(2)}}`, 'text-slate-400');
    } else {
      state.offlineBuffer++;
      const bufEl = document.getElementById('offlineBufferCount');
      if (bufEl) bufEl.innerText = state.offlineBuffer;
      logTerminal(`[SPIFFS CACHE] Menyimpan record #${state.offlineBuffer} di memori lokal ESP32...`, 'text-amber-700');
    }
  }, 3000);
}

// --- Terminal Logger ---
function initTerminal() {
  const btnClear = document.getElementById('btnClearTerminal');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      const term = document.getElementById('espTerminalOutput');
      if (term) term.innerHTML = '<div class="text-slate-400">[TERMINAL CLEARED]</div>';
    });
  }

  const btnManual = document.getElementById('btnManualPush');
  if (btnManual) {
    btnManual.addEventListener('click', () => {
      state.packetCount++;
      const pktEl = document.getElementById('packetCount');
      if (pktEl) pktEl.innerText = state.packetCount;
      logTerminal(`[MQTT MANUAL] Paket telemetri dikirim langsung oleh pengguna.`, 'text-teal-700');
      showToast('Paket telemetri berhasil di-push ke server.', 'info');
    });
  }
}

function logTerminal(message, colorClass = 'text-slate-500') {
  const terminal = document.getElementById('espTerminalOutput');
  if (!terminal) return;
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
  if (!tbody) return;
  tbody.innerHTML = '';

  state.logs.forEach(log => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

    let statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">Normal</span>';
    if (log.status === 'Peringatan') {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 border border-red-200">Peringatan</span>';
    } else if (log.status === 'Manual') {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-200">Manual</span>';
    }

    tr.innerHTML = `
      <td class="p-2.5 text-slate-500 font-mono">${log.time}</td>
      <td class="p-2.5 font-semibold text-slate-800">${log.event}</td>
      <td class="p-2.5 text-teal-700 font-mono font-medium">${log.param}</td>
      <td class="p-2.5 text-slate-600">${log.action}</td>
      <td class="p-2.5">${statusBadge}</td>
    `;
    tbody.appendChild(tr);
  });

  const exportBtn = document.getElementById('btnExportCSV');
  if (exportBtn) exportBtn.onclick = exportLogsToCSV;
  const clearBtn = document.getElementById('btnClearLogs');
  if (clearBtn) {
    clearBtn.onclick = () => {
      state.logs = [];
      renderLogs();
      showToast('Log riwayat dikosongkan.', 'info');
    };
  }
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
  a.download = `wiru_laporan_tambak_puger_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('File CSV laporan berhasil diunduh.', 'success');
}

// --- WhatsApp Mockup Preview ---
function sendMockWhatsAppAlert(message) {
  const preview = document.getElementById('previewNotifText');
  if (preview) preview.innerText = message;

  const chatBubble = document.getElementById('dynamicChatBubble');
  const chatText = document.getElementById('chatAlertText');
  const chatTime = document.getElementById('chatAlertTime');

  if (chatText) chatText.innerHTML = message.replace(/\n/g, '<br>');
  if (chatTime) chatTime.innerText = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  if (chatBubble) chatBubble.classList.remove('hidden');
}

// --- Toast Notification System (Top Center Floating Pill) ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');

  let borderBg = 'bg-[#1c1c1f]/95 border-white/10 text-neutral-200';
  let iconName = 'info';
  let iconColor = 'text-teal-400';

  if (type === 'success') {
    iconName = 'check-circle';
    iconColor = 'text-emerald-400';
  } else if (type === 'danger') {
    iconName = 'alert-triangle';
    iconColor = 'text-red-400';
  } else if (type === 'warning') {
    iconName = 'alert-circle';
    iconColor = 'text-amber-400';
  }

  toast.className = `flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${borderBg} text-xs font-medium shadow-2xl backdrop-blur-md pointer-events-auto transition-all duration-300 transform -translate-y-3 opacity-0`;
  toast.innerHTML = `<i data-lucide="${iconName}" class="w-3.5 h-3.5 shrink-0 ${iconColor}"></i><span>${message}</span>`;

  container.appendChild(toast);
  initLucide();

  setTimeout(() => {
    toast.classList.remove('-translate-y-3', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-3');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// =========================================================================
// MODUL TAMPILAN FISIK IOT & DIGITAL TWIN KOLAM TAMBAK (WIRU LIGHT MODE)
// =========================================================================

let pondCanvas = null;
let pondCtx = null;
let showComponentLabels = true;
let aeratorAngle = 0;

const pondState = {
  bubbles: [],
  splashes: [],
  feedPellets: [],
  fishes: [],
  pumpStreams: []
};

function initHardwareView() {
  pondCanvas = document.getElementById('pondCanvas');
  if (!pondCanvas) return;
  pondCtx = pondCanvas.getContext('2d');

  pondState.fishes = [];
  for (let i = 0; i < 8; i++) {
    pondState.fishes.push({
      x: 150 + Math.random() * 700,
      y: 240 + Math.random() * 100,
      vx: (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.8),
      vy: (Math.random() - 0.5) * 0.3,
      size: 16 + Math.random() * 8,
      tailPhase: Math.random() * Math.PI * 2,
      color: i % 2 === 0 ? '#0aa094' : '#0a3651' // WIRU Teal & Marine Navy
    });
  }

  const btnQuickAerator = document.getElementById('btnQuickPondAerator');
  if (btnQuickAerator) {
    btnQuickAerator.addEventListener('click', () => {
      setAeratorState(!state.actuators.aerator, 'Tombol Visual Kolam');
      btnQuickAerator.innerText = state.actuators.aerator ? 'Matikan Kincir Air' : 'Nyalakan Kincir Air';
    });
  }

  const btnQuickPump = document.getElementById('btnQuickPondPump');
  if (btnQuickPump) {
    btnQuickPump.addEventListener('click', () => {
      state.actuators.pump = !state.actuators.pump;
      const switchPump = document.getElementById('switchPump');
      if (switchPump) switchPump.checked = state.actuators.pump;
      updateActuatorVisuals();
      logEvent(state.actuators.pump ? 'Pompa Sirkulasi Dinyalakan' : 'Pompa Sirkulasi Dimatikan', '-', 'Tombol Visual Kolam');
      showToast(state.actuators.pump ? 'Pompa sirkulasi aktif' : 'Pompa sirkulasi berhenti', 'info');
    });
  }

  const btnQuickFeeder = document.getElementById('btnQuickPondFeeder');
  if (btnQuickFeeder) {
    btnQuickFeeder.addEventListener('click', () => {
      spawnPondFeed();
      dispenseFeed();
    });
  }

  const hwPanelBtnAerator = document.getElementById('hwPanelBtnAerator');
  if (hwPanelBtnAerator) {
    hwPanelBtnAerator.addEventListener('click', () => {
      setAeratorState(!state.actuators.aerator, 'Saklar Fisik Panel IP66');
    });
  }

  const btnToggleLabels = document.getElementById('btnToggleLabels');
  if (btnToggleLabels) {
    btnToggleLabels.addEventListener('click', () => {
      showComponentLabels = !showComponentLabels;
      btnToggleLabels.innerText = `Label Komponen: ${showComponentLabels ? 'Aktif' : 'Mati'}`;
    });
  }

  updateHardwarePanelVisuals();
  requestAnimationFrame(renderPondScene);
}

function spawnPondFeed() {
  const feederX = 860;
  const feederY = 130;
  // Lontarkan 45 butir pakan pelet dengan efek semburan aerodinamis
  for (let i = 0; i < 45; i++) {
    const angle = Math.PI * (0.65 + Math.random() * 0.25); // meluncur ke arah kiri bawah
    const force = 3.5 + Math.random() * 4.5;
    pondState.feedPellets.push({
      x: feederX - 8 + (Math.random() - 0.5) * 10,
      y: feederY + Math.random() * 8,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force - (Math.random() * 1.5),
      size: 2.2 + Math.random() * 1.2,
      inWater: false
    });
  }
}

function updateHardwarePanelVisuals() {
  const oledDO = document.getElementById('oledDO');
  const oledTemp = document.getElementById('oledTemp');
  const oledPH = document.getElementById('oledPH');
  const oledAerator = document.getElementById('oledAerator');
  const oledWifi = document.getElementById('oledWifiStatus');
  const oledDOStatus = document.getElementById('oledDOStatus');

  if (oledDO) oledDO.innerText = state.sensors.do.toFixed(2);
  if (oledTemp) oledTemp.innerText = state.sensors.temp.toFixed(1);
  if (oledPH) oledPH.innerText = state.sensors.ph.toFixed(2);
  if (oledAerator) oledAerator.innerText = state.actuators.aerator ? 'ON' : 'OFF';
  if (oledWifi) oledWifi.innerText = state.isOnline ? 'WIFI:OK' : 'WIFI:ERR';

  if (oledDOStatus) {
    if (state.sensors.do < 4.50) {
      oledDOStatus.innerText = '[DANGER]';
      oledDOStatus.className = 'text-red-400 font-bold';
    } else if (state.sensors.do < 5.00) {
      oledDOStatus.innerText = '[WARN]';
      oledDOStatus.className = 'text-amber-400 font-bold';
    } else {
      oledDOStatus.innerText = '[NORM]';
      oledDOStatus.className = 'text-teal-300';
    }
  }

  const hwLedAerator = document.getElementById('hwLedAerator');
  const hwLedAlarm = document.getElementById('hwLedAlarm');
  const hwLedNet = document.getElementById('hwLedNet');

  if (hwLedAerator) {
    hwLedAerator.className = state.actuators.aerator 
      ? 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse' 
      : 'w-2.5 h-2.5 rounded-full bg-slate-300';
  }

  if (hwLedAlarm) {
    const isCritical = state.sensors.do < 5.00 || state.sensors.temp > 33.0;
    hwLedAlarm.className = isCritical 
      ? 'w-2.5 h-2.5 rounded-full bg-red-500 animate-ping' 
      : 'w-2.5 h-2.5 rounded-full bg-slate-300';
  }

  if (hwLedNet) {
    hwLedNet.className = state.isOnline 
      ? 'w-2.5 h-2.5 rounded-full bg-teal-500' 
      : 'w-2.5 h-2.5 rounded-full bg-slate-300';
  }

  const pondWaterBadge = document.getElementById('pondWaterStatusBadge');
  const pondAeratorBadge = document.getElementById('pondAeratorStatusBadge');

  if (pondWaterBadge) {
    if (state.sensors.do < 5.00) {
      pondWaterBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span><span class="text-red-700">Air: Oksigen Kritis (&lt; 5.00)</span>';
      pondWaterBadge.className = 'px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 flex items-center gap-1.5 shadow-sm';
    } else {
      pondWaterBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-teal-500"></span><span class="text-teal-800">Air: Kondisi Optimal</span>';
      pondWaterBadge.className = 'px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 flex items-center gap-1.5 shadow-sm';
    }
  }

  if (pondAeratorBadge) {
    pondAeratorBadge.innerText = state.actuators.aerator ? 'Kincir: Berputar (Aerasi Aktif)' : 'Kincir: Diam';
  }
}

// --- Render Loop Canvas Kolam Tambak (Light WIRU Mode) ---
function renderPondScene(now) {
  if (!pondCtx || !pondCanvas) return;

  const w = pondCanvas.width;
  const h = pondCanvas.height;
  const waterLine = 175;

  // 1. Langit Pesisir Puger (Responsif Mode Terang / Gelap)
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const skyGrad = pondCtx.createLinearGradient(0, 0, 0, waterLine);
  if (isLight) {
    skyGrad.addColorStop(0, '#e0f2fe');
    skyGrad.addColorStop(0.7, '#bae6fd');
    skyGrad.addColorStop(1, '#93c5fd');
  } else {
    skyGrad.addColorStop(0, '#0f141c');
    skyGrad.addColorStop(0.7, '#151c27');
    skyGrad.addColorStop(1, '#1a2433');
  }
  pondCtx.fillStyle = skyGrad;
  pondCtx.fillRect(0, 0, w, waterLine);

  // Siluet Bukit Kapur Pesisir Puger
  pondCtx.fillStyle = isLight ? '#94a3b8' : '#1e293b';
  pondCtx.beginPath();
  pondCtx.moveTo(0, waterLine);
  pondCtx.lineTo(60, 130);
  pondCtx.lineTo(160, 150);
  pondCtx.lineTo(260, 120);
  pondCtx.lineTo(380, 160);
  pondCtx.lineTo(480, 140);
  pondCtx.lineTo(600, 175);
  pondCtx.closePath();
  pondCtx.fill();

  // 2. Air Tambak Payau (Tosca Tropis Khas WIRU)
  const isHypoxia = state.sensors.do < 5.00;
  const waterGrad = pondCtx.createLinearGradient(0, waterLine, 0, h);
  if (isHypoxia) {
    if (isLight) {
      waterGrad.addColorStop(0, '#ffe4e6');
      waterGrad.addColorStop(0.5, '#fecdd3');
      waterGrad.addColorStop(1, '#fda4af');
    } else {
      waterGrad.addColorStop(0, '#0c2225');
      waterGrad.addColorStop(0.5, '#081719');
      waterGrad.addColorStop(1, '#050f11');
    }
  } else {
    if (isLight) {
      waterGrad.addColorStop(0, '#ccfbf1');
      waterGrad.addColorStop(0.5, '#5eead4');
      waterGrad.addColorStop(1, '#2dd4bf');
    } else {
      waterGrad.addColorStop(0, '#0a2f38');
      waterGrad.addColorStop(0.5, '#071f25');
      waterGrad.addColorStop(1, '#05151a');
    }
  }
  pondCtx.fillStyle = waterGrad;
  pondCtx.fillRect(0, waterLine, w, h - waterLine);

  // Gelombang Permukaan Air
  pondCtx.strokeStyle = 'rgba(10, 160, 148, 0.4)';
  pondCtx.lineWidth = 1.5;
  pondCtx.beginPath();
  const waveTime = now * 0.003;
  for (let x = 0; x <= w; x += 10) {
    const y = waterLine + Math.sin(x * 0.02 + waveTime) * 3;
    if (x === 0) pondCtx.moveTo(x, y);
    else pondCtx.lineTo(x, y);
  }
  pondCtx.stroke();

  // 3. Dermaga Kayu & Box Kontroler WIRU
  drawPierAndController(pondCtx, waterLine);

  // 4. Unit Auto Feeder
  drawAutoFeederUnit(pondCtx, waterLine);

  // 5. Kincir Aerator
  drawPaddlewheelAerator(pondCtx, waterLine, now);

  // 5b. Pompa Sirkulasi & Semburan Arus Air
  drawCirculationPump(pondCtx, waterLine, now);
  updateAndDrawPumpStream(pondCtx, waterLine);

  // 6. Butiran Pakan
  updateAndDrawFeed(pondCtx, waterLine, h);

  // 7. Aerasi & Buih
  updateAndDrawAeration(pondCtx, waterLine);

  // 8. Ikan / Udang
  updateAndDrawFishes(pondCtx, waterLine, h, w);

  // 9. Label Komponen
  if (showComponentLabels) {
    drawComponentLabels(pondCtx);
  }

  requestAnimationFrame(renderPondScene);
}

function drawPierAndController(ctx, waterLine) {
  // Tiang kayu dermaga
  ctx.fillStyle = '#78350f';
  ctx.fillRect(80, 70, 16, 260);
  ctx.fillRect(150, 100, 14, 230);
  
  // Geladak papan inspeksi
  ctx.fillStyle = '#92400e';
  ctx.fillRect(40, 110, 150, 12);

  // Box Panel WIRU Outdoor (Light Grey IP66)
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = '#0aa094'; // WIRU Teal border
  ctx.lineWidth = 2;
  ctx.fillRect(72, 50, 32, 48);
  ctx.strokeRect(72, 50, 32, 48);

  // Layar display di box
  ctx.fillStyle = '#0a3651';
  ctx.fillRect(78, 58, 20, 14);

  // LED indikator
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(88, 80, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Kabel Sensor Hitam
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(88, 98);
  ctx.bezierCurveTo(88, 140, 120, 150, 120, 240);
  ctx.stroke();

  // Probe Sensor Tercelup
  ctx.fillStyle = '#94a3b8'; // Stainless Suhu
  ctx.fillRect(116, 235, 8, 22);

  ctx.fillStyle = '#f8fafc'; // DO Probe Putih
  ctx.fillRect(128, 220, 7, 26);
  ctx.fillStyle = '#0aa094'; // Membran DO
  ctx.fillRect(128, 244, 7, 3);

  ctx.fillStyle = '#0a3651'; // pH Body
  ctx.fillRect(106, 215, 6, 22);
  ctx.fillStyle = '#38bdf8'; // Bulb kaca
  ctx.beginPath();
  ctx.arc(109, 239, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawAutoFeederUnit(ctx, waterLine) {
  const x = 860;
  
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x - 6, 80, 12, 250);

  // Corong Pakan WIRU Teal
  ctx.fillStyle = '#0aa094';
  ctx.beginPath();
  ctx.moveTo(x - 28, 55);
  ctx.lineTo(x + 28, 55);
  ctx.lineTo(x + 8, 115);
  ctx.lineTo(x - 8, 115);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#08857b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#0a3651';
  ctx.fillRect(x - 30, 48, 60, 8);
  ctx.fillRect(x - 6, 115, 12, 16);
}

function drawPaddlewheelAerator(ctx, waterLine, now) {
  const ax = 520;
  const ay = waterLine + 5;

  // Pelampung Kuning/Oranye
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(ax - 55, ay - 8, 110, 16, 6);
  ctx.fill();
  ctx.stroke();

  // Motor Listrik WIRU Navy
  ctx.fillStyle = '#0a3651';
  ctx.fillRect(ax - 18, ay - 26, 36, 20);
  ctx.fillStyle = '#0aa094';
  ctx.fillRect(ax - 14, ay - 30, 28, 6);

  if (state.actuators.aerator) {
    aeratorAngle += 0.22;
  }

  ctx.save();
  ctx.translate(ax, ay + 6);
  ctx.rotate(aeratorAngle);

  // Bilah Kincir
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0aa094';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.rotate((Math.PI * 2) / 6);
    ctx.fillRect(-3, -28, 6, 28);
    ctx.fillStyle = '#0aa094';
    ctx.fillRect(-8, -30, 16, 5);
    ctx.fillStyle = '#ffffff';
  }

  ctx.fillStyle = '#0a3651';
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCirculationPump(ctx, waterLine, now) {
  const px = 185;
  const py = 205;
  const isPumpOn = state.actuators.pump;

  // Vibrasi getaran halus saat pompa aktif
  const vibY = isPumpOn ? Math.sin(now * 0.08) * 0.5 : 0;

  // Pipa PVC Inlet/Suction Vertikal dari Dermaga ke Pompa
  ctx.fillStyle = '#475569';
  ctx.fillRect(px - 14, 110, 10, py - 110 + 10);
  ctx.fillStyle = '#334155';
  ctx.fillRect(px - 16, 150, 14, 6); // Flens sambungan pipa

  // Casing Motor Pompa Celup Submersible (10A)
  ctx.save();
  ctx.translate(px, py + vibY);

  // Body silinder pompa
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-18, -14, 36, 32, 6);
  ctx.fill();
  ctx.strokeStyle = '#0aa094';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pelindung saringan bawah (intake strainer)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-14, 18, 28, 8);
  ctx.fillStyle = '#64748b';
  for (let i = -10; i <= 10; i += 5) {
    ctx.fillRect(i, 20, 2, 4);
  }

  // Corong Nozzle Semburan Air (menghadap ke kanan kolam)
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(18, -6);
  ctx.lineTo(34, -10);
  ctx.lineTo(34, 14);
  ctx.lineTo(18, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0aa094';
  ctx.stroke();

  // Cincin nozzle outlet
  ctx.fillStyle = isPumpOn ? '#2dd4bf' : '#64748b';
  ctx.fillRect(34, -11, 4, 26);

  // Lampu Status LED Pompa
  ctx.fillStyle = isPumpOn ? '#10b981' : '#64748b';
  ctx.beginPath();
  ctx.arc(-8, -6, 2.5, 0, Math.PI * 2);
  ctx.fill();
  if (isPumpOn) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.beginPath();
    ctx.arc(-8, -6, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function updateAndDrawPumpStream(ctx, waterLine) {
  const isPumpOn = state.actuators.pump;
  const nozzleX = 222;
  const nozzleY = 205;

  if (isPumpOn) {
    // Spawn partikel garis arus semprotan air
    for (let i = 0; i < 4; i++) {
      pondState.pumpStreams.push({
        x: nozzleX + Math.random() * 8,
        y: nozzleY + (Math.random() - 0.5) * 12,
        vx: 4.5 + Math.random() * 4.5,
        vy: (Math.random() - 0.5) * 0.9,
        size: 1.5 + Math.random() * 2,
        length: 12 + Math.random() * 18,
        alpha: 0.85
      });
    }

    // Spawn micro bubbles semburan
    for (let i = 0; i < 2; i++) {
      pondState.bubbles.push({
        x: nozzleX + 15 + Math.random() * 20,
        y: nozzleY + (Math.random() - 0.5) * 14,
        vx: 3 + Math.random() * 3,
        vy: -Math.random() * 0.6 - 0.2,
        size: Math.random() * 2.5 + 0.8,
        alpha: 0.75
      });
    }

    // Efek visual jet stream utama (garis semburan arus air melengkung dinamis)
    const time = Date.now() * 0.005;
    ctx.save();
    for (let line = 0; line < 3; line++) {
      const lineOffset = (line - 1) * 6;
      ctx.strokeStyle = line === 1 ? 'rgba(45, 212, 191, 0.55)' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2 + (line === 1 ? 1 : 0);
      ctx.beginPath();
      ctx.moveTo(nozzleX, nozzleY + lineOffset);
      const cpX = nozzleX + 120;
      const cpY = nozzleY + lineOffset + Math.sin(time + line) * 6;
      const endX = nozzleX + 260 + Math.sin(time * 0.8 + line) * 20;
      const endY = nozzleY + lineOffset + 12 + Math.sin(time * 1.2 + line) * 8;
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Update & Draw Partikel Arus Pompa
  for (let i = pondState.pumpStreams.length - 1; i >= 0; i--) {
    const s = pondState.pumpStreams[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vx *= 0.985;
    s.alpha -= 0.018;

    if (s.alpha <= 0 || s.x > 500) {
      pondState.pumpStreams.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.strokeStyle = `rgba(45, 212, 191, ${s.alpha})`;
    ctx.lineWidth = s.size;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.length * (s.vx / 6), s.y - s.vy * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function updateAndDrawFeed(ctx, waterLine, h) {
  ctx.fillStyle = '#b45309'; // Warna cokelat pelet pakan tambak
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 0.5;

  for (let i = pondState.feedPellets.length - 1; i >= 0; i--) {
    const p = pondState.feedPellets[i];
    p.x += p.vx;
    p.y += p.vy;

    // Saat masih di udara (menuju air)
    if (p.y < waterLine) {
      p.vy += 0.22; // Gravitasi
    } else {
      // Masuk ke dalam air
      if (!p.inWater) {
        p.inWater = true;
        p.vx *= 0.35; // Tahanan air meredam laju horizontal
        p.vy = 0.6 + Math.random() * 0.4;
        // Percikan air kecil saat pelet masuk air
        if (Math.random() > 0.6) {
          pondState.splashes.push({
            x: p.x,
            y: waterLine,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 1.5 - 0.5,
            alpha: 0.7
          });
        }
      } else {
        // Perlahan tenggelam di air
        p.vy = 0.5 + Math.sin(p.y * 0.1) * 0.12;
        p.vx *= 0.98;
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size || 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hapus jika menyentuh dasar kolam
    if (p.y > h - 12) {
      pondState.feedPellets.splice(i, 1);
    }
  }
}

function updateAndDrawAeration(ctx, waterLine) {
  const ax = 520;
  const ay = waterLine + 5;

  if (state.actuators.aerator) {
    for (let i = 0; i < 3; i++) {
      pondState.splashes.push({
        x: ax + (Math.random() - 0.5) * 45,
        y: ay - Math.random() * 8,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3 - 1,
        alpha: 0.9
      });
    }

    for (let i = 0; i < 4; i++) {
      pondState.bubbles.push({
        x: ax + (Math.random() - 0.3) * 60,
        y: ay + 15 + Math.random() * 30,
        vx: (Math.random() * 2) - 0.3,
        vy: -Math.random() * 1.2 - 0.4,
        size: Math.random() * 3 + 1,
        alpha: 0.8
      });
    }
  }

  // Splashes
  for (let i = pondState.splashes.length - 1; i >= 0; i--) {
    const s = pondState.splashes[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.2;
    s.alpha -= 0.03;

    if (s.alpha <= 0 || s.y > waterLine + 5) {
      pondState.splashes.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bubbles
  for (let i = pondState.bubbles.length - 1; i >= 0; i--) {
    const b = pondState.bubbles[i];
    b.x += b.vx;
    b.y += b.vy;
    b.alpha -= 0.008;

    if (b.y <= waterLine || b.alpha <= 0) {
      pondState.bubbles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `rgba(204, 251, 241, ${b.alpha})`;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateAndDrawFishes(ctx, waterLine, h, w) {
  const isHypoxia = state.sensors.do < 5.00;
  // Ambil butiran pakan yang sudah berada di dalam air
  const activePellets = pondState.feedPellets.filter(p => p.y >= waterLine);

  pondState.fishes.forEach((fish) => {
    fish.tailPhase += 0.15;

    if (isHypoxia) {
      // Saat hipoksia (DO < 5.0), ikan megap-megap di permukaan air
      const targetY = waterLine + 25 + Math.sin(fish.x * 0.01) * 15;
      fish.y += (targetY - fish.y) * 0.02;
      fish.x += fish.vx * 0.4;
    } else if (activePellets.length > 0) {
      // MODE MAKAN: Ada pakan di air, ikan mendeteksi dan mengejar pelet terdekat
      let closestPellet = null;
      let closestDist = Infinity;

      for (let i = 0; i < activePellets.length; i++) {
        const p = activePellets[i];
        const d = Math.hypot(p.x - fish.x, p.y - fish.y);
        if (d < closestDist) {
          closestDist = d;
          closestPellet = p;
        }
      }

      if (closestPellet) {
        // Gerak aktif dan antusias menuju pelet pakan
        const dx = closestPellet.x - fish.x;
        const dy = closestPellet.y - fish.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const chaseSpeed = 2.4 + (fish.size % 3) * 0.3;

        fish.vx = (dx / dist) * chaseSpeed;
        fish.vy = (dy / dist) * chaseSpeed;
        fish.x += fish.vx;
        fish.y += fish.vy;
        fish.tailPhase += 0.25; // Ekor mengibas cepat

        // Koordinat mulut ikan di bagian depan
        const mouthX = fish.x + (fish.vx >= 0 ? fish.size : -fish.size);
        const mouthY = fish.y;
        const eatDist = Math.hypot(closestPellet.x - mouthX, closestPellet.y - mouthY);

        // IKAN MAKAN PAKAN: jika mulut ikan mencapai butiran pakan (< 15px)
        if (eatDist < 15 || dist < 16) {
          const pelletIdx = pondState.feedPellets.indexOf(closestPellet);
          if (pelletIdx !== -1) {
            pondState.feedPellets.splice(pelletIdx, 1);

            // Efek buih remah makan di sekitar mulut ikan
            for (let b = 0; b < 2; b++) {
              pondState.bubbles.push({
                x: mouthX + (Math.random() - 0.5) * 6,
                y: mouthY + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -Math.random() * 1.4 - 0.4,
                size: Math.random() * 2 + 1,
                alpha: 0.85
              });
            }
          }
        }
      }
    } else {
      // MODE NORMAL / PATROLI SANTAI
      // Kembalikan kecepatan ke ritme tenang jika sebelumnya mengejar pakan
      if (Math.abs(fish.vx) > 1.3) fish.vx *= 0.95;
      if (Math.abs(fish.vy) > 0.6) fish.vy *= 0.95;

      fish.x += fish.vx;
      fish.y += fish.vy;

      if (fish.y < waterLine + 30) fish.vy = Math.abs(fish.vy);
      if (fish.y > h - 30) fish.vy = -Math.abs(fish.vy);
    }

    // Batas dinding kiri dan kanan kolam
    if (fish.x < 120) fish.vx = Math.abs(fish.vx);
    else if (fish.x > w - 120) fish.vx = -Math.abs(fish.vx);

    // Gambar Ikan
    ctx.save();
    ctx.translate(fish.x, fish.y);
    if (fish.vx < 0) ctx.scale(-1, 1);

    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, fish.size, fish.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    const tailWiggle = Math.sin(fish.tailPhase) * 4;
    ctx.beginPath();
    ctx.moveTo(-fish.size + 2, 0);
    ctx.lineTo(-fish.size - 8, -6 + tailWiggle);
    ctx.lineTo(-fish.size - 8, 6 + tailWiggle);
    ctx.closePath();
    ctx.fill();

    // Mata ikan (putih + pupil hitam)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fish.size * 0.5, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(fish.size * 0.5 + 0.6, -2, 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawComponentLabels(ctx) {
  ctx.save();
  ctx.font = '10px "Geist", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ededed'; // Bright White Text for Dark Theme
  ctx.strokeStyle = '#0aa094'; // WIRU Teal line
  ctx.lineWidth = 1.2;

  // 1. Box Kontroler WIRU
  ctx.beginPath();
  ctx.moveTo(88, 48);
  ctx.lineTo(88, 25);
  ctx.lineTo(135, 25);
  ctx.stroke();
  ctx.fillText('Box Kontroler WIRU (IP66)', 140, 28);

  // 2. Sensor Probe
  ctx.beginPath();
  ctx.moveTo(120, 255);
  ctx.lineTo(120, 290);
  ctx.lineTo(170, 290);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Probe Sensor (DO, pH, Suhu)', 175, 293);

  // 3. Kincir Aerator
  ctx.beginPath();
  ctx.moveTo(520, 155);
  ctx.lineTo(520, 110);
  ctx.lineTo(470, 110);
  ctx.stroke();
  ctx.fillStyle = '#ededed';
  ctx.fillText('Kincir Aerator Kolam', 360, 113);

  // 4. Auto Feeder
  ctx.beginPath();
  ctx.moveTo(860, 50);
  ctx.lineTo(860, 25);
  ctx.lineTo(815, 25);
  ctx.stroke();
  ctx.fillText('Dispenser Pakan Otomatis', 680, 28);

  // 5. Pompa Sirkulasi (10A)
  ctx.beginPath();
  ctx.moveTo(195, 205);
  ctx.lineTo(195, 155);
  ctx.lineTo(240, 155);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Pompa Sirkulasi (10A)', 245, 158);

  ctx.restore();
}
