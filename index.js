const tasks = require('./models/tasks');

// tasks.list().then((result) => {
//     console.log(result[0]);
// }, (err) => {
//     console.log(err);
// });

// let addTask = {header: 'Задача 1', text: 'содержание', priority: 'low'};

// tasks.add(addTask).then((result) => {
//     console.log(result);
// }, (err) => {
//     console.log(err);
// });

// let header = 'новый заголовок';
// let text = 'новое содержание';
let id = 2;

// tasks.change(header, text, id).then((result) => {
//     console.log(result);
// }, (err) => {
//     console.log(err);
// });

tasks.delete(id).then((result) => {
    console.log(result);
}, (err) => {
    console.log(err);
});
