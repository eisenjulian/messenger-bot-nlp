const http = require('http')
const Bot = require('messenger-bot')

const bot = new Bot({
    token: process.env.MESSENGER_PAGE_ACCESS_TOKEN,
    verify: process.env.MESSENGER_VALIDATION_TOKEN,
    app_secret: process.env.MESSENGER_APP_SECRET
})

bot.on('error', (err) => {
    console.log(err.message)
})

bot.on('message', (payload, reply) => {
    console.log(payload.message.nlp.entities)
    let text = payload.message.text

    bot.getProfile(payload.sender.id, (err, profile) => {
        if (err) throw err

        reply({ text }, (err) => {
            if (err) throw err

            console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
        })
    })
})

http.createServer(bot.middleware()).listen(3000)
console.log('Echo bot server running at port 3000.')