'use strict'
const {join} = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(join(__dirname, '/public'), {
    index: false   // to ignore index.html as a static file. We need it for server rendering;
}));

// Setting up template engines;
app.engine('html', require('ejs').renderFile);

// Configuring Express.js App Settings;
app.set('view engine', 'html');
app.set('views', join(__dirname, '/public'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Hi I am a chatbot...');
});

app.get('/privacy-policy', function(req, res) {
    res.render('index.html', { req });
});

app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === 'blondiebytes') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Wrong token...');
});

app.listen(app.get('port'), function() {
    console.log('running: port', app.get('port'));
});




