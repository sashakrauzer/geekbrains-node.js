const request = require('request');
const http = require('http');
const cheerio = require('cheerio');

const port = 8080;
/*
Программа выбирает новости с ria.ru/studies/ за последние 7 дней
и выводит в html
*/

function onRequest(requestHttp, responseHttp) {
    request('https://ria.ru/studies/', function (errorReq, responseReq, htmlReq) {
        if (!errorReq && responseReq.statusCode == 200) {
            // Получить новости за последние 7 дней
            const today = new Date();
            const sevenDays = new Date();
            sevenDays.setDate(today.getDate() - 7);
            const $ = cheerio.load(htmlReq);
            let result = '';
            let newsDate = 0;
            $('.b-list__item-date span').each(function() {
                newsDate = Date.parse($(this).text().split('.').reverse().join('-'));
                // Если новость вышла не раньше семи дней назад, то выводим ее
                if(newsDate >= sevenDays) result += $(this).closest('.b-list__item').html();
            });
            responseHttp.writeHead(200, {'Content-Type': 'text/html'});
            responseHttp.write(result);
            responseHttp.end();
        } else {
            responseHttp.writeHead(503, {'Content-Type': 'text/plain'});
            responseHttp.write('сервис недоступен');
            responseHttp.end();
        }
    });

}
http.createServer(onRequest).listen(port);
console.log(`Server has started on port ${port}`);
