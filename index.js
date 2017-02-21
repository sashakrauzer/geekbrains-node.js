const readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', function (cmd) {
console.log(`Вы ввели ${cmd}`);
});

let userCash = 100, // Деньги пользователя
    userHand = [], // Карты игрока
    dealerHand = [], // Карты дилера
    rate = 0, // Текущая ставка
    userScore = 0, // Очки пользователя
    dealerScore = 0, // Очки дилера
    roundCompleted = 0, // Завершен раунд или нет
    userName = '';
const cardDeck = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Валет', 'Дама', 'Король', 'Туз']; // Будет использоваться бесконечная колода

// console.log(`Добро пожаловать в игру Блэк Джек\nНа вашем счете ${userCash} долларов.`)

rl.question('Добро пожаловать в игру Блэк Джек\nКак к вам обращаться?\n', function(name) {
    userName = name;
    // console.log(name)
    start();
});

// rl.question('Добро пожаловать в игру Блэк Джек\nКак к вам обращаться?', function(answer) {
//     if (isNumeric(answer)) {
//         rate = answer;
//         console.log(`Ваша ставка ${answer}.\nРаздача.`);
//         firstDistribution();
//         pointsCount();
//         if(userScore == 21) {
//           win32();
//           roundCompleted = 1;
//         }
//         console.log(`Очки по итогам раздачи:\nДилер: ${dealerScore}\nИгрок: ${userScore}`);
//     } else {
//         console.log('Введите число.')
//     }
//
// });

/*
  Функции для работы
*/

function start() {
  rl.question('Cделайте вашу ставку:\n', function(answer) {
    rate = answer;
    console.log(`Спасибо ${userName}, ваша ставка принята.\nНачинается раздача.`);
    firstDistribution();
    gameStatus();
    userAction();
  });
}

function isNumeric(n) { // Проверка на число
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function gameStatus() {
  console.log(`Карты дилера: ${dealerHand}\nВаши карты: ${userHand}\nТекущая ставка: ${rate}`);
}

function userAction() {
  if(userScore > 21) {
    console.log('К сожалению сумма очков ваших карт выше 21, вы проиграли.\nДо встречи!');
    rl.close();
  }
  else {
  rl.question(`Ваши действия?\nВведите 'Еще' чтобы получить еще карту\nИли введите 'Достаточно' если вам больше не нужны карты.\n`, function(answer) {
    switch (answer.toLowerCase()) {
      case 'еще':
        rl.close();
        distribution(userHand);
        pointsCount();
        gameStatus();
        userAction();
        break;
      case 'достаточно':
        break;
      default:
        userAction();
    }
  });
}
}

function checkLost() {
    // console.log('');

  // console.log(`Очки игрока ${userScore}\nОчки дилера ${dealerScore}`)
  // console.log('К сожалению вы проиграли');
  // rl.close();
}

// function restart() {
//   rl.question(`Если хотите сыграть еще раз, введите:\n`, function(answer) {
//     rate = answer;
//     console.log(`Спасибо ${userName}, ваша ставка принята.\nНачинается раздача.`);
//     firstDistribution();
//     gameStatus();
//     userAction();
//   });
// }

function randomInteger(min, max) { // Получение рандомного числа
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function distribution(user, dealer) { // Раздача колоды
    if (user) {
        user.push(cardDeck[randomInteger(0, 11)]);
        // console.log(`Ваша у игрока: ${user.pull}`);
        return user;
    } else if (dealer) {
        dealer.push(cardDeck[randomInteger(0, 11)]);
        return dealer;
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
  let k = 0;
  while (k < dealerHand.length) {
      if (isNumeric(dealerHand[i])) {
          dealerScore += dealerHand[i];
      } else if (dealerHand[i] == 'Туз') {
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
}

function win32() {
  console.log(`Поздравляю! Вы победили. Ваш выйгрыш ${rate * 1.5}`);
  userCash += rate * 1.5;
  console.log('Введите "Повтор" если хотите сыграть еще раз.')
}
