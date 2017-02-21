const readline = require('readline');
const colors = require('colors');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

rl.prompt();

rl.on('line', (line) => {
  if(line.trim().toLowerCase() == 'q') rl.close();
  // if(line.trim().toLowerCase() == 'новая игра')
  switch(state) {
    case 0:
    userName = line;
    state = 1;
    break;
    case 1:
    rate = line;
    userCash -= rate;
    state = 2;
    break;
    case 3:
    if(line.trim().toLowerCase() == 'еще') distributionForUser();
    else if(line.trim().toLowerCase() == 'достаточно') {
      distributionDealer();
      state = 4;
    }
    break;
    case 9:
    state = 1;
    break;
    default:
    console.log(`Say what? I might have heard '${line.trim()}'`);
    break;
  }
  start();
  rl.prompt();
}).on('close', () => {
  console.log('Счастливо!');
  process.exit(0);
});

let state = 0;

let userCash = 1000, // Деньги пользователя
userHand = [], // Карты игрока
dealerHand = [], // Карты дилера
rate = 0, // Текущая ставка
userScore = 0, // Очки пользователя
dealerScore = 0, // Очки дилера
roundCompleted = 0, // Завершен раунд или нет
userName = '';
const cardDeck = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Валет', 'Дама', 'Король', 'Туз']; // Будет использоваться бесконечная колода

function start() {
  switch(state) { // При запуске проверяется текущее состояние, и в зависимости от него, выполняются тот или иной код.
    case 0:
    whatsYourName();
    break;
    case 1:
    bet();
    break;
    case 2:
    firstDistribution();
    state = 3;
    case 3:
    gameStatus();
    if(checkLost()) break;
    else if(checkBlackJack()) break;
    options();
    break;
    case 4:
    gameStatus();
    if(checkLost()) break;
    finish();
    break;
    default:
    break;
  }
}

start(); // Первый запуск игры


/*
  Вспомогательные функции
*/

function whatsYourName() {
  console.log('Введите ваше имя:');
}

function bet() {
  console.log(`${userName}, сделайте ставку.\nУ вас на счете ${userCash}`);
}

function options() {
  console.log('Введите "Еще" если хотите получить карту\nИли введите "Достаточно" и дилер начнет раздавать себе.');
}

function finish() {
  pointsCount();
  // console.log('finish');
  if(userScore > dealerScore) {
    // console.log('finish2');
    console.log('Победа'.green, userScore, dealerScore);
    dealerLost();
    // console.log(`Ваши очки: ${userScore} \nОчки крупье: ${dealerScore}`);
  }
  else if(userScore < dealerScore) {
      console.log('Поражение'.red, userScore, dealerScore);
    playerLoses();
  }
  else {
    draw();
  }
}

function isNumeric(n) { // Проверка на число
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function gameStatus() {
  console.log(`Карты дилера: ${dealerHand}\nВаши карты: ${userHand}\nТекущая ставка: ${rate}\nВаш счет: ${userCash}`);
}

function checkLost() {
  pointsCount();
  if(state == 3) {
    // console.log('Очки', userScore);
    if(userScore > 21) {
      playerLoses();
      return true;
    }
  }
  else if(state == 4) {
    if(dealerScore > 21) {
      dealerLost();
      return true;
    }
  }
}

function playerLoses() {
  if(state == 3) {
    console.log(`Сумма ваших очков превышает 21, вы проиграли:(\nВаши карты: ${userHand} \nКарты крупье: ${dealerHand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`);
    state = 9;
    userHand = [];
    dealerHand = [];
  }
  else if(state == 4) {
    console.log('Поражение'.red, userScore, dealerScore);
    console.log(`К сожалению вы проиграли:(\nВаши карты: ${userHand} \nКарты крупье: ${dealerHand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`);
    state = 9;
    userHand = [];
    dealerHand = [];
  }

}

function dealerLost() {
  console.log(`Поздравляю! Вы выиграли!\nВаши карты: ${userHand} \nКарты крупье: ${dealerHand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`);
  state = 9;
  userHand = [];
  dealerHand = [];
  userCash += rate * 2;
}

function draw() {
  console.log(`У вас ничья!\nВаши карты: ${userHand} \nКарты крупье: ${dealerHand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`);
  userCash += +rate;
  state = 9;
  userHand = [];
  dealerHand = [];
}

function randomInteger(min, max) { // Получение рандомного числа
  var rand = min + Math.random() * (max + 1 - min);
  rand = Math.floor(rand);
  return rand;
}

function distribution(user, dealer) { // Раздача колоды
  if (user) {
    user.push(cardDeck[randomInteger(0, 12)]);
    // console.log(`Ваша у игрока: ${user.pull}`);
    return user;
  } else if (dealer) {
    dealer.push(cardDeck[randomInteger(0, 12)]);
    return dealer;
  }
}

function distributionForUser() {
  userHand.push(cardDeck[randomInteger(0, 12)]);
}

function distributionDealer() {
  while(true) {
    pointsCount();
    if(dealerScore < 17) dealerHand.push(cardDeck[randomInteger(0, 12)]);
    else break;
  }
}

function firstDistribution() { // Раздача после ставки
  userHand = distribution(userHand);
  userHand = distribution(userHand);
  dealerHand = distribution(null, dealerHand);
}

function isBlackJack() { // Проверка карт пользователя на наличие комбинации Блэк Джек
  let i = 0;
  while (i < userHand.length) {
    if (isNumeric(userHand[i])) {
      userScore = userHand[i];
    } else if (userHand[i] == 'Туз') {
      if (userScore + 11 == 22) {
        userScore += 1;
      } else {
        userScore += 11
      }
    } else {
      userScore += 10;
    }
    i++;
  }
}

function pointsCount() {
  userScore = 0;
  let i = 0;
  while (i < userHand.length) {
    if (isNumeric(userHand[i])) {
      userScore += userHand[i];
    } else if (userHand[i] == 'Туз') {
      if (userScore + 11 == 22) {
        userScore += 1;
      } else {
        userScore += 11
      }
    } else {
      userScore += 10;
    }
    i++;
  }
  // console.log('Очки игрока'.rainbow, userScore);
  dealerScore = 0;
  let k = 0;
  while (k < dealerHand.length) {
    if (isNumeric(dealerHand[k])) {
      dealerScore += dealerHand[k];
    } else if (dealerHand[k] == 'Туз') {
      if (dealerScore + 11 == 22) {
        dealerScore += 1;
      } else {
        dealerScore += 11
      }
    } else {
      dealerScore += 10;
    }
    k++;
  }
  // console.log('Очки дилера'.rainbow, dealerScore);
}

function win32() {
  console.log(`Поздравляю! Вы победили. Ваш выйгрыш ${rate * 1.5}`);
  userCash += rate * 1.5;
  console.log('Введите "Повтор" если хотите сыграть еще раз.')
}
