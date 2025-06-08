const scheduleInput = document.getElementById("schedule-time");
const countdown = document.getElementById("countdown");
const statusDiv = document.getElementById("schedule-status");
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
let scheduleTime = null;
let countdownInterval = null;
let systemRunning = false;
let lockout = false;
let systemDuration = 10000; // Default 10 detik
let activeTimeouts = [];

// Sistem waktu
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

// Sistem scheduling functions
function startScheduleCountdown() {
  if (lockout) return;
  
  clearInterval(countdownInterval);
  scheduleTime = new Date(scheduleInput.value).getTime();
  const now = Date.now();

  if (isNaN(scheduleTime)) {
    alert("Waktu penjadwalan tidak valid!");
    return;
  }

  if (scheduleTime <= now) {
    alert("Tanggal/waktu yang dipilih sudah lewat! Silakan pilih waktu yang akan datang.");
    resetCountdownDisplay();
    return;
  }

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
  
  // Menampilkan durasi asli
  setCountdownFromMilliseconds(durationMs);
  
  const startTime = Date.now();
  
  countdownInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, durationMs - elapsed);
    
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      resetCountdownDisplay();
    } else {
      setCountdownFromMilliseconds(remaining);
    }
  }, 100); // Update waktu setiap 100ms untuk ketepatan waktu
}

function startSystem() {
  if (lockout) return;
  
  resetAllOperations();
  systemRunning = true;
  statusDiv.innerText = "Sistem dimulai!";
  estimateTime.innerText = "Sedang bekerja...";
  
  // Durasi untuk masing-masing operasi
  const drainDuration = 10000;
  const fillDuration = 10000;
  
  // Mulai hitung mundur sebelum menampilkan animasi
  startManualCountdown(drainDuration + fillDuration);
  
  // Animasi Kuras (DRAIN)
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
  
  // Animasi Mengisi (FILL)
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
    statusDiv.innerText = "Sistem selesai berjalan.";
    systemRunning = false;
  }
}

// Operation functions
function setSystemDuration(durationMs) {
  systemDuration = durationMs;
  alert(`Durasi sistem diatur ke ${durationMs/1000} detik`);
}

function simulateDrainAndFill() {
  if (lockout) return;

  resetAllOperations();
  estimateTime.innerText = "Sedang bekerja...";

  // masing" 10 detik
  const drainDuration = 10000;
  const fillDuration = 10000; 
  
  startManualCountdown(drainDuration + fillDuration);
  
  // Animasi kuras (DRAIN)
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

function simulateDrain() {
  if (lockout) return;

  resetAllOperations();
  estimateTime.innerText = "Sedang menguras air...";

  const duration = 10000;
  
  startManualCountdown(duration);
  
  const drainImages = ["images/TURUN-3.png", "images/TURUN-2.png", "images/TURUN-1.png"];
  let drainCycle = 0;
  const totalCycles = Math.floor(duration / 1000);

  drainAnimationInterval = setInterval(() => {
    if (lockout) return;
    const imgIndex = drainCycle % drainImages.length;
    levelImg.src = drainImages[imgIndex];
    drainCycle++;
    
    if (drainCycle >= totalCycles) {
      clearInterval(drainAnimationInterval);
      if (!lockout) {
        levelImg.src = "images/STAY.png";
        estimateTime.innerText = "Kuras selesai.";
      }
    }
  }, 1000);
}

function simulateFill() {
  if (lockout) return;

  resetAllOperations();
  estimateTime.innerText = "Sedang mengisi air...";

  const duration = 10000;
  
  startManualCountdown(duration);
  
  const fillImages = ["images/NAIK-1.png", "images/NAIK-2.png", "images/NAIK-3.png"];
  let fillCycle = 0;
  const totalCycles = Math.floor(duration / 1000);

  fillAnimationInterval = setInterval(() => {
    if (lockout) return;
    const imgIndex = fillCycle % fillImages.length;
    levelImg.src = fillImages[imgIndex];
    fillCycle++;
    
    if (fillCycle >= totalCycles) {
      clearInterval(fillAnimationInterval);
      if (!lockout) {
        levelImg.src = "images/STAY.png";
        estimateTime.innerText = "Pengisian selesai.";
      }
    }
  }, 1000);
}

function resetAllAnimations() {
  if (drainAnimationInterval) {
    clearInterval(drainAnimationInterval);
    drainAnimationInterval = null;
  }
  if (fillAnimationInterval) {
    clearInterval(fillAnimationInterval);
    fillAnimationInterval = null;
  }
  levelImg.src = "images/STAY.png";
}

function resetAllOperations() {
  resetAllAnimations();
  clearInterval(countdownInterval);
  countdownInterval = null;
  clearAllTimeouts();
  resetCountdownDisplay();
  scheduleTime = null;
}

// Lock function
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
    statusDiv.innerText = "SISTEM TELAH DIMATIKAN.";
    estimateTime.innerText = "";
    levelImg.src = "images/STAY.png";
  } else {
    alert("Password salah!");
    passwordInput.value = "";
    passwordInput.focus();
  }
}

// Event listeners
scheduleInput.addEventListener("change", () => {
  if (!lockout) startScheduleCountdown();
});

drainFillBtn.addEventListener("click", simulateDrainAndFill);
drainBtn.addEventListener("click", simulateDrain);
fillBtn.addEventListener("click", simulateFill);
lockoutBtn.addEventListener("click", showLockDisplay);
unlockBtn.addEventListener("click", lockSystem);
cancelBtn.addEventListener("click", cancelLock);

window.addEventListener("click", (e) => {
  if (e.target === authModal) {
    cancelLock();
  }
});

// Initialize
resetCountdownDisplay();