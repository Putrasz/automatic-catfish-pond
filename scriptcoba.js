
// DOM Elements
const scheduleInput = document.getElementById("schedule-time");
const countdown = document.getElementById("countdown");
const statusDiv = document.getElementById("schedule-status");
const estimateTime = document.getElementById("estimate-time");
const waterLevel = document.getElementById("water-level");
const statusIndicator = document.getElementById("status-indicator");

const drainFillBtn = document.getElementById("drain-fill");
const drainBtn = document.getElementById("drain");
const fillBtn = document.getElementById("fill");
const lockoutBtn = document.getElementById("lockout-btn");

const authModal = document.getElementById("auth-modal");
const passwordInput = document.getElementById("password");
const unlockBtn = document.getElementById("unlock-btn");
const cancelBtn = document.getElementById("cancel-btn");

// System state variables
let scheduleTime = null;
let countdownInterval = null;
let systemRunning = false;
let lockout = false;
let activeTimeouts = [];

// Water level animation
function setWaterLevel(level) {
    waterLevel.className = `water-level ${level}`;
    const levelText = {
        'low': 'Rendah',
        'medium': 'Sedang',
        'stay': 'Normal',
        'high': 'Tinggi',
        'full': 'Penuh'
    };
    document.querySelector('#kolam-lele p').textContent = `Level Air: ${levelText[level] || 'Normal'}`;
}

// Utility functions
function resetCountdownDisplay() {
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
}

function setCountdownFromMilliseconds(ms) {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = String(days).padStart(2, '0');
    document.getElementById("hours").textContent = String(hours).padStart(2, '0');
    document.getElementById("minutes").textContent = String(minutes).padStart(2, '0');
    document.getElementById("seconds").textContent = String(seconds).padStart(2, '0');
}

function clearAllTimeouts() {
    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    activeTimeouts = [];
}

// System control functions
function startScheduleCountdown() {
    if (lockout) return;

    clearInterval(countdownInterval);
    scheduleTime = new Date(scheduleInput.value).getTime();
    const now = Date.now();

    if (isNaN(scheduleTime)) {
        statusDiv.textContent = "⚠️ Waktu penjadwalan tidak valid!";
        statusDiv.style.color = "#ef4444";
        return;
    }

    if (scheduleTime <= now) {
        statusDiv.textContent = "⚠️ Pilih waktu yang akan datang!";
        statusDiv.style.color = "#ef4444";
        resetCountdownDisplay();
        return;
    }

    statusDiv.textContent = "⏳ Menunggu waktu yang dijadwalkan...";
    statusDiv.style.color = "#059669";
    updateScheduleCountdown();
    countdownInterval = setInterval(updateScheduleCountdown, 1000);
}

function updateScheduleCountdown() {
    const now = new Date().getTime();
    const distance = scheduleTime - now;

    if (distance <= 0) {
        clearInterval(countdownInterval);
        resetCountdownDisplay();
        if (!systemRunning && !lockout) startSystem();
        return;
    }

    setCountdownFromMilliseconds(distance);
}

function startManualCountdown(durationMs) {
    clearInterval(countdownInterval);
    const start = Date.now();
    countdownInterval = setInterval(() => {
        const now = Date.now();
        const remaining = durationMs - (now - start);
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            resetCountdownDisplay();
        } else {
            setCountdownFromMilliseconds(remaining);
        }
    }, 1000);
}

function startSystem() {
    if (lockout) return;

    resetAllOperations();
    systemRunning = true;
    statusDiv.textContent = "🚀 Sistem dimulai!";
    statusDiv.style.color = "#059669";
    estimateTime.innerHTML = "⚙️ Sedang bekerja... <span class='loading'></span>";

    const drainDuration = 10000;
    const fillDuration = 10000;

    // Drain animation
    setWaterLevel('medium');
    setTimeout(() => setWaterLevel('low'), 2000);
    setTimeout(() => setWaterLevel('low'), 5000);

    setTimeout(() => {
        // Fill animation
        setWaterLevel('medium');
        setTimeout(() => setWaterLevel('high'), 2000);
        setTimeout(() => setWaterLevel('stay'), 5000);
        setTimeout(() => finishSystem(), 8000);
    }, drainDuration);

    startManualCountdown(drainDuration + fillDuration);
}

