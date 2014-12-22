var express = require('express'),
    app = express(),
    express_session = require('express-session'),
    bodyParser = require('body-parser'),
    phone = require('phone'),
    nodemailer = require('nodemailer'),
    config = require('config'),
    mysql = require('mysql'),
    crypto = require('crypto');

app.use(express_session({secret: 'idk what this is'}));
var session = {};

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : config.get('database-user'),
    password : config.get('database-pass')
});

app.set('views', 'views')
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var extensions = {
    verizon: '@vzwpix.com',
    sprint: '@pm.sprint.com',
    att: '@mms.att.net',
    tmobile: '@tmomail.net'
};

var transporter = nodemailer.createTransport({
    service: config.get('service'),
    auth: {
        user: config.get('email'),
        pass: config.get('password')
    }
});

app.get('(/|/home/?)', function(req, res) {
    res.render('index', {nav: 0});
});

app.get('/about/?', function(req, res) {
    res.render('about', {nav: 1});
});

app.get('/login/?', function(req, res) {
    res.render('login', {nav: 2});
});

app.get('/success/?', function(req, res) {
    res.render('success', {nav: -1});
});

app.get('/dashboard/?', function(req, res) {
    session = req.session;
    if(session.hasOwnProperty('username')) {
        var users = [],
            facts = [];
        connection.query("SELECT * FROM catfacts.users;", function(err, rows) {
            users = rows;
            connection.query("SELECT * FROM catfacts.facts;", function(err, rows) {
                facts = rows;
                    res.render('dashboard', {users: users, facts: facts});
            });
        });
    } else {
        res.render('error', {code: 403});
    }
})

app.get('/logout/?', function(req, res) {
    session = {};
    res.redirect('/home/');
})

app.post('/session/?', function(req, res) {
    if(session.hasOwnProperty('username')) {
        res.send('1');
    } else {
        res.send('0');
    }
});

app.post('/unsubscribe/?', function(req, res) {
    if(session.hasOwnProperty('username')) {
        connection.query('DELETE FROM catfacts.users WHERE id=' + connection.escape(req.body.id) + ';', function(err, rows) {});
        res.redirect('/dashboard/');
    }
});

app.post('/remove-fact/?', function(req, res) {
    if(session.hasOwnProperty('username')) {
        connection.query('DELETE FROM catfacts.facts WHERE id=' + connection.escape(req.body.id) + ';', function(err, rows) {});
        res.redirect('/dashboard/');
    }
});

app.post('/new-fact/?', function(req, res) {
    connection.query('INSERT INTO catfacts.facts (`id`, `fact`) VALUES (NULL, ' + connection.escape(req.body.fact) + ');', function(err, rows) {});
    res.redirect('/dashboard/');
});

app.post('/register/?', function(req, res) {
    var number = phone(req.body.number, 'USA')[0];
    var carrier = req.body.carrier;
    number = number.slice(2, number.length);
    transporter.sendMail({
        from: config.get('email'),
        to: (number + extensions[carrier]),
        subject: '',
        text: 'Welcome to catfacts! Have fun learning :)'
    });
    
    connection.query("INSERT INTO `catfacts`.`users` (`id`, `phone`) VALUES (NULL, " + connection.escape(number + extensions[carrier]) + ");", function(err, rows) {});
    
    res.redirect('/success/');
});

app.post('/login/?', function(req, res) {
    session = req.session;
    var username = req.body.username;
    var hashword = crypto.createHash('sha512').update(req.body.password).digest("hex");
    connection.query("SELECT * FROM catfacts.admins", function(err, rows) {
        var i = 0;
        rows.forEach(function(ele, i, arr) {
            if(ele.username == username && ele.password == hashword) {
                session.username = username;
                res.redirect('/dashboard/');
            } else {
                i += 1;
            }
        });
        if(i == rows.length) {
            res.redirect('/login/');
        }
    });
});

app.get('*', function(req, res) {
    res.render('error', {code: 404});
});

app.listen(80);