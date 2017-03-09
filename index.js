const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const templating = require('consolidate');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const path = require('path');

const app = express();
const port = process.env.PORT || 8082;

// Статика
app.use('/static', express.static(path.join(__dirname, 'public')));

// Вьюхи на pug'e
app.engine('pug', templating.pug);
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('12345'));
app.use(session({keys: ['secret']}));
app.use(passport.initialize());
app.use(passport.session());

// Локальная авторизация
passport.use(
    new LocalStrategy(
        (username, password, done) => {
            console.log('strategy username', username);
            if(username != 'admin') {
                return done(null, false);
            }
            console.log('strategy password', password);
            if(password != 'admin') {
                return done(null, false);
            }

            return done(null, {username: 'admin'});
        }
    )
);

// Авторизация через twitter
passport.use(new TwitterStrategy({
    consumerKey: 'yarVtG49RyOQaknT93n8fSuNT',
    consumerSecret: 'TOWoMCz0OzV00UmgRjKoPkaCIYa7pconfVf0W6A1RhyiNGWJu1',
    callbackURL: 'http://localhost:8082/success'
    },
    function(token, tokenSecret, profile, done) {
        console.log('tokenSecret', tokenSecret);
        console.log('token', token);
        console.log('profile', profile);
        done(null, 'success');
    }
));

// Восстановление авторизации по сессии
passport.serializeUser(function(user, done) {
    console.log('serialize', user);
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    console.log('deserialize', user);
    done(null, user);
});

const mustBeAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.all('/user', mustBeAuthenticated);
app.all('/user/*', mustBeAuthenticated);

// Форма авторизации
app.get('/login', (req, res) => {
    res.render('login-form');
});

// Выход
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// При POST запросе на роут, попробовать авторизоваться
app.post('/login', passport.authenticate('local', { 
    successRedirect: '/user',
    failureRedirect: '/login'
}
));

// При GET запросе на роут, запускается приложение twitter'a для авторизации
app.get('/twitter', passport.authenticate('twitter'));
app.get('/success',
  passport.authenticate('twitter', { 
      successRedirect: '/user',
      failureRedirect: '/login' }));

app.get('/', (req, res) => {
    res.end('hello');
});

app.listen(port, () => {
    console.log(`Server run and listen port ${port}`);
});