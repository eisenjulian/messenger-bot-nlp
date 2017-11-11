'use strict'
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const httpRequest = require('request');
const Bot = require('messenger-bot');
const {Client} = require('pg');

const UNK = 'UNK';

/**
 * Main method to hanldle incoming messages
 * `sender` object contians all info saved for this user. If changed, changes will be persisted
 * `intent` is the main recognized intention, or `UNK` if unknown
 * `entities` are all the recognized entities with their scores
 * `text` is the original written input by the user
 * `reply` is a handler to send messages to the user
 * Docs: https://developers.facebook.com/docs/messenger-platform/send-messages
 */
const onMessage = ({sender, intent, entities, text, reply}) => {
    
    // Replace the code here
    reply([
        {
            attachment: {
                type: 'image', 
                payload: {url: 'https://i.giphy.com/media/3ohs7IpuSdt3xWYmQM/200.gif'}
            }
        },
        {
            text, 
            quick_replies: [
            {
                content_type: 'text',
                title: '¿?',
                payload: 'SOME_INTENT'
            },
            {
                content_type: 'text',
                title: '#2',
                payload: 'SOME_OTHER_INTENT'
            }
        ]}
    ]);

    console.log(`Echoed back to ${sender.first_name} ${sender.last_name}: ${text}`);
};

/**
 * Main method to hanldle incoming messages
 * `sender` object contians all info saved for this user. If changed, changes will be persisted
 * `type` is the kind of attachment. Possible values are audio, file, image, location or video
 * `payload` is the attachment data, has `url` field for media, or `coordinates` for location
 */
const onAttachment = ({sender, type, payload, reply}) => {
    // And some more code here
};

const client = new Client({connectionString: process.env.DATABASE_URL, ssl: true});
client.connect();
// client.query(
//     'CREATE TABLE IF NOT EXISTS users (id VARCHAR(50) PRIMARY KEY, data JSONB);', 
//     (err, res) => {
//         if (err) throw err;
//         console.log(res);
//     }
// );

const bot = new Bot({
    token: process.env.MESSENGER_PAGE_ACCESS_TOKEN,
    verify: process.env.MESSENGER_VALIDATION_TOKEN,
    app_secret: process.env.MESSENGER_APP_SECRET
});

(['message', 'postback']).map(event => {
    bot.on(event, (payload, reply, actions) => {
        const replyWithDelay = (messages, callback) => {
            if (messages.length == 0) return;
            actions.setTyping(true);
            setTimeout(() => reply(messages[0], (err) => {
                if (err) throw err;
                messages.shift();
                if (messages.size == 0 && callback) callback(err);
                replyWithDelay(messages);
            }), 600);
        };
        bot.getProfile(payload.sender.id, (err, profile) => {
            if (err) throw err;
            client.query(
                'SELECT data FROM users WHERE id = $1;',
                [payload.sender.id],
                (err, res) => {
                    if (err) throw err;
                    const sender = Object.assign((res.rows[0] || {}).data || {}, profile);
                    if (event == 'postback') {
                        onMessage({
                            sender, 
                            intent: payload.postback.payload, 
                            entities: {}, 
                            text: payload.postback.title, 
                            reply: replyWithDelay
                        });
                    } else if (event == 'message') {
                        if (payload.message.quick_reply) {
                            onMessage({
                                sender, 
                                intent: payload.message.quick_reply.payload, 
                                entities: {}, 
                                text: payload.message.text, 
                                reply: replyWithDelay
                            });
                        } else if (payload.message.text) {
                            const entities = (payload.message.nlp || {}).entities || {};
                            console.log('entities', entities);
                            const firstIntent = (entities.intent || [])[0];
                            const intent = firstIntent && 
                                firstIntent.confidence > 0.8 && 
                                firstIntent.value || UNK;
                            onMessage({
                                sender, 
                                intent, 
                                entities, 
                                text: payload.message.text, 
                                reply: replyWithDelay
                            });
                        } else if (payload.attachments) {
                            const attachment = payload.attachments[0];
                            onAttachment({
                                sender,
                                type: attachment.type,
                                payload: attachment.payload,
                                reply: replyWithDelay
                            });
                        }
                    }

                    console.log('Will update user data', sender);
                    client.query(
                        'INSERT INTO users (id, data) VALUES ($1, $2)\n' +
                        'ON CONFLICT (id) DO UPDATE SET data = $2', 
                        [sender.id, sender],
                        (err, res) => {
                            if (err) throw err;
                            console.log('Done saving!');
                        }
                    );
                }
            );
        });
    });
});

bot.on('error', (err) => {
    console.log(err.message)
});

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const URL = 'https://graph.facebook.com/v2.11/me?fields=id&access_token=' + process.env.MESSENGER_PAGE_ACCESS_TOKEN;
app.get('/', (req, res) => {
    httpRequest(URL, (error, response, body) => {
        const page = JSON.parse(body);
        res.end(`<div>
            <h1>Hello World!</h1>
            <ul>
                <li>Go chat at <a href="https://m.me/${page.id}" target="_blank">m.me/${page.id}</a></li>
                <li>Webhook URL: https://${req.headers.host}/webhook</li>
                <li>Verify token: ${process.env.MESSENGER_VALIDATION_TOKEN}</li>
            <ul/>
        </div>`);
    });
});

app.get('/webhook', (req, res) => {
    return bot._verify(req, res);
});

app.post('/webhook', (req, res) => {
    bot._handleMessage(req.body);
    res.end(JSON.stringify({status: 'ok'}));
});

http.createServer(app).listen(process.env.PORT || 3000);
console.log('Echo bot server running at port ' + (process.env.PORT || 3000));