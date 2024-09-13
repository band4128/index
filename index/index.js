let rocket;
let rocketBottom;
let rocketLeft;
let keys = {};
let health = 5; // 초기 체력
let isInvincible = false; // 무적 상태 여부
let gameOver = false; // 게임 오버 상태
let score = 0; // 점수
let highScore = 0; // 최고 점수
const initialSpeed = 8; // 초기 우주선 속도
let spaceshipSpeed = initialSpeed; // 우주선 속도
let meteorType = "slow"; // 기본 운석 타입
let meteorIntervalId; // 운석 생성 간격 ID
let scoreIntervalId; // 점수 증가 간격 ID
const scoreInterval = 100 / 2; // 초당 점수 증가 속도

function updateHealthBar() {
  for (let i = 1; i <= 5; i++) {
    const healthElement = document.getElementById(`health${i}`);
    if (i <= health) {
      healthElement.classList.remove("lost");
    } else {
      healthElement.classList.add("lost");
    }
  }
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function updateHighScore() {
  const highScoreElement = document.getElementById("highScore");
  highScoreElement.textContent = `최고 Score: ${highScore}`;
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (gameOver) return; // 게임 오버 시 루프 중지

  // 우주선 이동
  if (keys["ArrowUp"]) {
    rocketBottom += spaceshipSpeed;
  }
  if (keys["ArrowDown"]) {
    rocketBottom -= spaceshipSpeed;
  }
  if (keys["ArrowLeft"]) {
    rocketLeft -= spaceshipSpeed;
  }
  if (keys["ArrowRight"]) {
    rocketLeft += spaceshipSpeed;
  }

  // 우주선 경계 체크
  if (rocketBottom < 0) rocketBottom = 0;
  if (rocketBottom > window.innerHeight - rocket.clientHeight)
    rocketBottom = window.innerHeight - rocket.clientHeight;

  if (rocketLeft < 0) rocketLeft = 0;
  if (rocketLeft > window.innerWidth - rocket.clientWidth)
    rocketLeft = window.innerWidth - rocket.clientWidth;

  rocket.style.bottom = rocketBottom + "px";
  rocket.style.left = rocketLeft + "px";

  // 운석과 기름통과 충돌 검사
  document.querySelectorAll(".meteor").forEach((meteor) => {
    const meteorRect = meteor.getBoundingClientRect();
    const rocketRect = rocket.getBoundingClientRect();

    if (checkCollision(meteorRect, rocketRect)) {
      meteor.remove(); // 충돌한 운석 제거
      takeDamage(meteor);
    }
  });

  // 기름통과 충돌 검사
  document.querySelectorAll(".oil-drum").forEach((drum) => {
    const drumRect = drum.getBoundingClientRect();
    const rocketRect = rocket.getBoundingClientRect();

    if (checkCollision(drumRect, rocketRect)) {
      drum.remove(); // 기름통 제거
      takeOil(drum);
    }
  });
}

function takeDamage(meteor) {
  if (health > 0) {
    if (meteor.classList.contains("big-meteor")) {
      health -= 2; // 큰 운석에 맞았을 때 체력 2칸 감소
    } else {
      health -= 1; // 일반 운석에 맞았을 때 체력 1칸 감소
    }

    updateHealthBar();
    rocket.classList.add("hit-flash");
    isInvincible = true;

    if (meteor.classList.contains("big-meteor")) {
      spaceshipSpeed /= 2;
      setTimeout(() => {
        spaceshipSpeed *= 2;
      }, 1500); // 1.5초 후 속도 복구
    }

    setTimeout(() => {
      rocket.classList.remove("hit-flash");
      isInvincible = false;
    }, 2000); // 무적 시간: 2초

    if (health <= 0) {
      gameOver = true;
      document.getElementById("gameOver").style.display = "block";

      // 운석 생성 및 점수 증가 타이머 멈춤
      clearInterval(meteorIntervalId);
      clearInterval(scoreIntervalId);

      // 우주선에 회전 및 떨어짐 애니메이션 추가
      rocket.classList.add("rotateAndFall");

      setTimeout(() => {
        document.getElementById("retryButton").style.display = "block";
        updateHighScore();
      }, 2000); // 애니메이션이 끝난 후 2초 뒤에 다시하기 버튼과 최고 점수 표시

      // 모든 운석과 기름통 제거
      document.querySelectorAll(".meteor").forEach((meteor) => meteor.remove());
      document.querySelectorAll(".oil-drum").forEach((drum) => drum.remove());

      // 최고 점수 업데이트
      if (score > highScore) {
        highScore = score;
        document.getElementById("newHighScore").textContent = "최고 점수 달성!";
        document.getElementById("newHighScore").style.display = "block";
      }
    }
  }
}

function resetGame() {
  health = 5;
  spaceshipSpeed = 7;
  score = 0;
  updateHealthBar();
  updateScore();
  document.getElementById("gameOver").style.display = "none";
  document.getElementById("retryButton").style.display = "none";
  document.getElementById("newHighScore").style.display = "none";
  gameOver = false;

  document.querySelectorAll(".meteor").forEach((meteor) => meteor.remove());
  document.querySelectorAll(".oil-drum").forEach((drum) => drum.remove());

  rocket.classList.remove("rotateAndFall");
  rocket.classList.remove("hit-flash");
  rocketBottom = 10;
  rocketLeft = window.innerWidth / 2 - 37.5;
  rocket.style.bottom = rocketBottom + "px";
  rocket.style.left = rocketLeft + "px";

  initializeGame();
}

function initializeGame() {
  rocket = document.getElementById("rocket");
  rocketBottom = 10;
  rocketLeft = window.innerWidth / 2 - 50;

  spaceshipSpeed = initialSpeed; // 게임 시작 시 속도 초기화
  updateHealthBar();
  updateScore();
  gameLoop();

  meteorIntervalId = setInterval(() => {
    createMeteor();
    createOilDrum(); // 오일통 생성 함수 호출
  }, 2000); // 운석과 오일통 생성 간격을 2초로 조정

  scoreIntervalId = setInterval(() => {
    if (!gameOver) {
      score += 10;
      updateScore();
    }
  }, scoreInterval);

  document.getElementById("retryButton").addEventListener("click", () => {
    location.reload(); // 페이지 새로고침으로 게임 재시작
  });

  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });
}

