const readline = require('readline')
const colors = require('colors')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
})

rl.prompt()

rl.on('line', (line) => {
  if (line.trim().toLowerCase() === 'q') rl.close()
  // if(line.trim().toLowerCase() == 'новая игра')
  switch (state) {
    case 0:
      user.name = line
      state = 1
      break
    case 1:
      rate = line
      user.cash -= rate
      state = 2
      break
    case 3:
      if (line.trim().toLowerCase() === 'еще') distributionForUser()
      else if (line.trim().toLowerCase() === 'достаточно') {
        distributionDealer()
        state = 4
      }
      break
    case 9:
      state = 1
      break
    default:
      console.log(`Say what? I might have heard '${line.trim()}'`)
      break
  }
  start()
  rl.prompt()
}).on('close', () => {
  console.log('Счастливо!')
  process.exit(0)
})

class User {
  constructor () {
    this.cash = 1000
    this.hand = []
    this.score = 0
    this.name = ''
  }
}

class Dealer {
  constructor () {
    this.hand = []
    this.score = 0
  }
}

let user = new User()
let dealer = new Dealer()

let rate = 0 // Текущая ставка
let state = 0 // Стартовое состояние
const cardDeck = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Валет', 'Дама', 'Король', 'Туз'] // Будет использоваться бесконечная колода

function start () {
  switch (state) { // При запуске проверяется текущее состояние, и в зависимости от него, выполняются тот или иной код.
    case 0:
      whatsYourName()
      break
    case 1:
      bet()
      break
    case 2:
      firstDistribution()
      state = 3
    case 3:
      gameStatus()
      if (checkLost()) break
      else if (checkBlackJack()) break
      else options()
      break
    case 4:
      gameStatus()
      if (checkLost()) break
      finish()
      break
    default:
      break
  }
}

start() // Первый запуск игры

/*
  Вспомогательные функции
*/

function checkBlackJack () {
  pointsCount()
  if (state === 3) {
    // console.log('Очки', user.score);
    if (user.score === 21) {
      console.log('У вас Блэк Джек!\n')
      // return true;
      if (dealer.score === 10) {
        console.log('У вас Блэк Джек!\nНо у дилера есть шанс')
      }
    }
  }
  // else if(state == 4) {
  //   if(dealer.score > 21) {
  //     dealerLost();
  //     return true;
  //   }
  // }
}

function whatsYourName () {
  console.log('Введите ваше имя:')
}

function bet () {
  console.log(`${user.name}, сделайте ставку.\nУ вас на счете ${user.cash}`)
}

function options () {
  console.log('Введите "Еще" если хотите получить карту\nИли введите "Достаточно" и дилер начнет раздавать себе.')
}

function finish () {
  pointsCount()
  // console.log('finish');
  if (user.score > dealer.score) {
    // console.log('finish2');
    console.log('Победа'.green, user.score, dealer.score)
    dealerLost()
    // console.log(`Ваши очки: ${user.score} \nОчки крупье: ${dealer.score}`);
  } else if (user.score < dealer.score) {
    console.log('Поражение'.red, user.score, dealer.score)
    playerLoses()
  } else {
    draw()
  }
}

function isNumeric (n) { // Проверка на число
  return !isNaN(parseFloat(n)) && isFinite(n)
}

function gameStatus () {
  console.log(`Карты дилера: ${dealer.hand}\nВаши карты: ${user.hand}\nТекущая ставка: ${rate}\nВаш счет: ${user.cash}`)
}

function checkLost (whom) {
  pointsCount()
  if (state === 3) {
    // console.log('Очки', user.score);
    if (user.score > 21) {
      playerLoses()
      return true
    }
  } else if (state === 4) {
    if (dealer.score > 21) {
      dealerLost()
      return true
    }
  }
}

function playerLoses () {
  if (state === 3) {
    console.log(`Сумма ваших очков превышает 21, вы проиграли:(\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
    state = 9
    user.hand = []
    dealer.hand = []
  } else if (state === 4) {
    console.log('Поражение'.red, user.score, dealer.score)
    console.log(`К сожалению вы проиграли:(\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
    state = 9
    user.hand = []
    dealer.hand = []
  }
}

function dealerLost () {
  console.log(`Поздравляю! Вы выиграли!\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
  state = 9
  user.hand = []
  dealer.hand = []
  user.cash += rate * 2
}

// function dealerLost() {
//   console.log(`Вау, у вас Блэк Джек! Поздравляю!\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`);
//   state = 9;
//   user.hand = [];
//   dealer.hand = [];
//   user.cash += rate * 2;
// }

function draw () {
  console.log(`У вас ничья!\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
  user.cash += +rate
  state = 9
  user.hand = []
  dealer.hand = []
}

function randomInteger (min, max) { // Получение рандомного числа
  var rand = min + Math.random() * (max + 1 - min)
  rand = Math.floor(rand)
  return rand
}

function distribution (user, dealer) { // Раздача колоды
  if (user) {
    user.push(cardDeck[randomInteger(0, 12)])
    // console.log(`Ваша у игрока: ${user.pull}`);
    return user
  } else if (dealer) {
    dealer.push(cardDeck[randomInteger(0, 12)])
    return dealer
  }
}

function distributionForUser () {
  user.hand.push(cardDeck[randomInteger(0, 12)])
}

function distributionDealer () {
  while (true) {
    pointsCount()
    if (dealer.score < 17) dealer.hand.push(cardDeck[randomInteger(0, 12)])
    else break
  }
}

function firstDistribution () { // Раздача после ставки
  user.hand = distribution(user.hand)
  user.hand = distribution(user.hand)
  console.log('карты игрока'.red, user.hand)
  dealer.hand = distribution(null, dealer.hand)
}

function isBlackJack () { // Проверка карт пользователя на наличие комбинации Блэк Джек
  let i = 0
  while (i < user.hand.length) {
    if (isNumeric(user.hand[i])) {
      user.score = user.hand[i]
    } else if (user.hand[i] === 'Туз') {
      if (user.score + 11 === 22) {
        user.score += 1
      } else {
        user.score += 11
      }
    } else {
      user.score += 10
    }
    i++
  }
}

function pointsCount () {
  user.score = 0
  let i = 0
  while (i < user.hand.length) {
    if (isNumeric(user.hand[i])) {
      user.score += user.hand[i]
    } else if (user.hand[i] === 'Туз') {
      if (user.score + 11 === 22) {
        user.score += 1
      } else {
        user.score += 11
      }
    } else {
      user.score += 10
    }
    i++
  }
  // console.log('Очки игрока'.rainbow, user.score);
  dealer.score = 0
  let k = 0
  while (k < dealer.hand.length) {
    if (isNumeric(dealer.hand[k])) {
      dealer.score += dealer.hand[k]
    } else if (dealer.hand[k] === 'Туз') {
      if (dealer.score + 11 === 22) {
        dealer.score += 1
      } else {
        dealer.score += 11
      }
    } else {
      dealer.score += 10
    }
    k++
  }
  // console.log('Очки дилера'.rainbow, dealer.score);
}

function win32 () {
  console.log(`Поздравляю! Вы победили. Ваш выйгрыш ${rate * 1.5}`)
  user.cash += rate * 1.5
  console.log('Введите "Повтор" если хотите сыграть еще раз.')
}
