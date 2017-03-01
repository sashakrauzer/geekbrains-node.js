const express = require('express');
const consolidate = require('consolidate');
const request = require('request');
const FeedParser = require('feedparser'); // Парсит ответ xml в объект
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 8082;
const newsServises = { // Сервисы и их категории
    'Yandex': {
        'Спорт': 'https://news.yandex.ru/sport.rss',
        'Наука': 'https://news.yandex.ru/science.rss',
        'В мире': 'https://news.yandex.ru/world.rss',
        'Музыка': 'https://news.yandex.ru/music.rss',
        'Авто': 'https://news.yandex.ru/auto.rss',
        'Интернет': 'https://news.yandex.ru/internet.rss',
        'Технологии': 'https://news.yandex.ru/computers.rss'
    },
    'LentaRu': {
        'Спорт': 'https://lenta.ru/rss/articles',
        'Наука и техника': 'https://lenta.ru/rss/articles',
        'Культура': 'https://lenta.ru/rss/articles',
        'Путешествия': 'https://lenta.ru/rss/articles',
        'Бывшый СССР': 'https://lenta.ru/rss/articles',
    },
    'VestiRu': {
        'Политика': 'http://www.vesti.ru/vesti.rss',
        'В мире': 'http://www.vesti.ru/vesti.rss',
        'Происшествия': 'http://www.vesti.ru/vesti.rss',
        'Спорт': 'http://www.vesti.ru/vesti.rss',
        'Hi-Tech. Интернет': 'http://www.vesti.ru/vesti.rss',
    },
    'CNN': {
        'World sport': 'http://rss.cnn.com/rss/edition_sport.rss',
        'Science & Space': 'http://rss.cnn.com/rss/edition_space.rss',
        'Golf': 'http://rss.cnn.com/rss/edition_golf.rss',
        'Football': 'http://rss.cnn.com/rss/edition_football.rss',
        'Money': 'http://rss.cnn.com/rss/money_news_international.rss',
    },
    'BBC': {
        'Entertainment & Arts': 'http://feeds.bbci.co.uk/news/video_and_audio/entertainment_and_arts/rss.xml',
        'Science & Environment': 'http://feeds.bbci.co.uk/news/video_and_audio/science_and_environment/rss.xml',
        'World': 'http://feeds.bbci.co.uk/news/video_and_audio/world/rss.xml',
        'Health': 'http://feeds.bbci.co.uk/news/video_and_audio/health/rss.xml',
        'Politics': 'http://feeds.bbci.co.uk/news/video_and_audio/politics/rss.xml',
    },
    'MailRu': {
        'Спорт': 'https://news.mail.ru/rss/sport/',
        'Политика': 'https://news.mail.ru/rss/politics/',
        'Экономика': 'https://news.mail.ru/rss/economics/',
        'Общество': 'https://news.mail.ru/rss/society/',
        'События': 'https://news.mail.ru/rss/incident/',
    }
};

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', `${__dirname}/views`);

app.use(bodyParser());

// Расшарить папку статики
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => { // На GET запрос, вывести форму
    // Форме передается объект с сервисами и категориями
    res.render('form', {
        servises: newsServises
    });
});

app.post('/', (req, res) => {
    const feedparser = new FeedParser();
    // Запись значений переданных из формы
    let userServise = req.body['servise'];
    let userCategory = req.body['category'];
    let userAmount = req.body['amount'];
    // Окончательная ссылка для получения новостей
    let resultUrl = newsServises[userServise][userCategory];
    // Массив для сбора новостей
    const newsArr = [];
    const reqResult = request(resultUrl);
    reqResult.on('error', function () {
        throw new Error('request Error');
    });
    reqResult.on('response', function (res) {
        var stream = this;

        if (res.statusCode !== 200) {
            this.emit('error', new Error('Bad status code'));
        }
        else {
            stream.pipe(feedparser);
        }
    });
    feedparser.on('error', function () {
        throw new Error('Feedparser Error');
    });

    // После получения xml, вызывается событие readable на каждый item(новость).
    feedparser.on('readable', function () {
        const stream = this;
        const meta = this.meta;
        let item = {};

        if(item = stream.read()) { // Если новости есть
            // Если категория не указана, то кидаем в массив
            if(!item.categories[0]) {
                newsArr.push({'title': item.title, 'description': item.description, 'link': item.link, 'date': item.pubdate.toLocaleDateString(), 'category': userCategory});
            } else if(item.categories[0].toLowerCase().indexOf(userCategory.toLowerCase())  != -1) { // Иначе если категория указана и частично(для mail.ru) или полностью совпадает, кидаем в массив.
                newsArr.push({'title': item.title, 'description': item.description, 'link': item.link, 'date': item.pubdate.toLocaleDateString(), 'category': item.categories});
            }
        }
        else { // Если новости закончились
            // Укоротить массив, если он длинее переданного значения из формы
            if(newsArr.length > userAmount) {
                newsArr.splice(userAmount, 999);
            }
            // Выводим страницу для новостей и передаем ей сами новости
            res.render('news', {
                news: newsArr,
                title: userCategory,
                servise: userServise
            });
        }
    });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
