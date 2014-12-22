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

connection.query("SELECT * FROM catfacts.users;", function(uerr, urows) {
    users = urows;
    connection.query("SELECT * FROM catfacts.facts;", function(ferr, frows) {
        facts = frows;
        new CronJob('0 * * * *', function(){
            users.forEach(function(value, i, array) {
                transporter.sendMail({
                    from: config.get('email'),
                    to: value.phone,
                    subject: '',
                    text: facts[Math.floor(Math.random()*facts.length)].fact
                });
            });
        }, null, true);
    });
});