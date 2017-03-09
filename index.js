const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const templating = require('consolidate');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const app = express();
const port = process.env.PORT || 8082;

app.use('/static', express.static(path.join(__dirname, 'public')));
app.engine('pug', templating.pug);
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// const urlencodedParser = bodyParser.urlencoded({ extended: false });
// const jsonParser = bodyParser.json();
// const textParser = bodyParser.text({ type: 'text/html' });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('12345'));
app.use(session({keys: ['secret']}));
app.use(passport.initialize());
app.use(passport.session());

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

passport.serializeUser(function(user, done) {
    console.log('serialize', user);
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log('deserialize', user);
    done(null, user);
});

// const auth = passport.authenticate('local', {
//     successRedirect: '/user',
//     failureRedirect: '/login'
// });

const mustBeAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.all('/user', mustBeAuthenticated);
app.all('/user/*', mustBeAuthenticated);

app.get('/login', (req, res) => {
    res.render('login-form');
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.post('/login', passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/login'}
    ));

// app.post('/login', (req, res) => {
    
//     console.log(req.body);
//     // res.json(req.body);
//     res.send(req.body.username);
// });

// app.use((req, res, next) => {
//     if(req.url !== '/favicon.ico' && req.url !== '/humans.txt' && req.url !== '/robots.txt') {
        
//         let count = req.session.count || 0;
//         req.session.count = ++count;
//     // res.cookie('name', 'aleksandr', {maxAge: 900000, httpOnly: true});
//     // res.clearCookie('name');
//         console.log('middleware', req.url);
//         delete req.session.count;
//         res.end(`views: ${count}`);
        
//     }
//     // res.json(req.cookies);
//     next();
// });

app.get('/', (req, res) => {
    console.log('Cookies: ', req.cookies);
    res.end('hello');
    // req.end();
});

app.listen(port, () => {
    console.log(`Server run and listen port ${port}`);
});