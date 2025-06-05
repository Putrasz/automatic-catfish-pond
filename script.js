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

// System state variables
let drainAnimationInterval = null;
let fillAnimationInterval = null;
let scheduleTime = null;
let countdownInterval = null;
let systemRunning = false;
let lockout = false;
let systemDurationDrainAndFill = 10000;
let activeTimeouts = []; // Track all active timeouts

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
    alert("Waktu penjadwalan tidak valid!");
    return;
  }

  if (scheduleTime <= now) {
    alert("Tanggal/waktu yang dipilih sudah lewat! Silakan pilih waktu yang akan datang.");
    resetCountdownDisplay();
    statusDiv.innerText = "Penjadwalan gagal: waktu sudah lewat.";
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
  statusDiv.innerText = "Sistem dimulai!";
  estimateTime.innerText = "Sedang bekerja...";
  levelImg.src = "images/TURUN-3.png";
  
  const timeout1 = setTimeout(() => {
    if (lockout) return;
    levelImg.src = "images/NAIK-3.png";
    
    const timeout2 = setTimeout(() => {
      if (lockout) return;
      levelImg.src = "images/STAY.png";
      estimateTime.innerText = "Drain & Fill selesai.";
      statusDiv.innerText = "Sistem selesai berjalan.";
      systemRunning = false;
    }, 4000);
    activeTimeouts.push(timeout2);
  }, 4000);
  
  activeTimeouts.push(timeout1);
  startManualCountdown(systemDurationDrainAndFill);
}

// Operation functions
function simulateDrainAndFill() {
  if (lockout) return;

  resetAllOperations();
  estimateTime.innerText = "Sedang bekerja...";

  const drainImages = ["images/TURUN-3.png", "images/TURUN-2.png", "images/TURUN-1.png"];
  const fillImages = ["images/NAIK-1.png", "images/NAIK-2.png", "images/NAIK-3.png"];
  let currentStep = 0;

  drainAnimationInterval = setInterval(() => {
    if (lockout) return;
    levelImg.src = drainImages[currentStep];
    currentStep = (currentStep + 1) % drainImages.length;
  }, 1000);

  const drainTimeout = setTimeout(() => {
    clearInterval(drainAnimationInterval);
    if (lockout) return;
    
    currentStep = 0;
    fillAnimationInterval = setInterval(() => {
      if (lockout) return;
      levelImg.src = fillImages[currentStep];
      currentStep = (currentStep + 1) % fillImages.length;
    }, 1000);

    const fillTimeout = setTimeout(() => {
      clearInterval(fillAnimationInterval);
      if (!lockout) {
        levelImg.src = "images/STAY.png";
        estimateTime.innerText = "Kuras dan Isi selesai.";
      }
    }, 4000);
    
    activeTimeouts.push(fillTimeout);
  }, 4000);
  
  activeTimeouts.push(drainTimeout);
  startManualCountdown(8000);
}

function simulateDrain() {
  if (lockout) return;

  resetAllOperations();
  estimateTime.innerText = "Sedang menguras air...";

  const drainImages = ["images/TURUN-3.png", "images/TURUN-2.png", "images/TURUN-1.png"];
  let currentStep = 0;

  drainAnimationInterval = setInterval(() => {
    if (lockout) return;
    levelImg.src = drainImages[currentStep];
    currentStep = (currentStep + 1) % drainImages.length;
  }, 1000);

  const drainTimeout = setTimeout(() => {
    clearInterval(drainAnimationInterval);
    if (!lockout) {
      levelImg.src = "images/STAY.png";
      estimateTime.innerText = "Kuras selesai.";
    }
  }, 10000);
  
  activeTimeouts.push(drainTimeout);
  startManualCountdown(10000);
}

function simulateFill() {
  if (lockout) return;

  resetAllOperations();
  estimateTime.innerText = "Sedang mengisi air...";

  const fillImages = ["images/NAIK-1.png", "images/NAIK-2.png", "images/NAIK-3.png"];
  let currentStep = 0;

  fillAnimationInterval = setInterval(() => {
    if (lockout) return;
    levelImg.src = fillImages[currentStep];
    currentStep = (currentStep + 1) % fillImages.length;
  }, 1000);

  const fillTimeout = setTimeout(() => {
    clearInterval(fillAnimationInterval);
    if (!lockout) {
      levelImg.src = "images/STAY.png";
      estimateTime.innerText = "Pengisian selesai.";
    }
  }, 10000);
  
  activeTimeouts.push(fillTimeout);
  startManualCountdown(10000);
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

// Lock/unlock functions
function lockSystem() {
  authModal.style.display = "flex";
  statusDiv.innerText = "Konfirmasi matikan sistem...";
  estimateTime.innerText = "";
  passwordInput.value = "";
  passwordInput.focus();
}

function unlockSystem() {
  const password = passwordInput.value.trim();
  if (password === "1234") {
    lockout = true;
    authModal.style.display = "none";
    
    // Completely reset the system
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

function cancelLock() {
  authModal.style.display = "none";
  statusDiv.innerText = "Sistem berjalan normal";
}

// Event listeners
scheduleInput.addEventListener("change", () => {
  if (!lockout) startScheduleCountdown();
});

drainFillBtn.addEventListener("click", simulateDrainAndFill);
drainBtn.addEventListener("click", simulateDrain);
fillBtn.addEventListener("click", simulateFill);
lockoutBtn.addEventListener("click", lockSystem);
unlockBtn.addEventListener("click", unlockSystem);
cancelBtn.addEventListener("click", cancelLock);

window.addEventListener("click", (e) => {
  if (e.target === authModal) {
    cancelLock();
  }
});

// Initialize
resetCountdownDisplay();