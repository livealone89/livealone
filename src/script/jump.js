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
const menuClick = new Audio('./src/sound/menuClick.wav')
const newHScore = new Audio('./src/sound/newHScore.wav')
const allSounds = [jumpSound, gameBG, menuBG, gameLose1, gameLose2, coinObtain, teleport, coinCounter, menuClick, newHScore]; 

menuBG.loop = true;
gameBG.loop = true;
newHScore.load();
newHScore.volume = 0.6;
jumpSound.load();
teleport.load();
coinCounter.load();
menuClick.load();
teleport.volume = 0.7;
coinCounter.volume = 0.4;
gameBG.load();
menuBG.load();
gameLose1.load();
gameLose2.load();
// Определяем размер поля для мобильный устройств
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i
    .test(navigator.userAgent)) {
    gameField.style.maxWidth = '100%';
    gameField.style.minWidth = '100%';
    gameField.style.minHeight=  '97vh'
} else {
  gameField.style.maxWidth = '100%';
  gameField.style.minWidth = '30vw';
  gameField.style.minHeight=  '97vh';
}

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
let platformMoveDistance = 0;
let gameLoop;
let jumpInterval;
let lbAnimationRot;
let lbAnimationScale;
var platStyleTimer;
var gameSettingsInterval;
let startGame;
let gameDifficult= 1;
let gameScore = 0;
let coinScore = 0;
var inMenu = false;
let highestScoreTotal = 0;
let currentPlayer = 'Player';
// Настройки для создания платформ
var existingPlatforms = document.getElementsByClassName("platform");
var platformWidth = 55; // Ширина платформы
var platformHeight = 50; // Высота платформы
var platformGap = 100; // Промежуток между платформами
var minPlatformPosition = 20; // Минимальное положение платформы по вертикали
var maxPlatformPosition = 750; // Максимальное положение платформы по вертикали
var platformImages = ["./src/img/PG1.png","./src/img/PG2.png","./src/img/PG3.png","./src/img/PG4.png"]; // Стартовый массив с путями к изображениям платформ
let platformHue = 'hue-rotate(220deg) brightness(0.8)'
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
  mainMenuBlock.setAttribute("id","mainMenu");
  mainMenuBlock.style.display = 'flex';
  // mainMenuBlock.style.maxWidth = (gpose.right-gpose.left-50) +'px';
  mainMenuBlock.style.width = ((gpose.right-gpose.left)/1.2) +'px';
  mainMenuBlock.style.justifyContent = 'center';
  mainMenuBlock.style.flexDirection = 'column';
  mainMenuBlock.style.position = "absolute";
  mainMenuBlock.style.left = (gpose.right-((gpose.right-gpose.left)/1.1)) + "px"
  mainMenuBlock.style.top = (gpose.top +100) + "px"
  document.body.appendChild(mainMenuBlock);
  // Название игры
  let gameName = document.createElement("h1");
  gameName.textContent = "Doodle Jump";
  gameName.style.textAlign = 'center';
  gameName.style.transform = "rotate(-7deg)";
  gameName.style.fontFamily = 'Train One';
  gameName.style.fontSize = '50px';
  gameName.style.fontWeight = '600';
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
  buttonStart.style.width = ((gpose.right-gpose.left)/4) +'px';
  buttonStart.style.left = ((gpose.right-gpose.left)/3.5) +'px';
  buttonStart.style.fontSize = '15px'
  buttonStart.style.fontWeight = '600'
  buttonStart.style.top =(gpose.bottom - gameField.offsetHeight/1.6) +"px"
  mainMenuBlock.appendChild(buttonStart);
  buttonStart.focus({focusVisible: true});
  buttonStart.onmouseover = ()=>{buttonStart.style.cursor = "pointer"}
  buttonStart.addEventListener('click',function(){
    gameField.style.backgroundPosition = 'bottom';
    gameSettingsInterval = setInterval (()=>{
      if (gameScore >=1000 && gameScore <3000) {
        gameDifficult = 2;
        platformImages = ["./src/img/PI1.png","./src/img/PI2.png","./src/img/PI3.png","./src/img/PI4.png"];
        platformHue = 'hue-rotate(0deg) brightness(0.8)'
      } else if (gameScore >=3000 && gameScore <5000) {
        gameDifficult = 3;
      } else if (gameScore >=7200 && gameScore <10000) {
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
    platformHue = 'hue-rotate(220deg) brightness(0.8)'
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
  // Блок кнопок 
  let buttonsMenu = document.createElement("div");
  buttonsMenu.style.position = "absolute";
  buttonsMenu.style.display = "flex";
  buttonsMenu.style.width = "inherit";
  buttonsMenu.style.justifyContent = 'space-evenly';
  buttonsMenu.style.top =(gpose.bottom-300) +"px"
  mainMenuBlock.appendChild(buttonsMenu);
  // Кнопка лидеборда
  let leaderboardBtn = document.createElement("div");
  leaderboardBtn.style.position = "relative";
  leaderboardBtn.style.display = "flex";
  leaderboardBtn.style.flexDirection = 'column';
  leaderboardBtn.style.alignItems = 'center';
  let leaderboardImg = document.createElement("img");
  leaderboardImg.style.width = fieldWidth/8 + "px";
  leaderboardImg.src = './src/img/leaderboard.png';
  let leaderboardTxt = document.createElement("p");
  leaderboardTxt.textContent = "Leaderboard";
  leaderboardTxt.style.fontSize = '13px';
  leaderboardTxt.style.color = "lightblue";
  leaderboardBtn.appendChild(leaderboardImg);
  leaderboardBtn.appendChild(leaderboardTxt);
  buttonsMenu.appendChild(leaderboardBtn);
  leaderboardBtn.onmouseover = ()=>{leaderboardBtn.style.cursor = "pointer"}
  leaderboardBtn.onclick = ()=>{
    character.animate([{transform: "translate(0)"},  {transform: "translate(-160%, 280%)"}],500);
    menuClick.play();
    clearInterval(jumpInterval);
    clearInterval(gameLoop);
    clearTimeout(startGame);
    clearInterval(gameSettingsInterval);
    field.style.filter = 'blur(1px)';
    character.style.filter = 'none';
    document.body.removeChild(document.getElementById('mainMenu'));
    setTimeout(leadrboardMenu,500);
  }
  // Кнопка настроек
  let settingsBtn = document.createElement("div");
  settingsBtn.style.position = "relative";
  settingsBtn.style.display = "flex";
  settingsBtn.style.flexDirection = 'column';
  settingsBtn.style.alignItems = 'center';
  let settingsImg = document.createElement("img");
  settingsImg.style.width = fieldWidth/8 + "px";
  settingsImg.src = './src/img/settings.png';
  let settingsTxt = document.createElement("p");
  settingsTxt.textContent = "Settings";
  settingsTxt.style.fontSize = '13px';
  settingsTxt.style.color = "lightblue";
  settingsBtn.appendChild(settingsImg);
  settingsBtn.appendChild(settingsTxt);
  buttonsMenu.appendChild(settingsBtn);
  settingsBtn.onmouseover = ()=>{settingsBtn.style.cursor = "pointer"}
  // Highest score
  let scoreHighestTotal = document.createElement("div");
  let highestScore = scoreArchive[0]? `Hihest Score: ${scoreArchive[0].score}pts` : 'No Highest Score'
  scoreHighestTotal.textContent = highestScore;
  scoreHighestTotal.style.width = "inherit";
  scoreHighestTotal.style.color = "lightblue"
  scoreHighestTotal.style.textAlign = 'center';
  scoreHighestTotal.style.top =(gpose.bottom-200) +"px"
  scoreHighestTotal.style.position = "absolute";
  mainMenuBlock.appendChild(scoreHighestTotal);
  // Анимация в меню
  character.style.bottom = (gpose.bottom - 400) +"px"
  jump();
}
// Лидерборд меню
function leadrboardMenu (){
  // Основной блок
  let leaderboardBlock = document.createElement("div");
  leaderboardBlock.style.zIndex = "2";
  leaderboardBlock.style.display = 'flex';
  leaderboardBlock.style.width = (0.8*fieldWidth) +'px';
  leaderboardBlock.style.justifyContent = 'center';
  leaderboardBlock.style.flexDirection = 'column';
  leaderboardBlock.style.position = "absolute";
  leaderboardBlock.style.left = (gpose.left+((gpose.right-gpose.left)/8)) + "px";
  leaderboardBlock.style.top = (gpose.top +100) + "px";
  leaderboardBlock.style.opacity = '0.7';
  document.body.appendChild(leaderboardBlock);
  // Название игры
  let gameName = document.createElement("h1");
  gameName.style.position = "absolute";
  gameName.style.top = "-60px";
  gameName.textContent = "Doodle Jump";
  gameName.style.transform = "rotate(-7deg)";
  gameName.style.textAlign = 'top';
  gameName.style.fontFamily = 'Train One';
  gameName.style.fontSize = '40px';
  gameName.style.fontWeight = '600';
  leaderboardBlock.appendChild(gameName);
  // Leaderboard title
  let leaderboardHeader = document.createElement("div");
  leaderboardHeader.textContent = "Leaderboard";
  leaderboardHeader.style.textAlign = 'center';
  leaderboardHeader.style.fontFamily = 'Train One';
  leaderboardHeader.style.fontSize = '40px';
  leaderboardHeader.style.fontWeight = '600';
  leaderboardHeader.style.backgroundColor = '#57369c';
  leaderboardHeader.style.color = '#a49eb0';
  leaderboardHeader.style.border = 'thick double #8b62e3';
  leaderboardHeader.style.borderRadius = '10% / 50%'
  leaderboardBlock.appendChild(leaderboardHeader);
  // Персонаж 
  let podium = document.createElement("img");
  podium.src = './src/img/podium.png';
  podium.style.width = platformWidth + 'px';
  podium.style.position = 'absolute';
  podium.style.top = gpose.bottom/1.5+'px';
  character.style.zIndex = "15";
  character.style.opacity = '1';
  character.style.position = 'absolute';
  character.style.bottom = gpose.bottom/5.5+'px';
  character.style.left = (gpose.left+((gpose.right-gpose.left)/8)-15) +'px';
    lbAnimationRot = setInterval (function(){
      charRightEar.animate(jumpRotationRE, 2000);
      charLeftEar.animate(jumpRotationLE, 2000);
      charRightHand.animate(jumpRotationRH, 2000);
      charLeftHand.animate(jumpRotationLH, 2000);
    }, (Math.random()*(9-3)+4)*1000);
    lbAnimationScale = setInterval (function(){
    character.animate([{transform: "scale(1) translate(0)"},  {transform: "scale(1.1)translate(0, -10%)"}],2000);
    }, (Math.random()*(9-2)+4)*1000);
  leaderboardBlock.appendChild(podium);
  
  // Назад в меню блок
  let backToMenu = document.createElement("div");
  backToMenu.style.padding = '10px';
  backToMenu.style.position = 'absolute';
  backToMenu.style.display = 'flex';
  backToMenu.style.borderRadius = '20%'
  backToMenu.style.backgroundColor = '#57369c';
  backToMenu.style.opacity = '0.7';
  backToMenu.style.top = '450px';
  backToMenu.style.left = ((gpose.right-gpose.left)/3) +'px';
  backToMenu.style.transform = "rotate(3deg)";
  let backToMenuImg = document.createElement("img");
  backToMenuImg.src = './src/img/toMenu.png';
  backToMenuImg.style.height = platformHeight + 'px';
  backToMenu.appendChild(backToMenuImg);
  let backToMenuText = document.createElement("div");
  backToMenuText.textContent = "Menu";
  backToMenuText.style.textAlign = 'center';
  backToMenuText.style.fontFamily = 'Train One';
  backToMenuText.style.fontSize = '40px';
  backToMenuText.style.fontWeight = '600';
  backToMenu.appendChild(backToMenuText);
  backToMenu.onmouseover = ()=>{backToMenu.style.cursor = "pointer"}
  backToMenu.onclick = ()=> {
    character.animate([{transform: "translate(0)"},  {transform: "translate(160%, -280%)"}],300)
    leaderboardBlock.remove();
    clearInterval(lbAnimationRot);
    clearInterval(lbAnimationScale);
    menuClick.play();
    field.style.filter = 'none';
    setTimeout(()=> {
    character.style.left = (gpose.left+((gpose.right-gpose.left)/2.35)) + "px"
    mainMenu();
    },300);
  }

  // Leaderboard записи 
  let leaderboardScores = document.createElement("div");
  // leaderboardScores.style.position = "absolute";
  leaderboardScores.style.top = 'inherit';
  leaderboardScores.style.width = 'inherit';
  leaderboardScores.style.display = 'flex';
  leaderboardScores.style.flexDirection = 'column';
  leaderboardScores.style.justifyContent = 'center';
  leaderboardScores.style.textAlign = 'center';
  leaderboardScores.style.alignContent = 'center';
  leaderboardScores.style.paddingLeft = '10px';
  leaderboardScores.style.paddingTop = '10px';
  leaderboardScores.style.fontFamily = 'Train One';
  leaderboardScores.style.fontSize = '20px';
  leaderboardScores.style.backgroundColor = '#38265c';
  leaderboardScores.style.color = '#a49eb0';
  leaderboardScores.style.borderRadius = '3%';
  leaderboardBlock.appendChild(leaderboardScores);
  leaderboardBlock.appendChild(backToMenu);
  // Подгрузка статистики локальной
  let scoreArchive = [];
  for(let i=0; i<localStorage.length; i++) {
    let key = localStorage.key(i);
    scoreArchive.push(JSON.parse(localStorage.getItem(key)));
  }
  scoreArchive.sort((a, b) => a.score > b.score ? -1 : 1);
  if (scoreArchive[0]) {
    for (let i=0; i<10; i++) {
      if (scoreArchive[i]) {
        let lbPosition = document.createElement("div");
        lbPosition.style.display = 'flex';
        lbPosition.style.position = "relative";
        lbPosition.style.textAlign = 'center';
        lbPosition.style.alignContent = 'center';
        lbPosition.style.marginLeft = 0.1*parseInt(leaderboardBlock.style.width) +'px';
        // lbPosition.style.justifyContent = 'space-around';
        // Позиция 
        let lbPositionNum = document.createElement("div");
        lbPositionNum.style.marginBottom = '5px'
        lbPositionNum.style.marginRight = '15px'
        lbPositionNum.style.height = '30px';
        lbPositionNum.style.width = '30px';
        switch (i){
          case 0: 
          lbPositionNum.style.backgroundImage = "url('./src/img/goldMedal.png')"; 
          lbPositionNum.style.backgroundSize = 'contain';
          lbPositionNum.style.backgroundRepeat = 'no-repeat';
          break;
          case 1: 
          lbPositionNum.style.backgroundImage = "url('./src/img/silverMedal.png')";
          lbPositionNum.style.backgroundSize = 'contain';
          lbPositionNum.style.backgroundRepeat = 'no-repeat';
          break;
          case 2: 
          lbPositionNum.style.backgroundImage = "url('./src/img/bronzeMedal.png')";
          lbPositionNum.style.backgroundSize = 'contain';
          lbPositionNum.style.backgroundRepeat = 'no-repeat';
          break;
          default: lbPositionNum.textContent = i+1;
        } 
        lbPosition.appendChild(lbPositionNum);
        // Player avatar
        let lbImg = document.createElement("img");
        lbImg.src = './src/img/player.png';
        lbImg.style.height = '25px';
        lbImg.style.width = '25px';
        lbImg.style.marginRight = '10px';
        lbPosition.appendChild(lbImg);
        //Score block
        let lbPlayerScoreBlock = document.createElement("div");
        // lbPlayerScoreBlock.style.backgroundColor = '#5e468f';
        // lbPlayerScoreBlock.style.borderRadius = '20%';
        lbPlayerScoreBlock.style.display = 'flex';
        lbPlayerScoreBlock.style.height = 'inherit';
        // Player name
        let lbPlayer = document.createElement("div");
        lbPlayer.textContent = scoreArchive[i].name;
        lbPlayer.style.marginRight = '15px';
        lbPlayerScoreBlock.appendChild(lbPlayer);
        // Player score
        let lbScore = document.createElement("div");
        lbScore.textContent = scoreArchive[i].score + 'pts';
        lbPlayerScoreBlock.appendChild(lbScore);
        lbPosition.appendChild(lbPlayerScoreBlock);
        leaderboardScores.appendChild(lbPosition);
      } else {
        return
      }
    }
  } else {
    let lbNull = document.createElement("div");
    lbNull.textContent = 'No scores'
    lbNull.style.textAlign = 'center';
    lbNull.style.fontFamily = 'Train One';
    lbNull.style.fontSize = '20px';
    leaderboardBlock.appendChild(lbNull);
  }
  

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
    document.getElementById('charLight').style.boxShadow = `0 0 90px ${Math.floor(gameScore/300)}px #24aafd`
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
  let movePoints = Math.floor(fieldWidth/35);
  if (movementDirection === -1 && leftPosition > 0) { // Движение влево
    if (leftPosition > (Math.round(gpose.left))) {
      character.style.left = (leftPosition - movePoints) + "px";
    } else {
      character.style.left = (leftPosition + fieldWidth- (character.getBoundingClientRect().width)/2) + "px";
      teleport.load();
      teleport.play();
    }
  } else if (movementDirection === 1 ) { // Движение вправо
    if (leftPosition < (Math.round(gpose.right)-(character.getBoundingClientRect().width))) {
      character.style.left = (leftPosition + movePoints) + "px";
    } else {
      character.style.left = (leftPosition - fieldWidth + (character.getBoundingClientRect().width)*2) + "px";
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
// Обработчик наклона устройства 
// Добавляем обработчик события наклона устройства
window.addEventListener("deviceorientation", handleDeviceOrientation);
// Функция для обработки изменения положения устройства
function handleDeviceOrientation(event) {
  const tiltThreshold = 10; // Порог наклона для определения направления движения

  if (event.gamma < -tiltThreshold) { // Наклон влево
    movementDirection = -1;
  } else if (event.gamma > tiltThreshold) { // Наклон вправо
    movementDirection = 1;
  } else { // Устройство находится в вертикальном положении
    movementDirection = 0;
    moveCharacter(); // Вызываем функцию для перемещения персонажа
  }
}
// Функция прыжка
function jump() {
  clearInterval(jumpInterval);
  clearInterval(gameLoop);
  let jumpCount = 0;
  // Определение верхней платформы
  highestPrevJump = parseInt(character.style.bottom);
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
  bottomPosition = parseInt(character.style.bottom);
  charRightEar.animate(jumpRotationRE, 2000);
  charLeftEar.animate(jumpRotationLE, 2000);
  charRightHand.animate(jumpRotationRH, 2000);
  charLeftHand.animate(jumpRotationLH, 2000);
  jumpSound.play()
  document.getElementsByClassName('basePlatform')? highestPrevJump = 700:jumpCount = 0;
  jumpInterval = setInterval(function () {
    gravity = 2;
    // Перемещаем персонаж вверх
      if (jumpCount < 9) {
        if (parseInt(character.style.bottom)  > window.innerHeight*0.7) {
          bottomPosition += jumpHeight*0.5;
          platformMoveDistance = 2*jumpHeight*(1+window.innerHeight/parseInt(character.style.bottom))
          backgroundPosition -= jumpHeight/5.5;
          scoreJump -= jumpHeight*0.5;
        } else if (parseInt(character.style.bottom)  > window.innerHeight/2) {
          bottomPosition += jumpHeight;
          platformMoveDistance = 2*jumpHeight;
          inMenu? scoreJump -= jumpHeight: backgroundPosition -= jumpHeight/4.5;
          scoreJump -= jumpHeight
        } else if (parseInt(character.style.bottom) > highestPrevJump) {
          bottomPosition += jumpHeight;
          platformMoveDistance = jumpHeight;
          backgroundPosition -= jumpHeight/3; 
        } else {
          bottomPosition += 2 * jumpHeight;
          platformMoveDistance = 0;
        }
        movingPlatforms = document.querySelectorAll(".platform");
        movingPlatforms.forEach (function(platform) {
          platformBottom = parseInt(platform.style.bottom) - platformMoveDistance;
          platform.style.bottom = platformBottom + "px";
        })
        gameField.style.backgroundPosition = "center bottom " + backgroundPosition + "px";
        character.style.bottom = bottomPosition + "px";

        platformRemove();
        checkCoins();
        inMenu === false ? moveCharacter():movementDirection = 0; 
        if (bottomPosition >scoreJump){
          gameScore += 2;
        }
      } else if (jumpCount >= 9 && jumpCount < 14) {

        if (parseInt(character.style.bottom)  > window.innerHeight*0.7) {
          bottomPosition += 0.5 * jumpHeight - 0.3 * jumpHeight;
          platformMoveDistance = jumpHeight*(1+window.innerHeight/parseInt(character.style.bottom))
          backgroundPosition -= 0.2*jumpHeight;
          scoreJump -= 0.5 * jumpHeight - 0.3 * jumpHeight;
        } else if (parseInt(character.style.bottom)  > window.innerHeight/2) {
          bottomPosition += 0.5 * jumpHeight - 0.3 * jumpHeight;
          platformMoveDistance = 0.6*jumpHeight;
          inMenu? scoreJump -= 0.5 * jumpHeight - 0.3 * jumpHeight: backgroundPosition -= 0.2*jumpHeight;
          scoreJump -= 0.5 * jumpHeight - 0.3 * jumpHeight;
        } else if (parseInt(character.style.bottom) > highestPrevJump) {
          bottomPosition += 0.5 * jumpHeight - 0.3 * jumpHeight;
          platformMoveDistance = 0.3 * jumpHeight;
          backgroundPosition -= 0.1 * jumpHeight; 
        } else {
          bottomPosition += 0.5 * jumpHeight;
          platformMoveDistance = 0;
        }
        movingPlatforms = document.querySelectorAll(".platform");
        movingPlatforms.forEach (function(platform) {
          platformBottom = parseInt(platform.style.bottom) - platformMoveDistance;
          platform.style.bottom = platformBottom + "px";
        })
        gameField.style.backgroundPosition = "center bottom " + backgroundPosition + "px";
        character.style.bottom = bottomPosition + "px";

        platformRemove();
        checkCoins ();
        inMenu === false ? moveCharacter():movementDirection = 0; 
        if (Math.floor(bottomPosition) >scoreJump){
          gameScore += 1;
        }
      } else {    // Фаза падения после прыжка
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
          bottomFallenPosition -= gravity
          character.style.bottom = bottomFallenPosition + "px";
          gravity += 0.04;
          (parseInt(character.style.bottom)  < window.innerHeight*0.65)? checkCollision(highestPrevJump): bottomFallenPosition -= gravity; // Проверяем столкновения с платформами
          checkCoins ();
          // Проигрыш если персонаж упал ниже экрана
          if (parseInt(character.style.bottom) < 0 && gameOver === false ) {
            gameOver = true;
            setTimeout(() => clearInterval(gameLoop), 100);
            loseGame();
            return
          }
        }, 7);
      }
    jumpCount++;
  }, 37);
  
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
    newPlatform.classList.add("platform", "basePlatform");
    newPlatform.style.position = 'absolute';
    newPlatform.style.bottom = gpose.top + "px"
    newPlatform.style.left = gpose.left-15 + "px"
    var platformImage = document.createElement("img");
    platformImage.src = "./src/img/Plbase.png"
    platformImage.width = gameField.clientWidth+20;
    newPlatform.appendChild(platformImage);
    gameField.appendChild(newPlatform);
    newPlatform.firstChild.style.filter = platformHue;
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
          coinImage.src = './src/img/coin.png'
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
        newPlatform.firstChild.style.filter = platformHue;
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
        let scoreInfo = {name: currentPlayer, score: gameScore, time: new Date().toLocaleString()}
        localStorage.setItem(lastKey, JSON.stringify(scoreInfo));
        // Обновляем хайскор
        if (highestScoreTotal<gameScore|| highestScoreTotal===0) {
          let bestScore = gameScore
          scoreHighestTot.textContent = "Highest score: " + bestScore + "pts";
          let highscoreImg = document.createElement("img");
          newHScore.play();
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
  // Имя игрока
  let playerName = document.createElement("div");
  playerName.style.display = 'flex'
  playerName.style.justifyContent = 'center'
  gameOverDiv.appendChild(playerName);
  let playerNameDesc = document.createElement("div");
  playerNameDesc.textContent = "Your name: "
  playerName.appendChild(playerNameDesc);
  let playerNameField = document.createElement("input");
  playerNameField.type = 'text';
  playerNameField.style.marginLeft = "15px";
  playerNameField.value = currentPlayer;
  playerNameField.oninput = ()=>{
    currentPlayer = playerNameField.value 
  }
  playerNameField.onchange = ()=>{
  //Обновляем статистику в Local Storage 
  let curKey = localStorage.length;
  let scoreInfo = {name: currentPlayer, score: gameScore, time: new Date().toLocaleString()}
  localStorage.setItem(curKey, JSON.stringify(scoreInfo));
  }
  playerName.appendChild(playerNameField);
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
    platformHue = 'hue-rotate(220deg) brightness(0.8)'
    let deletingPlatforms = document.querySelectorAll(".platform");
        deletingPlatforms.forEach (function(platform) {
            gameField.removeChild(platform);
        })
    gameScore = 0;
    gameOver = false;
    gameSettingsInterval = setInterval (()=>{
      if (gameScore >=1000 && gameScore <3000) {
        gameDifficult = 2;
        platformImages = ["./src/img/PI1.png","./src/img/PI2.png","./src/img/PI3.png","./src/img/PI4.png"];
        platformHue = 'hue-rotate(0deg) brightness(0.8)'
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
    highestPrevJump = 700;
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
    gameScore = 0;
    gameOver = false;
    mainMenu();
  })
}

})();