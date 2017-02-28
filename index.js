const express = require('express');
const consolidate = require('consolidate');
const request = require('request');
const FeedParser = require('feedparser');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 8082;
const feedparser = new FeedParser();
const newsServises = {
    'yandex': {
        'Спорт': 'https://news.yandex.ru/sport.rss',
        'Наука': 'https://news.yandex.ru/science.rss',
        'В мире': 'https://news.yandex.ru/world.rss',
        'Музыка': 'https://news.yandex.ru/music.rss',
        'Авто': 'https://news.yandex.ru/auto.rss',
        'Интернет': 'https://news.yandex.ru/internet.rss',
        'Технологии': 'https://news.yandex.ru/computers.rss'
    },
    'lenta': {
        'Спорт': 'https://lenta.ru/rss/articles',
        'Наука и техника': 'https://lenta.ru/rss/articles',
        'Культура': 'https://lenta.ru/rss/articles',
        'Путешествия': 'https://lenta.ru/rss/articles',
        'Бывшый СССР': 'https://lenta.ru/rss/articles',
    },
    'vesti': {
        'Политика': 'http://www.vesti.ru/vesti.rss',
        'В мире': 'http://www.vesti.ru/vesti.rss',
        'Происшествия': 'http://www.vesti.ru/vesti.rss',
        'Спорт': 'http://www.vesti.ru/vesti.rss',
        'Hi-Tech. Интернет': 'http://www.vesti.ru/vesti.rss',
    },
    'cnn': {
        'sport': '',
        'science': '',
        'world': '',
        'health': '',
        'auto': '',
    },
    'bbc': {
        'sport': 'http://feeds.bbci.co.uk/news/rss.xml',
        'science': '',
        'world': '',
        'health': '',
        'auto': '',
    },
    'mailru': {
        'sport': '',
        'science': '',
        'world': '',
        'health': '',
        'auto': '',
    }
};

// Помошник для hbs
Handlebars.registerHelper('news', function(items, options) {
    let out = '<div>';

    for(let i=0, l=items.length; i<l; i++) {
        out = out + '<li>' + options.fn(items[i]) + '</li>';
    }

    return out + '</div>';
});

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', `${__dirname}/views`);

app.use(bodyParser());

// Расшарить папку статики
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.render('form', {
        servises: newsServises
    });
});

app.post('/', (req, res) => {
    let userServise = req.body['servise'];
    let userCategory = req.body['category'];
    let resultUrl = newsServises[userServise][userCategory];
    console.log(resultUrl);
    console.log(req.body);
    const newsArr = [];
    const reqResult = request(resultUrl);
    reqResult.on('error', function () {
        // handle any request errors
    });
    // console.dir();
    reqResult.on('response', function (res) {
        var stream = this; // `this` is `req`, which is a stream

        if (res.statusCode !== 200) {
            this.emit('error', new Error('Bad status code'));
        }
        else {
            stream.pipe(feedparser);
        }
    });
    feedparser.on('error', function () {
        // always handle errors
    });

    feedparser.on('readable', function () {
        // This is where the action is!
        const stream = this; // `this` is `feedparser`, which is a stream
        const meta = this.meta; // **NOTE** the 'meta' is always available in the context of the feedparser instance

        let item = {};
        // while (item = stream.read()) {
        //     console.log(item);
        // }
        // newsArr.push(obj);

        if(item = stream.read()) {
            // if(item.category) {

            // for(let prop in item) {
            //   console.log(prop);
            // }
            if(!item.categories[0]) {
                newsArr.push({'title': item.title, 'description': item.description, 'link': item.link, 'date': item.pubdate.toLocaleDateString()});
            } else if(item.categories[0].toLowerCase() === userCategory.toLowerCase()) {
                newsArr.push({'title': item.title, 'description': item.description, 'link': item.link, 'date': item.pubdate.toLocaleDateString()});
            }


        }
        else {
            // console.log(newsArr);
            res.render('news', {
                news: newsArr
            });
        }
        // console.log(obj.title);
        // console.log(obj.description);
        // console.log(obj.link);
        // console.log(obj.author);
        // console.log(obj.categories);
        // console.log(obj.image);
    });

});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
