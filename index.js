var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    phone = require('phone');

app.set('views', 'views')
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.render('index', {});
});

app.get('/success', function(req, res) {
    res.render('index');
});

app.post('/register', function(req, res) {
    var number = phone(req.body.number, 'USA')[0];
    number = number.slice(2, number.length);
    res.redirect('/success');
});

app.get('*', function(req, res) {
    res.render('error', {code: 404});
});

app.listen(80);