function finishSystem() {
    if (!lockout) {
        setWaterLevel('stay');
        estimateTime.textContent = "✅ Proses selesai.";
        statusDiv.textContent = "✅ Sistem selesai berjalan.";
        statusDiv.style.color = "#059669";
        systemRunning = false;
    }
}

// Operation functions
function simulateDrainAndFill() {
    if (lockout) return;

    resetAllOperations();
    estimateTime.innerHTML = "🔄 Kuras dan isi air... <span class='loading'></span>";

    const drainDuration = 5000;
    const fillDuration = 5000;

    setWaterLevel('medium');
    setTimeout(() => setWaterLevel('low'), 1000);

    setTimeout(() => {
        setWaterLevel('medium');
        setTimeout(() => setWaterLevel('stay'), 2000);
        setTimeout(() => {
            estimateTime.textContent = "✅ Kuras dan isi selesai.";
        }, 3000);
    }, drainDuration);

    startManualCountdown(drainDuration + fillDuration);
}

function simulateDrain() {
    if (lockout) return;

    resetAllOperations();
    estimateTime.innerHTML = "📉 Menguras air... <span class='loading'></span>";

    setWaterLevel('medium');
    setTimeout(() => setWaterLevel('low'), 2000);
    setTimeout(() => {
        estimateTime.textContent = "✅ Kuras selesai.";
    }, 5000);

    startManualCountdown(5000);
}

function simulateFill() {
    if (lockout) return;

    resetAllOperations();
    estimateTime.innerHTML = "📈 Mengisi air... <span class='loading'></span>";

    setWaterLevel('medium');
    setTimeout(() => setWaterLevel('high'), 2000);
    setTimeout(() => setWaterLevel('stay'), 4000);
    setTimeout(() => {
        estimateTime.textContent = "✅ Pengisian selesai.";
    }, 5000);

    startManualCountdown(5000);
}

function resetAllOperations() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    clearAllTimeouts();
    resetCountdownDisplay();
    scheduleTime = null;
    setWaterLevel('stay');
}

// Lock/unlock functions
function showLockDisplay() {
    authModal.style.display = "flex";
    passwordInput.focus();
}

function lockSystem() {
    const password = passwordInput.value.trim();
    if (password === "1234") {
        lockout = true;
        authModal.style.display = "none";
        passwordInput.value = "";

        resetAllOperations();
        systemRunning = false;
        statusDiv.textContent = "🔒 SISTEM TELAH DIMATIKAN";
        statusDiv.style.color = "#ef4444";
        estimateTime.textContent = "❌ Sistem tidak aktif";

        lockoutBtn.textContent = "🔓 SISTEM DIMATIKAN";
        lockoutBtn.classList.add('locked');

        statusIndicator.textContent = "🔴 Sistem Offline";
        statusIndicator.className = "status-indicator offline";
    } else {
        alert("❌ Password salah!");
        passwordInput.value = "";
        passwordInput.focus();
    }
}

function unlockSystem() {
    lockout = false;
    statusDiv.textContent = "✅ Sistem kembali aktif";
    statusDiv.style.color = "#059669";
    estimateTime.textContent = "⏱️ Sistem siap digunakan";

    lockoutBtn.textContent = "🔒 MATIKAN SISTEM";
    lockoutBtn.classList.remove('locked');

    statusIndicator.textContent = "🟢 Sistem Online";
    statusIndicator.className = "status-indicator online";
}

function cancelLock() {
    authModal.style.display = "none";
    passwordInput.value = "";
}

// API functions (simulated for demo)
let relayStatus = 0;
let drainStatus = 0;
let drainfillStatus = 0;

async function toggleRelay() {
    if (lockout) {
        alert("⚠️ Sistem sedang dikunci!");
        return;
    }

    const nextStatus = relayStatus === 0 ? 1 : 0;
    relayStatus = nextStatus;

    if (relayStatus === 1) {
        fillBtn.innerHTML = "⏹️ Hentikan Pengisian";
        simulateFill();
    } else {
        fillBtn.innerHTML = "📈 Isi Air";
        resetAllOperations();
        estimateTime.textContent = "⏱️ Sistem siap digunakan";
    }
}

