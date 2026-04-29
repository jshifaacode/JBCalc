(function() {
  const canvas = document.getElementById('aurora-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  const blobs = [
    { x: 0.2, y: 0.3, r: 0.5, hue: 260, speed: 0.0008 },
    { x: 0.7, y: 0.6, r: 0.4, hue: 200, speed: 0.0012 },
    { x: 0.5, y: 0.1, r: 0.35, hue: 290, speed: 0.001 },
    { x: 0.85, y: 0.2, r: 0.3, hue: 170, speed: 0.0015 },
  ];

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const alpha = isDark ? 0.18 : 0.09;

    blobs.forEach((b, i) => {
      const x = W * (b.x + 0.12 * Math.sin(t * b.speed * 1000 + i));
      const y = H * (b.y + 0.08 * Math.cos(t * b.speed * 1000 + i * 1.3));
      const r = Math.min(W, H) * (b.r + 0.05 * Math.sin(t * b.speed * 800 + i * 2.1));
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `hsla(${b.hue}, 80%, 65%, ${alpha})`);
      grad.addColorStop(0.5, `hsla(${b.hue + 20}, 70%, 55%, ${alpha * 0.4})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    });

    if (isDark) {
      ctx.strokeStyle = 'rgba(124,58,237,0.04)';
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    t += 16;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();