function createMeteor() {
  // 점수에 따라 운석 유형 결정
  let meteorType = "slow-meteor"; // 기본 운석 타입
  if (score >= 15000) {
    meteorType =
      Math.random() < 0.2
        ? "big-meteor"
        : Math.random() < 0.5
        ? "fast-meteor"
        : "slow-meteor";
  } else if (score >= 5000) {
    meteorType = Math.random() < 0.5 ? "fast-meteor" : "slow-meteor";
  }

  const meteor = document.createElement("div");
  meteor.classList.add("meteor", meteorType);

  const randomX = Math.floor(Math.random() * (window.innerWidth - 50));
  meteor.style.left = randomX + "px";
  meteor.style.top = "-50px";

  document.body.appendChild(meteor);

  setTimeout(() => {
    meteor.remove();
  }, 30000); // 운석이 30초 후 제거됩니다
}

function createOilDrum() {
  if (Math.random() < 0.4) {
    // 40% 확률로 오일통 생성
    const drum = document.createElement("div");
    drum.classList.add("oil-drum");

    const randomX = Math.floor(Math.random() * (window.innerWidth - 50));
    drum.style.left = randomX + "px";
    drum.style.top = "-50px";

    document.body.appendChild(drum);

    setTimeout(() => {
      drum.remove();
    }, 5000);
  }
}

function checkCollision(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function takeOil(drum) {
  health += 1;
  if (health > 5) {
    health = 5;
  }
  updateHealthBar();
}

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

document.getElementById("retryButton").addEventListener("click", resetGame);

initializeGame();
