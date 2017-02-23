'use strict'

const readline = require('readline')
const fs = require('fs')
require('colors')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
})

rl.prompt()

rl.on('line', (line) => { // Действия с вводом пользователя
  if (line.trim().toLowerCase() === 'q') {
    rl.close()
  } else {
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
  }
}).on('close', () => {
  console.log('Счастливо!')
  fs.writeFile(pathLogFile, JSON.stringify(gameLog), () => {
    process.exit(0)
  })
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
let rate = 0 // Начальная ставка
let state = 0 // Стартовое состояние
const cardDeck = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Валет', 'Дама', 'Король', 'Туз'] // Будет использоваться бесконечная колода
let gameLog = {}
let countMaxWin = 0
let countMaxLost = 0
const pathLogFile = process.argv.slice(2)[0] // Пусть к файлу для лога

fs.readFile(pathLogFile, 'utf-8', (err, data) => { // Если в файле для лога уже есть данные, взять их. Иначе создать новый объект
  if (err) throw err
  if (data) {
    gameLog = JSON.parse(data)
  } else {
    gameLog = {
      total: 0,
      win: 0,
      lost: 0,
      maxWin: 0,
      maxLost: 0
    }
  }
})

function start () { // Основная функция, выполняет тот или иной код в зависимости от состояния
  switch (state) {
    case 0:
      whatsYourName()
      break
    case 1:
      // console.log('1'.red)
      clearData()
      bet()
      break
    case 2:
      // console.log('2'.red)
      firstDistribution()
      state = 3
      start()
      break
    case 3:
      // console.log('3'.red)
      state = 4
      pointsCount()
      if (check()) break
      start()
      break
    case 4:
      // console.log('4'.red)
      gameStatus()
      options()
      state = 5
      break
    case 5: // Выбор
      // console.log('5'.red)
      pointsCount()
      if (check()) break
      gameStatus()
      options()
      break
    case 6:
      // console.log('6'.red)
      if (distributionDealer()) break
      pointsCount()
      if (check()) break
      gameStatus()
      break
    case 12:
      // console.log('12'.red)
      getCard(user)
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

function whatsYourName () {
  console.log('Введите ваше имя:')
}

function bet () {
  console.log(`${user.name}, сделайте ставку.\nУ вас на счете ${user.cash}`)
}

function options () {
  console.log('Введите "Еще" если хотите получить карту\nИли введите "Достаточно" и дилер начнет раздавать себе.')
}

function isNumeric (n) { // Проверка на число
  return !isNaN(parseFloat(n)) && isFinite(n)
}

function gameStatus () { // Вывод значений игры
  console.log(`Карты дилера: ${dealer.hand}\nВаши карты: ${user.hand}\nТекущая ставка: ${rate}\nВаш счет: ${user.cash}`)
}

function randomInteger (min, max) { // Получение рандомного числа
  var rand = min + Math.random() * (max + 1 - min)
  rand = Math.floor(rand)
  return rand
}

function getCard (whom) { // Получить карту
  whom.hand.push(cardDeck[randomInteger(0, 12)])
}

function distributionDealer () {
  dealer.hand.push(cardDeck[randomInteger(0, 12)])
  pointsCount()
  if (check()) return true
  if (dealer.score < 17) {
    if (distributionDealer()) return true
  }
}

function firstDistribution () { // Раздача после ставки
  getCard(user)
  getCard(user)
  // console.log('карты игрока'.red, user.hand)
  getCard(dealer)
}

function pointsCount () {
  // console.log('pointsCount'.blue)
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

function check () { // Проверка очков на выйгрыш
  if (dealer.hand.length === 1) {
    if (dealer.score >= 10) {
      dealer.maybeBlackJack = 1
      // console.log('dealer mb bj'.red)
      // dealer mb bj
    }
    if (user.hand.length === 2 && user.score === 21) {
      user.bj = 1
      // console.log('user bj'.red)
      // user bj
      if (!dealer.maybeBlackJack) {
        // console.log('user win bj'.red)
        // user win bj
        blackJack(user)
        state = 9
        return true
      }
    }
    if (user.hand.length > 2 && user.score > 21) {
      // console.log('user has a lot of'.red)
      // user has a lot of
      aLotOf(user)
      state = 9
      return true
    }
  } else if (dealer.hand.length === 2) {
    if (dealer.score !== 21 && user.bj) {
      // console.log('user win bj'.red)
      // user win bj
      blackJack(user)
      state = 9
      return true
    }
    if (dealer.score === 21 && user.bj) {
      // console.log('draw bj'.red)
      // draw bj
      drawBj()
      state = 9
      return true
    }
    if (dealer.score === 21 && !user.bj) {
      // console.log('dealer win bj'.red)
      // dealer win bj
      blackJack(dealer)
      state = 9
      return true
    }
    if (dealer.score >= 17 && user.score > dealer.score) {
      // console.log('user win'.red)
      // user win
      loss(dealer)
      state = 9
      return true
    }
    if (user.score < dealer.score) {
      // console.log('dealer win'.red)
      // dealer win
      loss(user)
      state = 9
      return true
    }
    if (dealer.score >= 17 && user.score === dealer.score) {
      // console.log('draw'.red)
      // draw
      draw()
      state = 9
      return true
    }
  } else if (dealer.hand.length > 2) {
    if (dealer.score >= 17 && user.score > dealer.score) {
      // console.log('user win'.red)
      // user win
      loss(dealer)
      state = 9
      return true
    }
    if (dealer.score > 21) {
      // console.log('dealer has a lot of'.red)
      // dealer has a lot of
      aLotOf(dealer)
      state = 9
      return true
    }
    if (dealer.score > user.score) {
      // console.log('dealer win'.red)
      // dealer win
      loss(user)
      state = 9
      return true
    }
    if (dealer.score >= 17 && user.score === dealer.score) {
      // console.log('draw'.red)
      // draw
      draw()
      state = 9
      return true
    }
  }
}

/*
 Вспомогательные функции для проверки очков
*/

function blackJack (whom) { // он выиграл с Блэк Джеком
  if (whom === user) {
    console.log('У вас Блэк Джек! Поздравляю!'.rainbow, `\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nСумма выигрыша: ${rate * 1.5 + +rate}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
    user.cash += rate * 1.5 + +rate

    // Статистика
    gameLog.win++
    gameLog.total++
    countMaxLost = 0
    countMaxWin++
    if (gameLog.maxWin < countMaxWin) {
      gameLog.maxWin = countMaxWin
    }
  } else if (whom === dealer) {
    console.log('У крупье Блэк Джек, вы проиграли.'.red, `\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)

    // Статистика
    gameLog.lost++
    gameLog.total++
    countMaxWin = 0
    countMaxLost++
    if (gameLog.maxLost < countMaxLost) {
      gameLog.maxLost = countMaxLost
    }
  }
}

function loss (whom) { // У кого меньше, проигрывает
  if (whom === user) {
    console.log('Вы проиграли, у дилера больше очков'.red, `\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)

    // Статистика
    gameLog.lost++
    gameLog.total++
    countMaxWin = 0
    countMaxLost++
    if (gameLog.maxLost < countMaxLost) {
      gameLog.maxLost = countMaxLost
    }
  } else if (whom === dealer) {
    console.log('Поздравляю! Вы выиграли!'.rainbow, `\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nСумма выигрыша: ${rate * 2}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
    user.cash += rate * 2

    // Статистика
    gameLog.win++
    gameLog.total++
    countMaxLost = 0
    countMaxWin++
    if (gameLog.maxWin < countMaxWin) {
      gameLog.maxWin = countMaxWin
    }
  }
}

function aLotOf (whom) { // Кто перебрал, проиграл
  if (whom === user) {
    console.log('Сумма ваших очков превышает 21, вы проиграли'.red, `\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)

    // Статистика
    gameLog.lost++
    gameLog.total++
    countMaxWin = 0
    countMaxLost++
    if (gameLog.maxLost < countMaxLost) {
      gameLog.maxLost = countMaxLost
    }
  } else if (whom === dealer) {
    console.log('Поздравляю! Вы выиграли!'.rainbow, `\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nСумма выигрыша: ${rate * 2}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
    user.cash += rate * 2

    // Статистика
    gameLog.win++
    gameLog.total++
    countMaxLost = 0
    countMaxWin++
    if (gameLog.maxWin < countMaxWin) {
      gameLog.maxWin = countMaxWin
    }
  }
}

function draw () { // Ничья
  console.log('У вас ничья!'.green, `\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
  user.cash += +rate
  gameLog.total++
  countMaxLost = 0
  countMaxWin = 0
}

function drawBj () { // Ничья, у обоих Блэк Джек
  console.log('У вас и у крупье Блэк Джек. Ничья.'.green, `\nВаши карты: ${user.hand} \nКарты крупье: ${dealer.hand}\nЕсли хотите повторить игру, введите "Новая игра" или введите "q" чтобы выйти.`)
  user.cash += +rate
  gameLog.total++
  countMaxLost = 0
  countMaxWin = 0
}
