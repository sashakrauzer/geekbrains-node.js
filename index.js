const tasks = require('./models/tasks');

// let addContent = {header: 'Задача 6', text: 'содержание 6', priority: 'critical'};
// let changeContent = {header: 'Задача 99', text: 'содержание 9', priority: 'medium'};
// let whereId = 5;
// let table = 'tasks';

function listRow(table) {
    tasks.list(table).then((result) => {
        for(let row = 0; row < result.length; row++) {
            console.log(result[row]);
        }
    }, (err) => {
        console.log(err);
    });
}

function addRow(table, content) {
    tasks.add(table, content).then((result) => {
        console.log(result);
    }, (err) => {
        console.log(err);
    });
}

function changeRow(table, changeContent, whereId) {
    tasks.change(table, changeContent, whereId).then((result) => {
        console.log(result);
    }, (err) => {
        console.log(err);
    });
}

function deleteRow(table, whereId) {
    tasks.delete(table, whereId).then((result) => {
        console.log(result);
    }, (err) => {
        console.log(err);
    });
}

// listRow(table); // Вывод таблицы
// addRow(table, addContent); // Запись в таблицу
// changeRow(table, changeContent, whereId); // Изменение записи
// deleteRow(table, whereId); // Удаление записи
