function randomInteger(min, max) { // Получение рандомного числа
  var rand = min + Math.random() * (max + 1 - min);
  rand = Math.floor(rand);
  return rand;
}



const cardDeck = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Валет', 'Дама', 'Король', 'Туз']; // Будет использоваться бесконечная колода
let userHand = [];
let i = 0;
while(i < 50) {
  distributionForUser();

  i++;
}
console.log(userHand);
function distributionForUser() {
  userHand.push(cardDeck[randomInteger(0, 12)]);
}
