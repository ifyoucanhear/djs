# bot

open-source bot made with the intents of demonstrating the capabilities of [discord.js](https://github.com/ifyoucanhear/djs)

## set up

the easiest setup would be to clone the discord.js repo, and then open a terminal/cmd in this directory and run `node bot.js`

if you don't want to clone the repo but instead just use this folder, you need to edit `bot.js` to use `require("djs")` as opposed to `require("../")`. cloned directories will always be using the latest **djs**

## setting up credentials

create `config.json` to use your discord email and password, and then run `node bot.js`

what `config.json` should look like:

```json
{
    "email": "test@test.com",
    "password": "password123456"
}
```
