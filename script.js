const systemCountdownDisplay = document.getElementById("system-countdown");
const estimateTime = document.getElementById("estimate-time");
const levelImg = document.getElementById("level-img");

const drainFillBtn = document.getElementById("drain-fill");
const drainBtn = document.getElementById("drain");
const fillBtn = document.getElementById("fill");
const lockoutBtn = document.getElementById("lockout-btn");

const authModal = document.getElementById("auth-modal");
const passwordInput = document.getElementById("password");
const unlockBtn = document.getElementById("unlock-btn");
const cancelBtn = document.getElementById("cancel-btn");

let drainAnimationInterval = null;
let fillAnimationInterval = null;
let systemCountdownInterval = null;
let systemRunning = false;
let lockout = false;
let systemDuration = 10000;
let activeTimeouts = [];

// Countdown helpers
function resetCountdownDisplay(el) {
  el.querySelectorAll("span").forEach(span => {
    span.textContent = "00";
  });
}

function updateRealtimeClock() {
  const now = new Date();

  // Nama hari dan bulan lokal
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const dayName = days[now.getDay()];
  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  document.getElementById("schedule-date").textContent = `${dayName}, ${date} ${month} ${year}`;
  document.getElementById("schedule-hours").textContent = hours;
  document.getElementById("schedule-minutes").textContent = minutes;
  document.getElementById("schedule-seconds").textContent = seconds;
}

// Jalankan setiap detik
setInterval(updateRealtimeClock, 1000);
// Jalankan saat pertama kali
updateRealtimeClock();

function setCountdownFromMilliseconds(el, ms) {
  const spans = el.querySelectorAll("span");
  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (spans.length >= 2) {
    spans[0].textContent = String(minutes).padStart(2, '0');
    spans[1].textContent = String(seconds).padStart(2, '0');
  }
}


function clearAllTimeouts() {
  activeTimeouts.forEach(timeout => clearTimeout(timeout));
  activeTimeouts = [];
}

function startSystemCountdown(durationMs) {
  clearInterval(systemCountdownInterval);
  setCountdownFromMilliseconds(systemCountdownDisplay, durationMs);

  const startTime = Date.now();
  systemCountdownInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, durationMs - elapsed);

    if (remaining <= 0) {
      clearInterval(systemCountdownInterval);
      resetCountdownDisplay(systemCountdownDisplay);
    } else {
      setCountdownFromMilliseconds(systemCountdownDisplay, remaining);
    }
  }, 100);
}

function startSystem() {
  if (lockout) return;

  resetAllOperations();
  systemRunning = true;
  estimateTime.innerText = "Sedang bekerja...";

  const drainDuration = 10000;
  const fillDuration = 10000;

  startSystemCountdown(drainDuration + fillDuration);

  const drainImages = ["images/TURUN-3.png", "images/TURUN-2.png", "images/TURUN-1.png"];
  let drainCycle = 0;
  const totalDrainCycles = Math.floor(drainDuration / 1000);

  drainAnimationInterval = setInterval(() => {
    if (lockout) return;
    const imgIndex = drainCycle % drainImages.length;
    levelImg.src = drainImages[imgIndex];
    drainCycle++;

    if (drainCycle >= totalDrainCycles) {
      clearInterval(drainAnimationInterval);
      startFillAnimation(fillDuration);
    }
  }, 1000);
}

function startFillAnimation(duration) {
  if (lockout) return;

  const fillImages = ["images/NAIK-1.png", "images/NAIK-2.png", "images/NAIK-3.png"];
  let fillCycle = 0;
  const totalFillCycles = Math.floor(duration / 1000);

  fillAnimationInterval = setInterval(() => {
    if (lockout) return;
    const imgIndex = fillCycle % fillImages.length;
    levelImg.src = fillImages[imgIndex];
    fillCycle++;

    if (fillCycle >= totalFillCycles) {
      clearInterval(fillAnimationInterval);
      finishSystem();
    }
  }, 1000);
}

function finishSystem() {
  if (!lockout) {
    levelImg.src = "images/STAY.png";
    estimateTime.innerText = "Proses selesai.";
    systemRunning = false;
  }
}

function simulateOperation(drain, fill) {
  if (lockout) return;
  resetAllOperations();
  estimateTime.innerText = "Sedang bekerja...";
  const duration = (drain ? 10000 : 0) + (fill ? 10000 : 0);
  startSystemCountdown(duration);

  if (drain) {
    const drainImages = ["images/TURUN-3.png", "images/TURUN-2.png", "images/TURUN-1.png"];
    let drainCycle = 0;
    const totalDrainCycles = 10;
    drainAnimationInterval = setInterval(() => {
      if (lockout) return;
      const imgIndex = drainCycle % drainImages.length;
      levelImg.src = drainImages[imgIndex];
      drainCycle++;
      if (drainCycle >= totalDrainCycles) {
        clearInterval(drainAnimationInterval);
        if (fill) startFillAnimation(10000);
        else finishSystem();
      }
    }, 1000);
  } else if (fill) {
    startFillAnimation(10000);
  }
}

