const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let balls, paddle, bricks, particles;
let score, lives, level, speed;

// SOUND
const bounceSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const breakSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");

// START
function startGame() {
  level = 1;
  score = 0;
  lives = 3;
  speed = parseInt(document.getElementById("difficulty").value);

  initLevel();
  requestAnimationFrame(loop);
}

// INIT
function initLevel() {
  balls = [{ x: 300, y: 200, dx: speed, dy: -speed }];
  paddle = { x: 250, y: 370, w: 100, h: 10 };
  particles = [];

  bricks = [];
  for (let r = 0; r < 4 + level; r++) {
    for (let c = 0; c < 8; c++) {
      bricks.push({
        x: c * 70 + 35,
        y: r * 25 + 30,
        w: 60,
        h: 20,
        hp: 1,
        power: Math.random() < 0.2
      });
    }
  }
}

// PARTICLES
function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x, y,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      life: 20
    });
  }
}

// LOOP
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // BALLS
  balls.forEach(ball => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // wall
    if (ball.x < 0 || ball.x > canvas.width) ball.dx *= -1;
    if (ball.y < 0) ball.dy *= -1;

    // paddle
    if (
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.w &&
      ball.y > paddle.y
    ) {
      ball.dy *= -1;
      bounceSound.play();
    }

    // bricks
    bricks.forEach(b => {
      if (
        b.hp > 0 &&
        ball.x > b.x &&
        ball.x < b.x + b.w &&
        ball.y > b.y &&
        ball.y < b.y + b.h
      ) {
        ball.dy *= -1;
        b.hp = 0;
        score++;
        breakSound.play();
        createParticles(b.x + 30, b.y + 10);

        // power-up
        if (b.power) {
          activatePower();
        }
      }
    });

    // draw ball
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // PARTICLES
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;

    ctx.fillStyle = "white";
    ctx.fillRect(p.x, p.y, 2, 2);
  });

  particles = particles.filter(p => p.life > 0);

  // PADDLE
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

  // BRICKS
  bricks.forEach(b => {
    if (b.hp > 0) {
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
  });

  // LOSE BALL
  balls = balls.filter(ball => ball.y < canvas.height);

  if (balls.length === 0) {
    lives--;
    if (lives <= 0) {
      alert("Game Over");
      return;
    }
    balls.push({ x: 300, y: 200, dx: speed, dy: -speed });
  }

  // NEXT LEVEL
  if (bricks.every(b => b.hp === 0)) {
    level++;
    initLevel();
  }

  document.getElementById("info").innerText =
    `Score: ${score} | Lives: ${lives} | Level: ${level}`;

  requestAnimationFrame(loop);
}

// POWER-UP
function activatePower() {
  let rand = Math.random();

  if (rand < 0.5) {
    // multi ball
    balls.push({ ...balls[0], dx: -balls[0].dx });
  } else {
    // bigger paddle
    paddle.w = 150;
    setTimeout(() => paddle.w = 100, 5000);
  }
}

// CONTROL
canvas.addEventListener("mousemove", e => {
  let rect = canvas.getBoundingClientRect();
  paddle.x = e.clientX - rect.left - paddle.w / 2;
});
