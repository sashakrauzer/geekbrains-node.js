const express = require('express');
const bodyParser = require('body-parser');
const tasks = require('./models/tasks');

const port = process.env.PORT || 8089;
const app = express();

// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.get('/', (req, res) => {
    res.end('hello');
});

// Вывести список задач
app.get('/tasks', (req, res) => {
    // Функция получения данных из базы возвращает промис
    const promise = listRow(req.query.table);
    promise.then((result) => {
        // После получения и обработки данных, они попадают сюда.
        // Выводим их
        res.send(result);
    }, () => {
        console.log('error');
        res.end();
    });
});

// Добавить новую задачу в базу данных
app.post('/tasks', (req, res) => {
    const promise = addRow(req.body.table, {header: req.body.header, text: req.body.text, priority: req.body.priority});
    promise.then((result) => {
        res.send(result);
    }, () => {
        console.log('error');
        res.end();
    });
});

// Изменить какую либо задачу
app.put('/tasks', (req, res) => {
    const promise = changeRow(req.body.table, {header: req.body.header, text: req.body.text, priority: req.body.priority}, req.body.id);
    promise.then((result) => {
        res.send(result);
    }, () => {
        console.log('error');
        res.end();
    });
});

// Удалить задачу
app.delete('/tasks', (req, res) => {
    const promise = deleteRow(req.body.table, req.body.id);
    promise.then((result) => {
        res.send(result);
    }, () => {
        console.log('error');
        res.end();
    });
});

function listRow(table) {
    const promise = new Promise((resolve, reject) => {
        // Вызывается функция получения данных из базы. Она возвращает промис
        tasks.list(table).then((result) => {
            let arr = [];
            for(let row = 0; row < result.length; row++) {
                arr.push(result[row]);
            }
            // Если данные получены и обработаны, отправляем их еще выще
            resolve(arr);
        }, (err) => {
            console.log(err);
        });
    });
    return promise;
}

function addRow(table, content) {
    const promise = new Promise((resolve, reject) => {
        tasks.add(table, content).then((result) => {
            resolve('success');
        }, (err) => {
            console.log(err);
        });
    });
    return promise;
}

function changeRow(table, changeContent, whereId) {
    const promise = new Promise((resolve, reject) => {
        tasks.change(table, changeContent, whereId).then((result) => {
            resolve(result);
        }, (err) => {
            console.log(err);
        });
    });
    return promise;
}

function deleteRow(table, whereId) {
    const promise = new Promise((resolve, reject) => {
        tasks.delete(table, whereId).then((result) => {
            resolve(result);
        }, (err) => {
            console.log(err);
        });
    });
    return promise;
}

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});