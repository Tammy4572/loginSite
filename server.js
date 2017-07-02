const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mustache = require('mustache-express');
const expressValidator = require('express-validator');
var session = require('express-session');

var application = express();
application.engine('mustache', mustache());

application.set('views', './views');
application.set('view engine', 'mustache');

var users = [{ 
    username: 'admin', 
    email: 'example@example.com', 
    password: 'secret123'
}];

application.use(cookieParser());
application.use(bodyParser.urlencoded());
application.use('/public', express.static('./public'));
application.use(session({
    secret: 'secretsession123',
    resave: false,
    saveUninitialized: true
    // cookie: { secure: true }
}));

application.get('/', (request,response) => {
    if (request.session.isAuthenticated != true) {
        response.render('index');
    } else {
        response.redirect('dashboard');
    }
});

application.get('/login', (request, response) => {
    response.render('login');
});

application.get('/signup', (request, response) => {
    response.render('signup');
});

application.post('/signup', (request, response) => {
    var user = { 
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        views: 0,
        isAuthenticated: true
    }
    users.push(user);
    request.session.name = request.body.name;
    request.session.email = request.body.email;
    request.session.views = 1;
    request.session.isAuthenticated = true;

    response.redirect('dashboard');
});

application.post('/login', (request, response) => {
    var user = users.find(user => {return user.email === request.body.email && user.password === request.body.password});
    if (user) {
        request.session.isAuthenticated = true;
        request.session.name = user.name;
        request.session.email = user.email;
        request.session.views = 1;

        response.redirect('dashboard');
    } else { 
        response.render('login', user);
    }
});

application.get('/dashboard', (request, response) => {
    if (request.session.isAuthenticated === false) {
        response.redirect('login');
    } else {
        var user = {
            name: request.session.name, 
            views: request.session.views++
        }
        response.render('dashboard', user);
    }
});

application.post('/logout', (request, response) => {
    request.session.destroy(function(err){

    });
    response.render('login');
});

application.listen(3000);