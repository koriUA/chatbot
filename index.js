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
    console.log('/privacy-policy...........................................................................................');
    res.render('index.html', { req });
});

app.get('/webhook/', function(req, res) {
    console.log('GET /webhook/...........................................................................................');
    if (req.query['hub.verify_token'] === 'blondiebytes') {
        res.send('ok 1..................................................................................................................................');
        res.send(req.query['hub.challenge']);
    }
    res.send('Wrong token...');
});

app.post('/webhook/', function(req, res) {
    console.log('POST /webhook/...........................................................................................');
   let messaging_events = req.body.entry[0].messaging;
   console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', messaging_events);
   for (let i = 0; i < messaging_events.length; i++) {
       let event = messaging_events[i];
       let sender = event.sender.id;
       if (event.message && event.message.text) {
           let text = event.message.text;
           console.log('message......................................', text);
           sendText(sender, "Text echo: " + text.substring(0, 100));
       }
   }
});

const access_token = "EAAJo2B7RWcYBAACxZBdxb5nUKtV04ulydX5WUwPpJ8aYHW7zK3Hs09nmc1EhmvMMUxsHKcdn5ge95xwIM0I2RXYnQZBQUdDQPqiRvxowRZBNoPQOAAQjlRWwUMo7PnAwq24TzY4qOAxUg0IJafrAYF664hFz7dG8gZBSpA3MYKrXo7Xi0arK";

function sendText(sender, text) {
    console.log('ok 2..................................................................................................................................');
    let messageData = {text: text};
    request({
        url: "https://graph.facebook.com/v4.0/me/messages",
        qs: {access_token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message: messageData,
            subscribed_fields: 'messages'
        }
    }, function(error, response, body) {
        console.log('bad 1..................................................................................................................................', error);
        if (error) {
            console.log("sending error");
        } else if (response.body.error) {
            res.send('bad 2..................................................................................................................................', response.body.error);
            console.log("response body error");
        }
    });
}

app.listen(app.get('port'), function() {
    console.log('running: port', app.get('port'));
});




