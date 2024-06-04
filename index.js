const canvas = document.querySelector("canvas");
const canvasContext = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

canvasContext.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.4;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./imgs/background.png",
});

const shop = new Sprite({
  position: {
    x: 625,
    y: 128,
  },
  imageSrc: "./imgs/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player1 = new Fighter({
  position: {
    x: 200,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./imgs/samurai/idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./imgs/samurai/idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./imgs/samurai/run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./imgs/samurai/jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./imgs/samurai/fall.png",
      framesMax: 2,
    },
    attack_1: {
      imageSrc: "./imgs/samurai/attack_1.png",
      framesMax: 6,
    },
    take_hit: {
      imageSrc: "./imgs/samurai/take_hit.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./imgs/samurai/death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 65,
      y: 50,
    },
    width: 175,
    height: 50,
  },
});

const player2 = new Fighter({
  position: {
    x: 725,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: "green",
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./imgs/kenji/idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167,
  },
  sprites: {
    idle: {
      imageSrc: "./imgs/kenji/idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./imgs/kenji/run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./imgs/kenji/jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./imgs/kenji/fall.png",
      framesMax: 2,
    },
    attack_1: {
      imageSrc: "./imgs/kenji/attack_1.png",
      framesMax: 4,
    },
    take_hit: {
      imageSrc: "./imgs/kenji/take_hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./imgs/kenji/death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 170,
    height: 50,
  },
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  canvasContext.fillStyle = "black";
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  player1.update();
  player2.update();

  player1.velocity.x = 0;
  player2.velocity.x = 0;

  // Player 1 Movement
  if (keys.a.pressed && player1.lastKey === "a") {
    player1.velocity.x = -5;
    player1.switchSprite("run");
  } else if (keys.d.pressed && player1.lastKey === "d") {
    player1.velocity.x = 5;
    player1.switchSprite("run");
  } else {
    player1.switchSprite("idle");
  }

  // Player 2 Movement
  if (keys.ArrowLeft.pressed && player2.lastKey === "ArrowLeft") {
    player2.velocity.x = -5;
    player2.switchSprite("run");
  } else if (keys.ArrowRight.pressed && player2.lastKey === "ArrowRight") {
    player2.velocity.x = 5;
    player2.switchSprite("run");
  } else {
    player2.switchSprite("idle");
  }

  // Jump & Fall Animation
  if (player1.velocity.y < 0) {
    player1.switchSprite("jump");
  } else if (player1.velocity.y > 0) {
    player1.switchSprite("fall");
  }

  if (player2.velocity.y < 0) {
    player2.switchSprite("jump");
  } else if (player2.velocity.y > 0) {
    player2.switchSprite("fall");
  }

  // Detect Collision for Player1
  if (
    rectangularCollision({
      rectangle1: player1,
      rectangle2: player2,
    }) &&
    player1.isAttacking &&
    player1.framesCurrent === 4
  ) {
    player2.takeHit();
    player1.isAttacking = false;
    gsap.to("#player2Health", {
      width: player2.health + "%",
    });
  }

  // If Player1 Misses
  if (player1.isAttacking && player1.framesCurrent === 4) {
    player1.isAttacking = false;
  }

  // Detect Collision for Player2
  if (
    rectangularCollision({
      rectangle1: player2,
      rectangle2: player1,
    }) &&
    player2.isAttacking &&
    player2.framesCurrent === 2
  ) {
    player1.takeHit();
    player2.isAttacking = false;
    gsap.to("#player1Health", {
      width: player1.health + "%",
    });
  }

  // If Player2 Misses
  if (player2.isAttacking && player2.framesCurrent === 2) {
    player2.isAttacking = false;
  }

  // end game based on health
  if (player1.health <= 0 || player2.health <= 0) {
    determineWinner({ player1, player2, timerId });
  }
}

animate();

window.addEventListener("keydown", (event) => {
  if (!player1.dead) {
    switch (event.key) {
      case "w":
        player1.velocity.y = -12.5;
        break;
      case "a":
        keys.a.pressed = true;
        player1.lastKey = "a";
        break;
      case "s":
        player1.attack();
        break;
      case "d":
        keys.d.pressed = true;
        player1.lastKey = "d";
        break;
    }
  }

  if (!player2.dead) {
    switch (event.key) {
      case "ArrowUp":
        player2.velocity.y = -12.5;
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        player2.lastKey = "ArrowLeft";
        break;
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        player2.lastKey = "ArrowRight";
        break;
      case "ArrowDown":
        player2.attack();
        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "a":
      keys.a.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;

    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
  }
});
