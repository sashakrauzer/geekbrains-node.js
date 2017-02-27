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
        'sport': 'https://news.yandex.ru/sport.rss',
        'science': 'https://news.yandex.ru/science.rss',
        'world': 'https://news.yandex.ru/world.rss',
        'music': 'https://news.yandex.ru/music.rss',
        'auto': 'https://news.yandex.ru/auto.rss',
    },
    'lenta': {
        'Спорт': '1',
        'Наука и техника': '1',
        'Культура': '1',
        'Путешествия': '',
        'Бывшый СССР': '',
    },
    'vesti': {
        'url': 'https://www.vesti.ru/vesti.rss',
        'Политика': '',
        'В мире': '',
        'Происшествия': '',
        'Спорт': '',
        'Hi-Tech. Интернет': '',
    },
    'cnn': {
        'sport': '',
        'science': '',
        'world': '',
        'health': '',
        'auto': '',
    },
    'bbc': {
        'sport': '',
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
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.render('form', {
        title: 'Заполните форму'
    });
});

app.post('/', (req, res) => {
    const reqResult = request('http://feeds.bbci.co.uk/news/rss.xml');
    reqResult.on('error', function () {
        // handle any request errors
    });
    console.dir(req.body);
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
        let item = '';
        // while (item = stream.read()) {
        //     console.log(item);
        // }
        let obj = stream.read();

        // console.log(obj.title);
        // console.log(obj.description);
        // console.log(obj.link);
        // console.log(obj.author);
        // console.log(obj.categories);
        // console.log(obj.image);
    });
    res.render('news', {
        people: [
            {firstName: 'Yehuda', lastName: 'Katz'},
            {firstName: 'Alan', lastName: 'Johnson'}
        ]
    });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
