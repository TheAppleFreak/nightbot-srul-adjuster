# nightbot-srul-adjuster
Adjust the userlevel required to submit song requests on Nightbot using a chat command. 

This code was developed for a single user's Twitch chat and as such is very, very hacky. It does the job, no doubt, but it's hacky.

# How to use

1. Run `yarn` or `npm install` to install the bot's dependencies. 
2. Build the project (if necessary) by running `./node_modules/.bin/tsc`. 
3. Rename `ecosystem.config.sample.js` to `ecosystem.config.js` and fill in the environment variables. Alternatively, fill in those variables in your shell.
4. Run `./node_modules/.bin/pm2 start ecosystem.config.js` to start the bot. Run `pm2 logs` to retrieve the Nightbot authorization URL; have the channel owner authenticate against this.
