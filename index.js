var express = require('express'),
    app = express();

app.set('views', 'views')
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res) {
    res.render('index', {});
});

app.post('/register', function(req, res) {
    console.log(req);
});

app.get('*', function(req, res) {
    res.render('error', {code: 404});
});

app.listen(8080);