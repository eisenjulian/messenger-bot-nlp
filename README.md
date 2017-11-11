# Messenger Bot with built-in NLP
A Facebook Messenger bot sample integrated with built-in NLP from wit.ai fully deployable to Heroku

## Before we start

 * Install [Node.js](https://nodejs.org/en/download/)
 * A [github](https://github.com/join?source=login) account
 * Create a free account and install [Heroku Command Line](https://devcenter.heroku.com/articles/heroku-cli)
 * Make sure you have a [Facebook Developer App](https://developers.facebook.com/apps) that is not currently using webhooks
 * And a free [wit.ai](https://wit.ai/) account, it will do the NLP heavy lifting for free!
 
## Set-up

 * Fork this repository. Then when deploying to Heroku the code will stay synced with whatever changes you make on your copy
 * Create a [Facebook page](https://www.facebook.com/pages/create/) that will be the face of your bot
 * Create a [wit.ai app](https://wit.ai/apps/new) that will be its brain
 * Take note of your wit.ai **Server Access Token**. You can get it from the settings page
 * Now we are ready to configure your Facebook App. Open it at https://developers.facebook.com/apps/<APP_ID> and go to the **Messenger** tab
   * In the *Token Generation* section select your page and generate a token. This will allow our server to listen and reply to conversations
   * Find the *Webhooks* section and subscribe to all events. Then find and select your page and subscribe
   * In the *Built-In NLP* section, select your page, choose the *Custom* model, add you wit.ai **Server Access Token** previously retrieved and *Save*
 * You are ready to go! Tap deploy button and you will need to enter the **App ID** and **App Secret** from you Facebook App that can be found in the **Dasboard** tab. You will also need a **Verification Token**, but that can be any string you want.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

 * One last thing, now that you have a *node.js* webserver in production we need to tell Facebook where to forward all incoming messages to  your bot. Go to the **Webhooks** section on your Facebook app and click on *Edit Subscription*. You can get the Callbacck URL from Heroku in the Open App button, it should be `https://<APP_ID>.herokuapp.com/`. The Verify Token is the one you entered in the previous step
 * Talk to your page, it should reply
 * Now it's your turn to give it some personality.

## Adding NLP

A quick overview of **wit.ai** NLU engine: it transforms a text snippet into a list of entities, both built-in or custom defined. Entities come in 4 flavours. You can check [the docs](https://wit.ai/docs/recipes#which-entity-should-i-use) for more info.
 * *Keywords* are entities from a finite set of posibilites such as countries or vegetables
 * *Free-text* are specific parts of the sentence that we want to extract, like the message content to send, or the text snippet to translate
 * *Free-text & keywords* is of course a mixture of the last two, where we cannot anticipate all the possible values
 * *Traits* are labels that affect the whole sentence, not just a single part, like the sentiment or the intent of the phrase

In your wit.ai console, create a *trait* entity called *intent*. We will use that *trait* to store the main intentions the bot is expected to recognize, like *greetings*, *help* and your bot's particular expertise.

Try to come up with at least 10-20 samples for each intent, and as you type them assign the propper entities to extract. Most importantly, have other people test your bot and use the **Inbox** to learn from the examples.

## Running locally

Note than when you deply to Heroku a PostgreSQL database will be created that you will use when running locally as well. Do this once:
```
git clone https://github.com/<USER_ID>/messenger-bot-nlp.git
cd messenger-bot-nlp
# Clone the values in your heroku apps to your local machine
heroku config -s --app <HEROKU_APP_NAME> > .env
npm install
```
Do this every time to start a new webserver
```
heroku local web
```
and to expose the server to the world via **ngrok**
```
node_modules/ngrok/bin/ngrok http 3000
```
This will print a URL of the form `https://<SOME_CODE>.ngrok.io` that you should use to reconfigure your webhook to point to your local machine. When you are done make sure to reverse this to point back to your heroku app.


## Review process

Once you're happy with your bot you will want to show it to others, sadly you need Facebook's approval before letting your app out in the wild. The good thing is that you'll only need to this once.

First go the **App Review** and make sure to toggle your app state to **Public**.

In the **Roles** section on your app's dashboard you can add as many friends as you want as **test users**, who will be able to talk to your bot regardless of its approval status.

Finally, in the **Messenger** section you can create a new submission. You will only need the `pages_messaging` permission. Add the relevant details and click on **Submit for Review**. It should take only a few days to get approved.

Join the [Messenger Platform Developer Community](https://www.facebook.com/groups/messengerplatform/) to get help with anything Messenger Bot related.

Good luck!
