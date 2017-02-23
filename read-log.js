const fs = require('fs')
fs.readFile('./gamelog.json', 'utf8', function (err, data) {
  if (err) throw err
  const log = JSON.parse(data)
  console.log(`Общее количество партий: ${log.total}\nВыигранных партий: ${log.win}\nПроигранных партий: ${log.lost}\nСоотношение побед к проигрышу: ${(log.win / log.lost).toFixed(1)}\nМаксимальное число побед подряд: ${log.maxWin}\nМаксимальное число проигрышей подряд: ${log.maxLost}`)
})
