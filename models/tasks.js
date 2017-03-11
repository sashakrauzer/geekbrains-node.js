const mysql = require('mysql');
const config = require('./config');
const pool = mysql.createPool(config);

const Tasks = {
    list: function(table) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if(err) return reject(err);
                // используем полученное соединение
                connection.query( 'SELECT * FROM ??', table,function(err, results) {
                    if(err) return reject(err);
                    // возвращаем соединение в пул
                    resolve(results);
                    connection.release();
                });
            });
        });
    },
    add: function(table, content) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if(err) return reject(err);
                connection.query( 'INSERT INTO ?? SET ?', [table, content], function(err, results) {
                    if(err) return reject(err);
                    resolve(results);
                    connection.release();
                });
            });
        });
    },
    change: function(table, content, id) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if(err) return reject(err);
                connection.query( 'UPDATE ?? SET ? WHERE id = ?', [table, content, id], function(err, results) {
                    if(err) return reject(err);
                    resolve(results);
                    connection.release();
                });
            });
        });
    },
    delete: function(table, id) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if(err) return reject(err);
                connection.query( 'DELETE FROM ?? WHERE id = ?', [table, id], function(err, results) {
                    if(err) return reject(err);
                    resolve(results);
                    connection.release();
                });
            });
        });
    }
};
module.exports = Tasks;
