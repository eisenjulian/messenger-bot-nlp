const http = require('http');
const Bot = require('messenger-bot');
const {Client} = require('pg');

const UNK = 'UNK';

const onMessage = ({sender, intent, entities, text, reply}) => {
    // Add some code here
    reply({ text }, (err) => {
        if (err) throw err
        console.log(`Echoed back to ${sender.first_name} ${sender.last_name}: ${text}`)
    });
};

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
                            reply
                        });
                    } else if (event == 'message') {
                        if (payload.message.quick_reply) {
                            onMessage({
                                sender, 
                                intent: payload.message.quick_reply.payload, 
                                entities: {}, 
                                text: payload.message.text, 
                                reply
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
                                reply
                            });
                        } else if (payload.attachments) {
                            const attachment = payload.attachments[0];
                            onAttachment({
                                sender,
                                type: attachment.type,
                                payload: attachment.payload,
                                reply
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

http.createServer(bot.middleware()).listen(process.env.PORT || 3000)
console.log('Echo bot server running at port 3000.')