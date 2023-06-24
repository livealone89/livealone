(() => {
  // Получаем элементы игрового поля, персонажа и платформы
var gameField = document.getElementById("mainBG");
var character = document.getElementById("character");
var platform = document.getElementsByClassName("platform");
var field = document.getElementById("game");
// Устанавливаем начальные значения
const jumpSound = new Audio('./src/sound/jump.wav')
const gameBG = new Audio('./src/sound/gameST.mp3')
const menuBG = new Audio('./src/sound/menuBG.wav')
const gameLose1 = new Audio('./src/sound/gameLose1.wav')
const gameLose2 = new Audio('./src/sound/gameLose2.wav')
const coinObtain = new Audio('./src/sound/coin.wav')
const teleport = new Audio('./src/sound/teleport.wav')
const coinCounter = new Audio('./src/sound/coinCounter.wav')
menuBG.loop = true;
gameBG.loop = true;
jumpSound.load();
teleport.load();
coinCounter.load();
teleport.volume = 0.7;
coinCounter.volume = 0.4;
gameBG.load();
menuBG.load();
gameLose1.load();
gameLose2.load();

// Получаем ширину фона и ширину игрового поля
var backgroundWidth = gameField.offsetWidth;
var fieldWidth = gameField.clientWidth;
var bottomPosition = 20;
let bottomFallenPosition = 0;
character.style.zIndex = '10'
var gravity = 2;
var backgroundPosition = 0;
var movementDirection = 0; // -1: влево, 0: без движения, 1: вправо
let jumpHeight = calculateJumpHeight(); // Вычисление высоты прыжка
let fullJump = jumpHeight*2*9+jumpHeight*0.5*6;
let gpose = gameField.getBoundingClientRect();
var highestPrevJump = 700;
let scoreJump = 0;
var gameOver = false;
var isPlatformdown = true;
let gameLoop;
let jumpInterval;
var platStyleTimer;
var gameSettingsInterval;
let startGame;
var jumpScore = 0;
let gameDifficult= 1;
let gameScore = 0;
let coinScore = 0;
var inMenu = false;
let highestScoreTotal = 0;
// Настройки для создания платформ
var existingPlatforms = document.getElementsByClassName("platform");
var platformWidth = 70; // Ширина платформы
var platformHeight = 50; // Высота платформы
var platformGap = 100; // Промежуток между платформами
var minPlatformPosition = 20; // Минимальное положение платформы по вертикали
var maxPlatformPosition = 750; // Максимальное положение платформы по вертикали
var platformImages = ["./src/img/PG1.png","./src/img/PG2.png","./src/img/PG3.png","./src/img/PG4.png"]; // Стартовый массив с путями к изображениям платформ
var platforms = document.getElementsByClassName("platform");
// // Настройки персонажа
let charRightEar = document.createElement("img");
charRightEar.setAttribute("id","CharRightEar");
charRightEar.src = './src/img/CharRightEar.png';
character.appendChild(charRightEar);
let charLeftEar = document.createElement("img");
charLeftEar.setAttribute("id","CharLeftEar");
charLeftEar.src = './src/img/CharLeftEar.png';
character.appendChild(charLeftEar);
let charRightHand = document.createElement("img");
charRightHand.setAttribute("id","CharRightHand");
charRightHand.src = './src/img/CharRightHand.png';
character.appendChild(charRightHand);
let charLeftHand = document.createElement("img");
charLeftHand.setAttribute("id","CharLeftHand");
charLeftHand.src = './src/img/CharLeftHand.png';
character.appendChild(charLeftHand);
const jumpRotationRE = [{transform: "rotate(0)"},  {transform: "rotate(60deg)"}]
const jumpRotationLE = [{transform: "rotate(0)"},  {transform: "rotate(-60deg)"}]
const jumpRotationRH = [{transform: "rotate(0)"},  {transform: "rotate(60deg)"}]
const jumpRotationLH = [{transform: "rotate(0)"},  {transform: "rotate(-60deg)"}]
mainMenu();

//Стартовое меню
function mainMenu (){
  clearInterval(gameSettingsInterval);
  gameField.style.backgroundPosition = 'bottom';
  inMenu = true;
  menuBG.load();
  menuBG.play();
  //Общий блок текста
  let mainMenuBlock = document.createElement("div");
  mainMenuBlock.style.display = 'flex'
  mainMenuBlock.style.maxWidth = (gpose.right-gpose.left-50) +'px'
  mainMenuBlock.style.width = ((gpose.right-gpose.left)/2) +'px'
  mainMenuBlock.style.justifyContent = 'center'
  mainMenuBlock.style.flexDirection = 'column'
  mainMenuBlock.style.position = "absolute";
  mainMenuBlock.style.left = (gpose.right-((gpose.right-gpose.left)/1.4)) + "px"
  mainMenuBlock.style.top = (gpose.top +100) + "px"
  document.body.appendChild(mainMenuBlock);
  // Название игры
  let gameName = document.createElement("h1");
  gameName.textContent = "Doodle Jump";
  gameName.style.fontFamily = 'Train One';
  gameName.style.fontSize = '60px'
  gameName.style.fontWeight = '600'
  mainMenuBlock.appendChild(gameName);
  // Подгрузка статистики локальной
  let scoreArchive = [];
  for(let i=0; i<localStorage.length; i++) {
    let key = localStorage.key(i);
    scoreArchive.push(JSON.parse(localStorage.getItem(key)));
  }
  scoreArchive.sort((a, b) => a.score > b.score ? -1 : 1);
  highestScoreTotal = scoreArchive[0]? scoreArchive[0].score:0;
  // Кнопка начала игры
  let buttonStart = document.createElement("button");
  buttonStart.classList.add('endButton', 'platform');
  buttonStart.textContent = "New Game";
  buttonStart.style.fontSize = '15px'
  buttonStart.style.fontWeight = '600'
  buttonStart.style.top =(gpose.bottom - 400) +"px"
  mainMenuBlock.appendChild(buttonStart);
  buttonStart.focus({focusVisible: true});
  buttonStart.addEventListener('click',function(){
    gameField.style.backgroundPosition = 'bottom';
    gameSettingsInterval = setInterval (()=>{
      if (gameScore >=1000 && gameScore <3000) {
        gameDifficult = 2;
        platformImages = ["./src/img/PI1.png","./src/img/PI2.png","./src/img/PI3.png","./src/img/PI4.png"];
      } else if (gameScore >=3000 && gameScore <5000) {
        gameDifficult = 3;
      } else if (gameScore >=5000 && gameScore <8000) {
        gameDifficult = 4;
        platformImages = ["./src/img/PL1.png","./src/img/PL2.png","./src/img/PL3.png","./src/img/PL4.png"];
      }
    }, 50);
    backgroundPosition = 0;
    coinScore = 0;
    gameDifficult = 1;
    buttonStart.style.top =(gpose.bottom - 280) +"px"
    buttonStart.classList.add('animate__animated', 'animate__backOutDown');
    buttonStart.classList.remove('platform');
    gameName.remove();
    gameScore = 0;
    gameOver = false;
    platformImages = ["./src/img/PG1.png","./src/img/PG2.png","./src/img/PG3.png","./src/img/PG4.png"];
    jumpScore = 0;
    basePlatformGenerate() // Создание базовой платформы
    // Запуск игровых функций
    startGame = setTimeout (() => {
      inMenu = false;
      gameBG.load();
      menuBG.pause();
      gameBG.play();
      createScore(); // Создание поля очков
      createNewPlatform(minPlatformPosition, maxPlatformPosition,8); // Генерируем начальное количество платформ (10) 
      document.body.removeChild(mainMenuBlock);
      gravity = 2;
    },500)
    
  })
  // Название игры
  let scoreHighestTotal = document.createElement("div");
  let highestScore = scoreArchive[0]? `Hihest Score: ${scoreArchive[0].score}pts` : 'No Highest Score'
  scoreHighestTotal.textContent = highestScore;
  scoreHighestTotal.style.color = "lightblue"
  scoreHighestTotal.style.top =(gpose.bottom-200) +"px"
  scoreHighestTotal.style.position = "absolute";
  mainMenuBlock.appendChild(scoreHighestTotal);
  // Анимация в меню
  character.style.bottom = (gpose.bottom - 400) +"px"
  jump();
}
// Создание и настройка очков
function createScore (){
  let gameScorePlat = document.createElement("div");
  gameScorePlat.setAttribute("id","gameScoreBlock");
  gameScorePlat.style.position = 'absolute';
  gameScorePlat.style.display = "flex";
  gameScorePlat.style.justifyContent = "space-between"
  gameScorePlat.style.width = fieldWidth-20 + "px"
  gameScorePlat.style.left = (gpose.left+10) + "px"
  gameField.appendChild(gameScorePlat);
  gameScorePlat.style.zIndex = "5";
  let gameScorePts = document.createElement("div");
  gameScorePts.style.color = "lightblue";
  gameScorePlat.appendChild(gameScorePts);
  let coinsScore = document.createElement("div");
  coinsScore.style.display = "flex";
  let coinImg = document.createElement("img");
  coinImg.src = './src/img/coin.png';
  coinImg.style.width = "25px"
  coinImg.style.height = "20px"
  let coinNum = document.createElement("div");
  coinNum.style.color = "lightblue";
  coinsScore.appendChild(coinImg);
  coinsScore.appendChild(coinNum);
  gameScorePlat.appendChild(coinsScore);
  gameScoreRefresh = setInterval(function () {
    gameScorePts.textContent = "Score: "+ gameScore+ " pts";
    coinNum.textContent = ": "+coinScore;
  }, 2)
}
// Функция для вычисления высоты прыжка
function calculateJumpHeight() {
  return 10 * window.innerHeight / 1000; // Здесь вы можете использовать свою формулу или логику для вычисления высоты прыжка
}
// Функция для перемещения персонажа
function moveCharacter() {
  fieldWidth = gameField.clientWidth;
  let leftPosition = parseInt(getComputedStyle(character).left);
  let gpose = gameField.getBoundingClientRect();
  if (movementDirection === -1 && leftPosition > 0) { // Движение влево
    if (leftPosition > (Math.round(gpose.left))) {
      character.style.left = (leftPosition - 10) + "px";
    } else {
      character.style.left = (leftPosition + fieldWidth- 20) + "px";
      teleport.load();
      teleport.play();
    }
  } else if (movementDirection === 1 ) { // Движение вправо
    if (leftPosition < (Math.round(gpose.right)-50)) {
      character.style.left = (leftPosition + 10) + "px";
    } else {
      character.style.left = (leftPosition - fieldWidth + 20) + "px";
      teleport.load();
      teleport.play();
    }
  }
}
// Обработка нажатий клавиш
document.addEventListener("keydown", function (event) {
  if (event.keyCode === 37) { // Клавиша влево
    movementDirection = -1;
  } else if (event.keyCode === 39) { // Клавиша вправо
    movementDirection = 1;
  }
});
document.addEventListener("keyup", function (event) {
  if (event.keyCode === 37 || event.keyCode === 39) {
    movementDirection = 0;
    moveCharacter(); // Вызываем функцию для перемещения персонажа
  }
});
// Функция прыжка
function jump() {
  clearInterval(jumpInterval);
  clearInterval(gameLoop);
  let jumpCount = 0;
  let calculatedJump = 0;
  bottomPosition = parseInt(character.style.bottom);
  charRightEar.animate(jumpRotationRE, 2000);
  charLeftEar.animate(jumpRotationLE, 2000);
  charRightHand.animate(jumpRotationRH, 2000);
  charLeftHand.animate(jumpRotationLH, 2000);
  jumpScore = 0;
  jumpSound.play()
  jumpInterval = setInterval(function () {
    gravity = 2;
    // Перемещаем персонаж вверх
      if (jumpCount < 9) {
        jumpScore += 2 * jumpHeight;
        if (parseInt(character.style.bottom) > window.innerHeight/2){
          movingPlatforms = document.querySelectorAll(".platform");
          movingPlatforms.forEach (function(platform) {
            platformBottom = parseInt(platform.style.bottom) - 2*jumpHeight
            platform.style.bottom = platformBottom + "px";
          })
          bottomPosition += jumpHeight;
        } else {
          bottomPosition += 2 * jumpHeight;
        }
        if (parseInt(character.style.bottom) > highestPrevJump){
        // Смещение фоновой картинки вверх при прыжке
        backgroundPosition -= jumpHeight/2; 
        bottomPosition -= jumpHeight;
        gameField.style.backgroundPosition = "center bottom " + backgroundPosition + "px";
        // Смещение платформ вниз при прыжке
        movingPlatforms = document.querySelectorAll(".platform");
        movingPlatforms.forEach (function(platform) {
          platformBottom = parseInt(platform.style.bottom) - jumpHeight
          platform.style.bottom = platformBottom + "px";
        })
        }
        character.style.bottom = bottomPosition + "px";
        platformRemove();
        checkCoins();
        inMenu === false ? moveCharacter():movementDirection = 0; 
        if (bottomPosition >scoreJump){
          gameScore += 2;
        }
        calculatedJump +=1;
      } else if (jumpCount >= 9 && jumpCount < 15) {
        jumpScore += 0.5 * jumpHeight;
        if (parseInt(character.style.bottom) > highestPrevJump){
          // Смещение фоновой картинки вверх при прыжке
          backgroundPosition -= 0.15 * jumpHeight;; 
          gameField.style.backgroundPosition = "center bottom " + backgroundPosition + "px";
          // Смещение платформ вниз при прыжке
          movingPlatforms = document.querySelectorAll(".platform");
          movingPlatforms.forEach (function(platform) {
            platformBottom = parseInt(platform.style.bottom) - 0.3 * jumpHeight;
            platform.style.bottom = platformBottom + "px";
          })
          bottomPosition += 0.5 * jumpHeight - 0.3 * jumpHeight;
        } else {
          bottomPosition += 0.5 * jumpHeight;
        }
        character.style.bottom = bottomPosition + "px";
        platformRemove();
        checkCoins ();
        inMenu === false ? moveCharacter():movementDirection = 0; 
        if (Math.floor(bottomPosition) >scoreJump){
          gameScore += 1;
        }
        calculatedJump +=1;
      } else {    // Фаза падения после прыжка
        teleport.load();
        teleport.play();
        // Определение верхней платформы
        highestPrevJump = parseInt(character.style.bottom);
        scoreJump=highestPrevJump;
        existingPlatforms = document.querySelectorAll('.platform')
        var highestTopPlatform = highestPrevJump/2.5;
        existingPlatforms.forEach(function(platform){
          if (parseInt(platform.style.bottom)>highestTopPlatform) {
            highestTopPlatform = parseInt(platform.style.bottom)
          }
        })
        // Добавление платформ сверху поля, если игрок поднялся
        if (gameField.offsetHeight-highestTopPlatform > platformHeight*3&& inMenu === false) {
          let platformNumber = Math.floor((gameField.offsetHeight-highestTopPlatform)/(fullJump)*2)
          createNewPlatform(highestTopPlatform+platformHeight, gameField.offsetHeight-platformHeight, platformNumber-Math.floor(gameDifficult/2));
        }
        clearInterval(jumpInterval);
        bottomFallenPosition = parseInt(character.style.bottom);
        // Падение
        gameLoop = setInterval(function () {
          inMenu === false ? moveCharacter():movementDirection = 0; // блокировка управления в меню
          bottomFallenPosition -= gravity;
          character.style.bottom = bottomFallenPosition + "px";
          gravity += 0.05;
          checkCollision(highestPrevJump); // Проверяем столкновения с платформами
          checkCoins ();
          // Проигрыш если персонаж упал ниже экрана
          if (parseInt(character.style.bottom) < 0 && gameOver === false ) {
            gameOver = true;
            setTimeout(() => clearInterval(gameLoop), 100);
            loseGame();
            return
          }
        }, 5);
      }
    jumpCount++;
  }, 25);
  
}
// Функция для проверки столкновений с платформами
function checkCollision(highestPrevJump) {
  let characterRect = character.getBoundingClientRect();
  let platforms = document.getElementsByClassName("platform");
  for (let i = 0; i < platforms.length; i++) {
    var platformRect = platforms[i].getBoundingClientRect();
    if (
      characterRect.bottom >= platformRect.top &&
      characterRect.bottom <= platformRect.top + 20 &&
      characterRect.left <= platformRect.right &&
      characterRect.right >= platformRect.left
    ) {
      // console.log ('поверхность платформы - ',platformRect.top, ' , позиция игрока - ', characterRect.bottom)
      bottomPosition = window.innerHeight- platformRect.top ; // Устанавливаем персонажа на верхнюю границу платформы
      character.style.bottom = bottomPosition + "px";
      platforms[i].style.filter = "brightness(1.75)"; // Подсветка платформы, от которой оттолкнулся
      platStyleTimer = setTimeout (()=>{platforms[i].style.filter = "brightness(1)"},100)

      // if (highestPrevJump -bottomPosition < 0.3*fullJump) {
      //   // Смещение фоновой картинки вверх при прыжке
      //   let difference = fullJump-(highestPrevJump -bottomPosition);
      //   backgroundPosition -= 0.5*difference; 
      //   gameField.style.backgroundPosition = "center bottom " + backgroundPosition + "px";
      //   character.style.bottom = 
      //   // Смещение платформ вниз при прыжке
      //   movingPlatforms = document.querySelectorAll(".platform");
      //   movingPlatforms.forEach (function(platform) {
      //     platformBottom = parseInt(platform.style.bottom) - difference;
      //     platform.style.bottom = platformBottom + "px";
      //   })
      //   bottomPosition = window.innerHeight- platformRect.top ; // Устанавливаем персонажа на верхнюю границу платформы
      //   character.style.bottom = bottomPosition + "px";
      //   }
      clearInterval(gameLoop);
      clearInterval(jumpInterval);
      jump();
      return;
    }
  }

}
//Функция для проверки столкновения с монетами 
function checkCoins (){
  let characterRect = character.getBoundingClientRect();
  let coins = document.getElementsByClassName("coin");
  for (let i = 0; i < coins.length; i++) {
    var coinRect = coins[i].getBoundingClientRect();
    if (
      characterRect.bottom >= coinRect.top &&
      characterRect.bottom <= coinRect.top + 20 &&
      characterRect.left <= coinRect.right &&
      characterRect.right >= coinRect.left
    ) {
      coins[i].remove();
      coinObtain.load();
      coinObtain.volume = 0.3;
      coinObtain.play();
      coinScore +=1;
    }
  }
}
// Создаем базовую платформу внизу уровня
function basePlatformGenerate () {
    var newPlatform = document.createElement("div");
    newPlatform.classList.add("platform");
    newPlatform.style.position = 'absolute';
    newPlatform.style.bottom = gpose.top + "px"
    newPlatform.style.left = gpose.left-15 + "px"
    var platformImage = document.createElement("img");
    platformImage.src = "./src/img/PlBase.png"
    platformImage.width = gameField.clientWidth+20;
    newPlatform.appendChild(platformImage);
    gameField.appendChild(newPlatform);
}
// Генерация платформ
function createNewPlatform(lowestHeight, highestHieght, platformCount) {
  let platformCreationGap = highestHieght - lowestHeight; // Пространство для создания платформ
  let platformRows = Math.ceil(platformCreationGap / (0.5*fullJump)); // Количество рядов платформ
  let rowHeight = platformCreationGap/platformRows; // Высота ряда платформ 
  let rowPlatforms = Math.ceil(platformCount/platformRows); // Количество платформ в ряду
  let rowBottom = lowestHeight; //Нижний ряд для заполнения
  let leftPlatformPos = gpose.left; // Начальная левая позиция для платформы 
  // console.log ('Количество рядов: ',platformRows ,' Высота ряда платформ: ',rowHeight, ' Количество платформ в ряду: ' ,rowPlatforms, ' Высота прыжка - ',fullJump )
  for (let i = 1; i<=platformRows; i++){
    leftPlatformPos = gpose.left;
    for (let j = 1; j<=rowPlatforms; j++){
      // Создаем платформу
      let newPlatform = document.createElement("div");
      newPlatform.classList.add("platform");
      newPlatform.style.width = platformWidth + "px";
      newPlatform.style.height = platformHeight + "px";
      newPlatform.style.position = "absolute";
      // Генерируем случайное положение платформы по вертикали
      let randomVerticalPosition = Math.floor(Math.random() * (rowHeight-20) + rowBottom);
      newPlatform.style.bottom = randomVerticalPosition + "px";
      // Генерируем случайное положение платформы по горизонтали
      var randomHorizontalPosition = Math.floor(Math.random() * (gpose.right-platformWidth - leftPlatformPos) + leftPlatformPos);
      if (randomHorizontalPosition+platformWidth < gpose.right){
          leftPlatformPos = randomHorizontalPosition+60;
          newPlatform.style.left = randomHorizontalPosition + "px";
        // Выбираем случайную картинку платформы
        var randomImage = platformImages[Math.floor(Math.random() * platformImages.length)];
        // Создаем элемент <img> для картинки платформы
        var platformImage = document.createElement("img");
        platformImage.src = randomImage;
        // Добавляем элемент <img> в платформу
        newPlatform.appendChild(platformImage);
        // Добавляем платформу в игровое поле
        gameField.appendChild(newPlatform);
        // Генерация монеток
        if (Math.floor(Math.random()*10) <= (9-gameDifficult*2)) {
          let coinImage = document.createElement("img");
          coinImage.src = './src/img/Coin.png'
          coinImage.style.position = "relative";
          coinImage.style.top = '-70px';
          coinImage.style.left = '20px';
          coinImage.style.width = platformWidth-20 + "px";
          coinImage.style.width = platformHeight-20 + "px";
          coinImage.style.filter = 'filter:hue-rotate(0deg) brightness(0.8);'
          coinImage.classList.add("coin");
          newPlatform.appendChild(coinImage);
          coinImage.style.zIndex = "2"
        };
      }
    }
    rowBottom += rowHeight;
  }

}
// Удаление платформ, ушедших ниже игрового поля
function platformRemove() {
    existingPlatforms = document.querySelectorAll(".platform");
    existingPlatforms.forEach(function(platform) {
      if (parseInt(platform.style.bottom) <= 0) {
        platform.remove();
      }
    });
}
// Функция окончания игры
function loseGame (){
  clearTimeout(startGame);
  clearInterval(gameSettingsInterval);
  gameLose1.play();
  gameLose2.play();
  gameBG.pause();
  field.style.filter = 'blur(5px)';
  // Создаем элементы финальной статистики
  // Общий блок
  let gameOverDiv = document.createElement("div");
  gameOverDiv.style.display = 'flex'
  gameOverDiv.style.justifyContent = 'center'
  gameOverDiv.style.flexDirection = 'column'
  gameOverDiv.style.textAlign = 'center'
  gameOverDiv.style.position = "absolute";
  gameOverDiv.style.color = "lightblue";
  gameOverDiv.classList.add("animate__animated", "animate__zoomInUp", "loseGameDiv");
  gameOverDiv.style.left = (gpose.right - ((gpose.right-gpose.left)/2)-60) + "px"
  gameOverDiv.style.top = (gpose.top - ((gpose.top-gpose.bottom)/2)-60) + "px"
  document.body.appendChild(gameOverDiv);
  // Надпись Game Over
  let youLoseText = document.createElement("h2");
  youLoseText.textContent = "Game Over";
  youLoseText.style.fontSize = '30px'
  youLoseText.style.fontWeight = '600'
  youLoseText.style.marginBottom = '10px'
  youLoseText.style.textShadow = '0px 0px 6px rgba(255,255,255,0.7)'
  gameOverDiv.appendChild(youLoseText);
  // Заработанные монеты 
  let coinsGathered = document.createElement("div");
  coinsGathered.style.display = 'flex'
  coinsGathered.style.justifyContent = 'center'
  gameOverDiv.appendChild(coinsGathered);
  let coinsName = document.createElement("div");
  coinsName.textContent = 'Coins:  '
  coinsGathered.appendChild(coinsName);
  let coinsImg =  document.createElement("img");
  coinsImg.src = './src/img/coin.png';
  coinsImg.style.width = "25px"
  coinsImg.style.height = "20px"
  coinsGathered.appendChild(coinsImg);
  coinsGathered.style.marginBottom = '10px'
  let coinsNum = document.createElement("div");
  coinsNum.textContent = coinScore
  coinsGathered.appendChild(coinsNum);
  // Заработанные очки 
  let scoreGathered = document.createElement("p");
  scoreGathered.textContent = "Your score: " + gameScore + "pts";
  scoreGathered.style.fontSize = '15px'
  scoreGathered.style.fontWeight = '600'
  scoreGathered.style.marginBottom = '10px'
  gameOverDiv.appendChild(scoreGathered);
  setTimeout (()=> {
    coinCounter.load();
    coinCounter.play();
    coinScore > 0? coinsNum.classList.add("animate__animated", "animate__pulse", "animate__infinite") : coinsNum.style.fontSize = '15px';
    coinScore > 0? scoreGathered.classList.add("animate__animated", "animate__pulse", "animate__infinite") : scoreGathered.style.fontSize = '15px';
    let coinPerTick = coinScore>60?2 : 1
    let coinToPointsAnim = setInterval(() => {
      if (coinScore > 0){
        coinScore -= coinPerTick
        coinsNum.textContent = coinScore;
        coinsNum.style.fontSize = '17px'
        gameScore += coinPerTick*10;
        scoreGathered.style.fontSize = '17px'
        scoreGathered.textContent = "Your score: " + gameScore + "pts";
      } else {
        coinsNum.style.fontSize = '15px'
        scoreGathered.style.fontSize = '15px'
        clearInterval(coinToPointsAnim);
        coinCounter.pause();
        coinsGathered.classList.add("animate__animated", "animate__fadeOutDown");
        scoreGathered.classList.remove("animate__animated", "animate__pulse", "animate__infinite");
        //Сохраняем статистику в Local Storage 
        let lastKey = localStorage.length+1;
        let scoreInfo = {name: 'player', score: gameScore, time: new Date().toLocaleString()}
        localStorage.setItem(lastKey, JSON.stringify(scoreInfo));
        // console.log ('highestScoreTotal - ',highestScoreTotal, ' gameScore - ', gameScore)
        // Обновляем хайскор
        if (highestScoreTotal<gameScore|| highestScoreTotal===0) {
          let bestScore = gameScore
          scoreHighestTot.textContent = "Highest score: " + bestScore + "pts";
          let highscoreImg = document.createElement("img");
          highscoreImg.src = "./src/img/highScore.png"
          highscoreImg.style.width = '70px';
          highscoreImg.style.transform = 'rotate(-30deg)';
          highscoreImg.style.position = "absolute";
          highscoreImg.style.left = '-80px'
          highscoreImg.classList.add("animate__animated", "animate__pulse", "animate__infinite");
          gameOverDiv.appendChild(highscoreImg);
        }
      }
    }, 50);
  },1500)
  // Максимальные очки 
  let scoreHighestTot = document.createElement("p");
  let bestScore = highestScoreTotal>gameScore?highestScoreTotal:gameScore;
  scoreHighestTot.textContent = "Highest score: " + bestScore + "pts";
  scoreHighestTot.style.fontSize = '15px'
  scoreHighestTot.style.fontWeight = '600'
  scoreHighestTot.style.marginBottom = '10px'
  gameOverDiv.appendChild(scoreHighestTot);
  
  // Кнопка начать заново 
  let buttonRestart = document.createElement("button");
  buttonRestart.classList.add('endButton');
  buttonRestart.textContent = "Restart";
  buttonRestart.style.fontSize = '15px'
  buttonRestart.style.fontWeight = '600'
  gameOverDiv.appendChild(buttonRestart);
  buttonRestart.focus({focusVisible: true});
  buttonRestart.addEventListener('click',function(){
    field.style.filter = 'none';
    character.style.bottom = '20px'
    character.style.left = (gpose.right - ((gpose.right-gpose.left)/2)) + "px"
    gameField.style.backgroundPosition = 'bottom';
    bottomPosition = 20;
    gravity = 2;
    backgroundPosition = 0;
    coinScore = 0;
    gameDifficult = 1;
    document.body.removeChild(gameOverDiv);
    platformImages = ["./src/img/PG1.png","./src/img/PG2.png","./src/img/PG3.png","./src/img/PG4.png"]; 
    let deletingPlatforms = document.querySelectorAll(".platform");
        deletingPlatforms.forEach (function(platform) {
            gameField.removeChild(platform);
        })
    gameScore = 0;
    gameOver = false;
    highestPrevJump = 700;
    gameSettingsInterval = setInterval (()=>{
      if (gameScore >=1000 && gameScore <3000) {
        gameDifficult = 2;
        platformImages = ["./src/img/PI1.png","./src/img/PI2.png","./src/img/PI3.png","./src/img/PI4.png"];
      } else if (gameScore >=3000 && gameScore <5000) {
        gameDifficult = 3;
      } else if (gameScore >=5000 && gameScore <8000) {
        gameDifficult = 4;
        platformImages = ["./src/img/PL1.png","./src/img/PL2.png","./src/img/PL3.png","./src/img/PL4.png"];
      }
    }, 50);
    // Подгрузка статистики локальной
    let scoreArchive = [];
    for(let i=0; i<localStorage.length; i++) {
      let key = localStorage.key(i);
      scoreArchive.push(JSON.parse(localStorage.getItem(key)));
    }
    scoreArchive.sort((a, b) => a.score > b.score ? -1 : 1);
    highestScoreTotal = scoreArchive[0]? scoreArchive[0].score:0;
    gameBG.play();
    basePlatformGenerate();
    createNewPlatform(minPlatformPosition, maxPlatformPosition,8);
    jump();
  })
  // Кнопка Главное меню
  let buttonMenu = document.createElement("button");
  buttonMenu.classList.add('endButton');
  buttonMenu.textContent = "Menu";
  buttonMenu.style.fontSize = '15px'
  buttonMenu.style.fontWeight = '600'
  gameOverDiv.appendChild(buttonMenu);
  buttonMenu.addEventListener('click',function(){
    field.style.filter = 'none';
    character.style.left = (gpose.right - ((gpose.right-gpose.left)/2)) + "px"
    gameField.style.backgroundPosition = 'bottom';
    document.body.removeChild(gameOverDiv);
    gameField.removeChild(document.getElementById("gameScoreBlock"));
    let deletingPlatforms = document.querySelectorAll(".platform");
        deletingPlatforms.forEach (function(platform) {
            gameField.removeChild(platform);
        })
    gameField.style.backgroundPosition = 'bottom';
    gameScore = 0;
    gameOver = false;
    mainMenu();
  })
}

})();