async function toggleDrain() {

    const nextDrain = drainStatus === 0 ? 1 : 0;

    if (lockout) {
        alert("⚠️ Sistem sedang dikunci!");
        return;
    }

  try {
    const response = await fetch('control.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmkuras: nextDrain }) 
    });

    const result = await response.json();
    drainStatus = result.relay_status;
    console.log("Nilai tmkuras (drainStatus) dari server:", drainStatus);

    if (drainStatus === 1) {
        drainBtn.innerHTML = "⏹️ Hentikan Kuras";
        simulateDrain();
    } else {
        drainBtn.innerHTML = "📉 Kuras Air";
        resetAllOperations();
        estimateTime.textContent = "⏱️ Sistem siap digunakan";
    }
  } catch (error) {
    console.error("Gagal mengubah status kuras:", error);
  }
}

async function toggleDrainfill() {
    if (lockout) {
        alert("⚠️ Sistem sedang dikunci!");
        return;
    }

    const nextDrainfill = drainfillStatus === 0 ? 1 : 0;

    try {
        const response = await fetch('control.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tmkurasis: nextDrainfill }) // kirim status baru
        });

        if (!response.ok) throw new Error("Gagal menghubungi server");

        const result = await response.json();

        if (typeof result.relay_status === 'undefined') {
            throw new Error("Respons tidak valid dari server");
        }

        drainfillStatus = result.relay_status;
        console.log("Nilai tmkurasis dari server:", drainfillStatus);

        if (drainfillStatus === 1) {
            drainFillBtn.innerHTML = "⏹️ Hentikan Proses";
            simulateDrainAndFill();
        } else {
            drainFillBtn.innerHTML = "🔄 Kuras dan Isi Air";
            resetAllOperations();
            estimateTime.textContent = "⏱️ Sistem siap digunakan";
        }

    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        alert("❌ Terjadi kesalahan saat mengubah status drain/fill.\n" + error.message);
    }
}


// Event listeners
scheduleInput.addEventListener("change", () => {
    if (!lockout) startScheduleCountdown();
});

lockoutBtn.addEventListener("click", () => {
    if (lockout) {
        unlockSystem();
    } else {
        showLockDisplay();
    }
});

unlockBtn.addEventListener("click", lockSystem);
cancelBtn.addEventListener("click", cancelLock);

passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        lockSystem();
    }
});

window.addEventListener("click", (e) => {
    if (e.target === authModal) {
        cancelLock();
    }
});

// Initialize system
resetCountdownDisplay();
setWaterLevel('stay');

// Set default datetime to 1 hour from now
const now = new Date();
now.setHours(now.getHours() + 1);
scheduleInput.value = now.toISOString().slice(0, 16);

// Connection status simulation
setInterval(() => {
    // Simulate connection check
    const isOnline = Math.random() > 0.1; // 90% online
    if (isOnline && !lockout) {
        statusIndicator.textContent = "🟢 Sistem Online";
        statusIndicator.className = "status-indicator online";
    } else if (!lockout) {
        statusIndicator.textContent = "🟡 Koneksi Tidak Stabil";
        statusIndicator.className = "status-indicator offline";
        statusIndicator.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
    }
}, 30000); // Check every 30 seconds

// Add smooth transitions for buttons
document.querySelectorAll('.control-button').forEach(button => {
    button.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-2px) scale(1.02)';
    });

    button.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      `;

    const colors = {
        'success': 'linear-gradient(135deg, #10b981, #059669)',
        'error': 'linear-gradient(135deg, #ef4444, #dc2626)',
        'warning': 'linear-gradient(135deg, #f59e0b, #d97706)',
        'info': 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };

    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
document.head.appendChild(style);

// Enhanced button feedback
function addButtonFeedback() {
    document.querySelectorAll('.control-button').forEach(button => {
        button.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

addButtonFeedback();

// System status messages
const statusMessages = {
    ready: "⏱️ Sistem siap digunakan",
    working: "⚙️ Sistem sedang bekerja...",
    draining: "📉 Menguras air...",
    filling: "📈 Mengisi air...",
    drainFill: "🔄 Kuras dan isi air...",
    complete: "✅ Proses selesai",
    locked: "❌ Sistem tidak aktif",
    scheduled: "⏳ Menunggu waktu yang dijadwalkan..."
};

// Initialize with welcome message
setTimeout(() => {
    showNotification("🐟 Sistem Otomatisasi Kolam Siap!", "success");
}, 1000);

console.log("🐟 Sistem Otomatisasi Kolam Ikan Lele - Versi 2.0");
console.log("✅ Sistem berhasil diinisialisasi");