function resetAllAnimations() {
  clearInterval(drainAnimationInterval);
  drainAnimationInterval = null;
  clearInterval(fillAnimationInterval);
  fillAnimationInterval = null;
  levelImg.src = "images/STAY.png";
}

function resetAllOperations() {
  resetAllAnimations();
  clearInterval(systemCountdownInterval);
  systemCountdownInterval = null;
  clearAllTimeouts();
  resetCountdownDisplay(systemCountdownDisplay);
}

function showLockDisplay() {
  authModal.style.display = "flex";
}

function lockSystem() {
  const password = passwordInput.value.trim();
  if (password === "1234") {
    lockout = true;
    authModal.style.display = "none";
    resetAllOperations();
    systemRunning = false;
    estimateTime.innerText = "SISTEM TERKUNCI!";
    levelImg.src = "images/STAY.png";
  } else {
    alert("Password salah!");
    passwordInput.value = "";
    passwordInput.focus();
  }
}

function cancelLock() {
  authModal.style.display = "none";
  passwordInput.value = "";
}


let relayStatus = 0;

let drainStatus = 0;
let drainfillstatus = 0;


async function toggleRelay() {
  // Tentukan status yang ingin dikirim
  const nextStatus = relayStatus === 0 ? 1 : 0;

  try {
    const response = await fetch('control.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relay_status: nextStatus })
    });

    const result = await response.json();

    // Gunakan status dari server (bukan variabel lokal)
    relayStatus = result.relay_status;
    console.log("Nilai relayStatus dari server:", relayStatus);

    if (relayStatus == 1) {
      document.getElementById('fill').textContent = 'Proses Mengisi';
    } else {
      document.getElementById('fill').textContent = 'Apakah Anda Ingin Mengisi  Air';
    }

    console.log("Relay Status:", relayStatus);
  } catch (error) {
    console.error("Gagal mengubah status relay:", error);
  }
}

async function toggleDrain() {
  const nextDrain = drainStatus === 0 ? 1 : 0;

  try {
    const response = await fetch('control.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmkuras: nextDrain }) 
    });

    const result = await response.json();
    drainStatus = result.relay_status;
    console.log("Nilai tmkuras (drainStatus) dari server:", drainStatus);

    if (drainStatus == 1) {
      document.getElementById('drain').textContent = 'Sedang Menguras';
    } else {
      document.getElementById('drain').textContent = 'Apakah Anda Ingin Kuras Air ?';
    }

  } catch (error) {
    console.error("Gagal mengubah status kuras:", error);
  }
}

let drainfillStatus = 0; // Variabel global

async function toggleDrainfill() {
  const nextDrainfill = drainfillStatus === 0 ? 1 : 0;

  try {
    const response = await fetch('control.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmkurasis: nextDrainfill }) // sesuai dengan PHP
    });

    const result = await response.json();
    drainfillStatus = result.relay_status;

    console.log("Nilai tmkurasis dari server:", drainfillStatus);

    if (drainfillStatus === 1) {
      document.getElementById('drain-fill').textContent = 'Proses';
    } else {
      document.getElementById('drain-fill').textContent = 'Apakah Anda Ingin Kuras dan Isi Air?';
    }

  } catch (error) {
    console.error("Gagal mengubah status kuras:", error);
  }
}

let systemLocked = false;

document.getElementById("lockout-btn").addEventListener("click", function () {
  systemLocked = !systemLocked;

  if (systemLocked) {
    // Ubah tampilan tombol
    this.innerText = "SISTEM DIMATIKAN";
    this.style.backgroundColor = "red";

    // Kirim status ke server (jika ada backend)
    sendLockoutStatus(true);

    // Tampilkan status
    alert("⚠️ Sistem otomatis dimatikan.");
  } else {
    this.innerText = "MATIKAN SISTEM";
    this.style.backgroundColor = "";

    sendLockoutStatus(false);
    alert("✅ Sistem otomatis kembali aktif.");
  }
});





// Event listeners
drainFillBtn.addEventListener("click", () => simulateOperation(true, true));
drainBtn.addEventListener("click", () => simulateOperation(true, false));
fillBtn.addEventListener("click", () => simulateOperation(false, true));
lockoutBtn.addEventListener("click", showLockDisplay);
unlockBtn.addEventListener("click", lockSystem);
cancelBtn.addEventListener("click", cancelLock);

window.addEventListener("click", (e) => {
  if (e.target === authModal) cancelLock();
});

// Initialize
resetCountdownDisplay(systemCountdownDisplay);
