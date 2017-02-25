const request = require('request');
const http = require('http');
const urlutils = require('url');

const port = 1337;
/*
Программа обрабатывает входящие GET запросы.
Переводит английские слова на русский.
*/

const options = { // Настройки для исходящего запроса к Яндекс translate
    url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20170225T014422Z.2afe3338eff270e7.63eea868ea3ab2335f9355562e71dcca4a5c06d8&lang=en-ru',
    headers: { // Указываем заголовок чтобы правильно обрабатывалось несколько слов
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

let server = http.createServer( (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    if(req.url !== '/favicon.ico' && req.url !== '/'){ // Если получен не пустой GET запрос
        // Добавляем в url для запроса к Яндексу полученные GET данные
        const params = urlutils.parse(options.url, true);
        delete params.search;
        params.query.text = decodeURIComponent(req.url.substr(1));
        options.url = urlutils.format(params);
        // Отправляем запрос
        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) { // Если все ОК, парсим ответ и выводим нужное свойство
                res.write(JSON.parse(body).text.toString());
                res.end();
            } else {
                res.end();
            }
        });
    } else {
        res.end();
    }

});

server.listen(port);
console.log(`Server has started on port ${port}`);
