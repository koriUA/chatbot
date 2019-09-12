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

app.post('/webhook/', function(req, res) {
   let messaging_events = req.body.entry[0].messaging;
   for (let i = 0; i < messaging_events.length; i++) {
       let event = messaging_events[i];
       let sender = event.sender.id;
       if (event.message && event.message.text) {
           let text = event.message.text;
           sendText(sender, "Text echo: " + text.subscting(0, 100));
       }
   }
});

const access_token = "EAAJo2B7RWcYBAAiTKNgeCZBQyDNgUzo1AZB4P1jfbUkvs0K8xj48bJoOVM7OfHaFRv0SogRsqh5yIWUDjVOxMsDBOf7RDV2XQTxbEyqZAnr8bxuyJAGgVFggogFD6ByoePtKYjtb1m0Qmae4ROby5E4bPuPvnqmx7nEdHcGoAZDZD";

function sendText(sender, text) {
    let messageData = {text: text};
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log("sending error");
        } else if (response.body.error) {
            console.log("response body error");
        }
    });
}

app.listen(app.get('port'), function() {
    console.log('running: port', app.get('port'));
});




