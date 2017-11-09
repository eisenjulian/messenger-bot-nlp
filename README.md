# Messenger Bot with built-in NLP
A Facebook Messenger bot sample integrated with built-in NLP from wit.ai fully deployable to Heroku

## Before we start

 * Install [Node.js](https://nodejs.org/en/download/)
 * A [github](https://github.com/join?source=login) account
 * Create an free account and install [Heroku Command Line](https://devcenter.heroku.com/articles/heroku-cli)
 * Make sure you have a [Facebook App](https://developers.facebook.com/apps) account that is not currently using webhooks
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
 * You are ready to go! Tap deploy button and you will need to enter the **App ID** and **App Secret** from you Facebook App that can be found and in the **Dasboard** tab. You will also need a **Verification Token**, but that can be any string you want.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

 * One last thing, now that you have a *node.js* webserver in production we need to tell Facebook where to forward all incoming messages to  your bot. Go to the **Webhooks** section on your Facebook app and click on *Edit Subscription*. You can get the Callbacck URL from Heroku in the Open App button, it should be `https://<APP_ID>.herokuapp.com/`. The Verify Token is the one you entered in the previous step
 * Talk to your page, it should reply
 * Now it's your turn to give it some personality.

## Adding NLP

## Running locally

## Review process
