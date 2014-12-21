var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    phone = require('phone'),
    nodemailer = require('nodemailer'),
    config = require('config'),
    mysql = require('mysql');

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
    sprint: '@pm.sprisnt.com',
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
    
    connection.query("INSERT INTO `catfacts`.`users` (`id`, `phone`) VALUES (NULL, " + connection.escape(number + extensions[carrier]) + ");", function(err, rows) {
        console.log(err);
    });
    
    res.redirect('/success/');
});

app.get('*', function(req, res) {
    res.render('error', {code: 404});
});

app.listen(80);