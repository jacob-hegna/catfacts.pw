var nodemailer = require('nodemailer'),
    config = require('config'),
    mysql = require('mysql'),
    CronJob = require('cron').CronJob;

var transporter = nodemailer.createTransport({
    service: config.get('service'),
    auth: {
        user: config.get('email'),
        pass: config.get('password')
    }
});

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : config.get('database-user'),
    password : config.get('database-pass')
});

var users = [],
    facts = [];

connection.query("SELECT * FROM catfacts.users;", function(err, rows) {
    users = rows;
});
connection.query("SELECT * FROM catfacts.facts;", function(err, rows) {
    facts = rows;
});

connection.end();

new CronJob('* * * * *', function(){
    users.forEach(function(value, i, array) {
        transporter.sendMail({
            from: config.get('email'),
            to: value.phone,
            subject: '',
            text: facts[Math.floor(Math.random()*facts.length)].fact
        });
    });
    console.log("sent");
}, null, true);