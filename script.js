const envelope = document.getElementById("envelope");
const music = document.getElementById("music");
const cake = document.getElementById("cake");
const countdownEl = document.getElementById("countdown");
const countNumEl = countdownEl?.querySelector(".count-num");
const countTextEl = countdownEl?.querySelector(".count-text");

let isCounting = false;
let openedOnce = false;

/* ---- FX: Canvas Setup ---- */
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const rand = (a, b) => Math.random() * (b - a) + a;

/* ---- FX: Particles (Subtle floating sparkles) ---- */
const particles = [];
function makeParticles(n = 80) {
    particles.length = 0;
    for (let i = 0; i < n; i++) {
        particles.push({
            x: rand(0, window.innerWidth),
            y: rand(0, window.innerHeight),
            size: rand(0.5, 2),
            speedY: rand(-0.2, -0.8), // Float up
            speedX: rand(-0.2, 0.2),
            alpha: rand(0.3, 0.8),
            color: Math.random() < 0.5 ? "255, 255, 255" : "59, 130, 246" // White or Blue
        });
    }
}
makeParticles();

/* ---- FX: Confetti (Gold & Blue) ---- */
const confetti = [];
function burstConfetti(count = 150) {
    const colors = [
        "#3b82f6", // Royal Blue
        "#f59e0b", // Gold
        "#ffffff", // White
        "#60a5fa"  // Lighter Blue
    ];
    
    for (let i = 0; i < count; i++) {
        confetti.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            vx: rand(-10, 10),
            vy: rand(-15, 5),
            gravity: 0.25,
            rotation: rand(0, 360),
            rotationSpeed: rand(-5, 5),
            size: rand(6, 12),
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0,
            decay: rand(0.005, 0.015)
        });
    }
}

function updateDraw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Draw Background Particles (p)
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.y += p.speedY; // Move up
        p.x += p.speedX; // Drift horizontally

        // If particle goes off screen top, reset to bottom
        if (p.y < -10) {
            p.y = window.innerHeight + 10;
            p.x = rand(0, window.innerWidth);
        }
        
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Confetti (c)
    for (let i = confetti.length - 1; i >= 0; i--) {
        let c = confetti[i];
        
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity * 0.5; // Slower gravity
        c.rotation += c.rotationSpeed;
        c.life -= c.decay;

        if (c.life <= 0 || c.y > window.innerHeight + 20) {
            confetti.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation * Math.PI / 180);
        ctx.fillStyle = c.color;
        
        ctx.globalAlpha = c.life;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.restore();
    }

    requestAnimationFrame(updateDraw);
}
updateDraw();


/* ---- Logic: Envelope Open ---- */
function openEnvelope() {
    if (envelope.classList.contains("open")) return;
    
    // 1. Play Music
    if (!openedOnce) {
        music.play().then(() => {
            console.log("Music playing");
        }).catch(e => {
            console.log("Auto-play prevented:", e);
        });
        openedOnce = true;
    }

    // 2. Add class to animate CSS
    envelope.classList.add("open");
    
    // 3. Burst Confetti
    for(let i=0; i<3; i++) {
        setTimeout(() => burstConfetti(100), i * 300);
    }
    
    // 4. Hide Countdown
    if(countdownEl) countdownEl.classList.add("hidden");
    isCounting = false;
}

function startCountdown() {
    if (isCounting || envelope.classList.contains("open")) return;
    isCounting = true;

    // Show countdown overlay
    if(countdownEl) countdownEl.classList.remove("hidden");
    
    let count = 3;
    if(countNumEl) countNumEl.textContent = count;
    if(countTextEl) countTextEl.textContent = "Are you ready? ✨";

    const tick = () => {
        countNumEl.style.transform = "scale(1.3)";
        setTimeout(() => countNumEl.style.transform = "scale(1)", 200);

        if (count > 0) {
            countNumEl.textContent = count;
            count--;
            setTimeout(tick, 1000);
        } else {
            countNumEl.textContent = "Enjoy! 🎂";
            setTimeout(() => {
                openEnvelope();
            }, 500);
        }
    };
    tick();
}

// Interaction
const handleInteraction = (e) => {
    // Prevent double firing on some devices if both click and touch are supported
    if (e.type === 'touchstart') {
        e.preventDefault(); // Might prevent click emulation
    }

    if (!envelope.classList.contains("open") && !isCounting) {
        startCountdown();
    } else if (envelope.classList.contains("open")) {
        // Replay confetti on click if already open
        burstConfetti(50);
    }
};

envelope.addEventListener("click", handleInteraction);
envelope.addEventListener("touchstart", handleInteraction, { passive: false });
