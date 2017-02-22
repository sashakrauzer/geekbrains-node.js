'use strict'

const readline = require('readline')
const colors = require('colors')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
})

rl.prompt()

rl.on('line', (line) => { // Действия с вводом пользователя
  if (line.trim().toLowerCase() === 'q') rl.close()
  // if(line.trim().toLowerCase() == 'новая игра')
  switch (state) {
    case 0: // Ввод имени
      user.name = line
      state = 1
      break
    case 1: // Ставка
      rate = line
      user.cash -= rate
      state = 2
      break
    case 5: // Обработка вариантов после первой раздачи
      if (line.trim().toLowerCase() === 'еще') state = 12
      else if (line.trim().toLowerCase() === 'достаточно') {
        state = 6
      }
      break
    case 9: // Любой ввод, кроме 'q', переносит в начало игры
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
    this.bj = 0
    this.loss = 0
  }
}

class Dealer {
  constructor () {
    this.hand = []
    this.score = 0
    this.bj = 0
    this.maybeBlackJack = 0
    this.loss = 0
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
      console.log('1'.red)
      clearData()
      bet()
      break
    case 2:
      console.log('2'.red)
      firstDistribution()
      state = 3
      start()
      break
    case 3:
      console.log('3'.red)
      state = 4
      pointsCount()
      if (check()) break
      start()
      break
    case 4:
      console.log('4'.red)
      gameStatus()
      options()
      state = 5
      break
    case 5: // Выбор
      console.log('5'.red)
      pointsCount()
      if (check()) break
      gameStatus()
      options()
      break
    case 6:
      console.log('6'.red)
      distributionDealer()
      pointsCount()
      if (check()) break
      gameStatus()
      break
    case 12:
      console.log('12'.red)
      distributionForUser()
      pointsCount()
      if (check()) break
      state = 5
      start()
      break
    default:
      break
  }
}

start() // Первый запуск игры

/*
Вспомогательные функции
*/

function clearData () {
  user.hand = []
  user.bj = 0
  user.score = 0
  user.loss = 0
  dealer.hand = []
  dealer.score = 0
  dealer.bj = 0
  dealer.maybeBlackJack = 0
  dealer.loss = 0
}

function checkBlackJack (whom) {
  pointsCount()
  if (whom.score === 21) {
    blackJack(whom)
    return true
  } else {
    return false
  }
}

function blackJack (whom) {
  if (whom === user) {
    console.log(`У вас Блэк Джек! Поздравляю!\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
    user.cash += rate * 1.5 + rate
  } else if (whom === dealer) {
    console.log(`У крупье Блэк Джек, вы проиграли.\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
  }
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

// function finish () {
//   pointsCount()
//   // console.log('finish');
//   if (user.score > dealer.score) {
//     // console.log('finish2');
//     console.log('Победа'.green, user.score, dealer.score)
//     dealerLost()
//     // console.log(`Ваши очки: ${user.score} \nОчки крупье: ${dealer.score}`);
//   } else if (user.score < dealer.score) {
//     console.log('Поражение'.red, user.score, dealer.score)
//     playerLoses()
//   } else {
//     draw()
//   }
// }

function isNumeric (n) { // Проверка на число
  return !isNaN(parseFloat(n)) && isFinite(n)
}

function gameStatus () { // Вывод значений игры
  console.log(`Карты дилера: ${dealer.hand}\nВаши карты: ${user.hand}\nТекущая ставка: ${rate}\nВаш счет: ${user.cash}`)
}

// function checkLost (whom) { // Проверка на проигрыш
//   pointsCount()
//   if (whom === user && user.score > 21) {
//     loss(whom)
//     return true
//   } else if (whom === dealer && dealer.score > 21) {
//     loss(whom)
//     return true
//   }
// }

function loss (whom) {
  if (whom === user) {
    console.log(`Сумма ваших очков превышает 21, вы проиграли:(\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
  } else if (whom === dealer) {
    console.log(`Поздравляю! Вы выиграли!\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
    user.cash += rate * 2
  }
}

function draw () { // Ничья
  console.log(`У вас ничья!\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
  user.cash += +rate
}

function randomInteger (min, max) { // Получение рандомного числа
  var rand = min + Math.random() * (max + 1 - min)
  rand = Math.floor(rand)
  return rand
}

// function distribution (user, dealer) { // Раздача колоды
//   if (user) {
//     user.push(cardDeck[randomInteger(0, 12)])
//     // console.log(`Ваша у игрока: ${user.pull}`);
//     return user
//   } else if (dealer) {
//     dealer.push(cardDeck[randomInteger(0, 12)])
//     return dealer
//   }
// }

function distributionForUser () { // Карта игроку
  user.hand.push(cardDeck[randomInteger(0, 12)])
}

function distributionDealer () {
  dealer.hand.push(cardDeck[randomInteger(0, 12)])
  pointsCount()
  if (dealer.score < 17) {
    distributionDealer()
  }
}

function firstDistribution () { // Раздача после ставки
  user.hand.push('Валет')
  user.hand.push('Туз')
  console.log('карты игрока'.red, user.hand)
  dealer.hand.push('Туз')
}

function pointsCount () {
  console.log('pointsCount'.blue)
  user.score = 0 // обнуляем
  let i = 0
  while (i < user.hand.length) { // Подсчет очков игрока
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
  while (k < dealer.hand.length) { // Подсчет очков крупье
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
}

function check () {
  console.log('очки игрока'.red, user.score)
  console.log('очки крупье'.red, dealer.score)
  // Проверка крупье
  if (dealer.hand.length === 1 && dealer.score >= 10) { // Может ли быть блэк джек у крупье
    dealer.maybeBlackJack = 1
    console.log('dealer mb bj'.red)
  } else if (dealer.hand.length === 2 && dealer.score !== 21) { // не блэк джек
    dealer.maybeBlackJack = 0
    console.log('dealer no bj'.red)
  } else if (dealer.hand.length === 2 && dealer.score === 21) {
    console.log('dealer have bj'.red)
    dealer.bj = 1
  }
  if (dealer.score > 21) {
    dealer.loss = 1
    console.log('dealer lost'.red)
  }

  // Проверка игрока
  if (user.hand.length === 2 && user.score === 21) { // у игрока блэк джек?
    user.bj = 1
    console.log('user have bj'.red)
  } else if (user.score > 21) {
    user.loss = 1
    console.log('user loss'.red)
  }
  // Результат

  // Игрок
  if (user.loss) {
    console.log('user lost'.red)
    loss(user)
    state = 9
    return true
  } else if (user.bj && !dealer.maybeBlackJack && !dealer.bj) {
    console.log('user win bj'.red)
    blackJack(user)
    state = 9
    return true
  }

  // Крупье
  if (dealer.loss) {
    console.log('dealer lost'.red)
    loss(dealer)
    state = 9
    return true
  } else if (dealer.bj && !user.bj) {
    console.log('dealer win bj'.red)
    blackJack(dealer)
    state = 9
    return true
  }

  // Ничья
  if (dealer.bj && user.bj) {
    console.log('draw'.red)
    draw()
    state = 9
    return true
  }
  // if (dealer.hand.length === 2 && dealer.score === 21) {
  //   console.log('dealer have bj'.red)
  //   dealer.bj = 1
  //   if (user.bj) {
  //     console.log('draw'.red)
  //     draw()
  //     state = 9
  //     return true
  //   } else {
  //     console.log('dealer win bj'.red)
  //     blackJack(dealer)
  //     return true
  //   }
  // } else if (dealer.score > 21) {
  //   console.log('dealer lost'.red)
  //   loss(dealer)
  //   state = 9
  //   return true
  // }
  //
  //  else { // Иначе пользователь победил
  //   console.log('user win bj'.red)
  //   blackJack(user)
  //   state = 9
  //   return true
  //   }
  //
  // loss(user)
  // state = 9
  // return true
  //
  // loss(dealer)
  // state = 9
  // return true
}
