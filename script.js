const envelope = document.getElementById("envelope");
const music = document.getElementById("music");
const cake = document.getElementById("cake");


const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resize);
resize();

/* ---- FX: snow/blue sparkles + confetti ---- */
const snow = [];
const confetti = [];
const rand = (a, b) => Math.random() * (b - a) + a;

function makeSnow(n = 110) {
    snow.length = 0;
    for (let i = 0; i < n; i++) {
        snow.push({
            x: rand(0, window.innerWidth),
            y: rand(-window.innerHeight, window.innerHeight),
            r: rand(0.8, 2.4),
            sp: rand(0.6, 2.2),
            drift: rand(-0.5, 0.5),
            a: rand(0.25, 0.85),
            hue: Math.random() < 0.65 ? 200 : 210
        });
    }
}
makeSnow();

function burstConfetti(count = 140) {
    for (let i = 0; i < count; i++) {
        const isWhite = Math.random() < 0.45;
        confetti.push({
            x: window.innerWidth / 2 + rand(-20, 20),
            y: window.innerHeight / 2 + rand(-40, 40),
            vx: rand(-6.5, 6.5),
            vy: rand(-10.5, -3.5),
            g: rand(0.18, 0.35),
            w: rand(4, 9),
            h: rand(6, 14),
            rot: rand(0, Math.PI * 2),
            vr: rand(-0.22, 0.22),
            life: rand(70, 120),
            color: isWhite ? "rgba(255,255,255,.95)" :
                (Math.random() < 0.5 ? "rgba(47,191,255,.95)" : "rgba(106,168,255,.95)")
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // snow/sparkles
    for (const p of snow) {
        p.y += p.sp;
        p.x += p.drift;
        if (p.y > window.innerHeight + 10) { p.y = -10; p.x = rand(0, window.innerWidth); }
        if (p.x < -10) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 10) p.x = -10;

        ctx.beginPath();
        ctx.fillStyle = p.hue === 200 ? `rgba(47,191,255,${p.a})` : `rgba(255,255,255,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // confetti
    for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.vy += c.g;
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vr;
        c.life -= 1;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();

        if (c.life <= 0 || c.y > window.innerHeight + 80) confetti.splice(i, 1);
    }

    requestAnimationFrame(draw);
}
draw();

/* ---- Envelope interactions + music ---- */
let openedOnce = false;

function tryPlayMusic() {
    // มือถือจะเล่นได้เพราะเกิดจากการคลิก
    music.play().catch(() => { });
}

function toggleOpen() {
    envelope.classList.toggle("open");
    const isOpen = envelope.classList.contains("open");

    // ✅ เค้กนอกซอง: โชว์เมื่อเปิด
    cake.classList.toggle("show", isOpen);

    if (isOpen) {
        burstConfetti(openedOnce ? 90 : 170);
        if (!openedOnce) {
            openedOnce = true;
            music.play().catch(() => { });
        }
    }
}

envelope.addEventListener("click", toggleOpen);
envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleOpen();
    }
});
