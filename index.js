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

app.get('/', function (req, res) {
    res.send('Hi I am a chatbot...');
});

app.get('/privacy-policy', function (req, res) {
    res.render('index.html', {req});
});

app.get('/test', function (req, res) {
    res.render('test.html', {req});
});

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'blondiebytes') {
        res.status(200).send(req.query['hub.challenge']);
    }
    res.send('Wrong token...');
});

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i];
        let sender = event.sender.id;
        if (event.message && event.message.text) {
            let text = event.message.text;
            sendText(sender, "Text echo: " + text.substring(0, 100));
        }
    }
    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
});

const access_token = "EAAJo2B7RWcYBAACxZBdxb5nUKtV04ulydX5WUwPpJ8aYHW7zK3Hs09nmc1EhmvMMUxsHKcdn5ge95xwIM0I2RXYnQZBQUdDQPqiRvxowRZBNoPQOAAQjlRWwUMo7PnAwq24TzY4qOAxUg0IJafrAYF664hFz7dG8gZBSpA3MYKrXo7Xi0arK";

function sendText(sender, text) {
    let messageData = {text: text};
    if (text.includes('options')) {
        return getMessageTemplate(sender, text);
    }
    request({
        url: "https://graph.facebook.com/v4.0/me/messages",
        qs: {access_token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log("error");
        } else if (response.body.error) {
            console.log("response body error");
        }
    });
}

app.listen(app.get('port'), function () {
    console.log('running: port', app.get('port'));
});

function getTemplate() {
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Welcome!",
                        "image_url": "https://petersfancybrownhats.com/company_image.png",
                        "subtitle": "We have the right hat for everyone.",
                        "default_action": {
                            "type": "web_url",
                            "url": "https://petersfancybrownhats.com/view?item=103",
                            "webview_height_ratio": "tall",
                        },
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://petersfancybrownhats.com",
                                "title": "View Website"
                            }, {
                                "type": "postback",
                                "title": "Start Chatting",
                                "payload": "DEVELOPER_DEFINED_PAYLOAD"
                            }
                        ]
                    }
                ]
            }
        }
    };
}

function getMessageTemplate(sender, text) {
    request({
        url: "https://graph.facebook.com/v4.0/me/messages",
        qs: {access_token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message: getTemplate()
        }
    }, function (error, response, body) {
        if (error) {
            console.log("error");
        } else if (response.body.error) {
            console.log("response body error");
        }
    });
}


// https://www.messenger.com/t/109134463806552
// heroku logs --tail --app chatbot432

