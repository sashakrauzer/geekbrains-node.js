const mysql = require('mysql');
const config = require('./config');
const pool = mysql.createPool(config);

const Tasks = {
    list: function() {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if(err) return reject(err);
                // используем полученное соединение
                connection.query( 'SELECT * FROM account', function(err, results, fields) {
                    if(err) return reject(err);
                    // возвращаем соединение в пул
                    resolve(results);
                    connection.release();
                });
            });
        });
    },
    add: function(task) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if(err) return reject(err);
                // используем полученное соединение
                // console.log('task', task);
                connection.query( 'INSERT INTO task SET ?', task, function(err, results) {
                    if(err) return reject(err);
                    // возвращаем соединение в пул
                    // console.log('results', results);
                    resolve(results);
                    connection.release();
                });
            });
        });
    },
    change: function(header, text, id) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if(err) return reject(err);
                // используем полученное соединение
                // console.log('task', task);
                connection.query( 'UPDATE task SET header = ?, text = ? WHERE id = ?', [header, text, id], function(err, results) {
                    if(err) return reject(err);
                    // возвращаем соединение в пул
                    // console.log('results', results);
                    resolve(results);
                    connection.release();
                });
            });
        });
    },
    complete: function(id, callback) {
        // TODO
    },
    delete: function(id) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if(err) return reject(err);
                // используем полученное соединение
                // console.log('task', task);
                connection.query( 'DELETE FROM task WHERE id = ?', [id], function(err, results) {
                    if(err) return reject(err);
                    // возвращаем соединение в пул
                    // console.log('results', results);
                    resolve(results);
                    connection.release();
                });
            });
        });
    }
};
module.exports = Tasks;
