"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const moment = require("moment");
const ngrok = require("ngrok");
const qs = require("qs");
const request = require("request-promise-native");
const schedule = require("node-schedule");
const twitch_js_1 = require("twitch-js");
const { api, chat, chatConstants } = new twitch_js_1.default({
    token: process.env.GLITCH_LASAGNA_TWITCH_ACCESS_TOKEN,
    username: process.env.GLITCH_LASAGNA_TWITCH_USERNAME
});
let timeout;
chat.on(`PRIVMSG/${process.env.GLITCH_LASAGNA_TWITCH_CHANNEL}`, async (msg) => {
    const username = msg.username.toLowerCase();
    if (!msg.isSelf && (msg.tags.mod === "1" || msg.tags.badges.broadcaster) && (username !== "nightbot" || username !== "streamlabs" || username !== "streamelements")) {
        const message = msg.message.trim().toLowerCase();
        if (message.startsWith("!opensongrequests") || message.startsWith("!opensr") || message.startsWith("!opensrs")) {
            try {
                await setAllUsers();
                chat.say(process.env.GLITCH_LASAGNA_TWITCH_CHANNEL, `@${msg.tags.displayName != "" ? msg.tags.displayName : msg.username}: All users can submit song requests for the next 15 minutes, up until ${moment().add(15, "m").format("h:mm A")} EST.`);
            }
            catch (err) {
                chat.say(process.env.GLITCH_LASAGNA_TWITCH_CHANNEL, `@${msg.tags.displayName != "" ? msg.tags.displayName : msg.username}: Error setting song request userlevel to "everyone". Contact @TheAaplFreak to get this fixed.`);
            }
        }
        else if (message.startsWith("!closesongrequests") || message.startsWith("!closesr") || message.startsWith("!closesrs")) {
            try {
                await setSubscriberOnly();
            }
            catch (err) {
                // idk
            }
        }
    }
});
async function setAllUsers() {
    let res = await request({
        method: "PUT",
        uri: "https://api.nightbot.tv/1/song_requests",
        body: {
            userLevel: "everyone"
        },
        headers: {
            Authorization: `Bearer ${tokens.access}`
        },
        json: true
    });
    if (timeout !== undefined)
        timeout.cancel(false);
    timeout = schedule.scheduleJob(moment().add(15, "m").toDate(), setSubscriberOnly);
    return res;
}
async function setSubscriberOnly() {
    let res = await request({
        method: "PUT",
        uri: "https://api.nightbot.tv/1/song_requests",
        body: {
            userLevel: "subscriber"
        },
        headers: {
            Authorization: `Bearer ${tokens.access}`
        },
        json: true
    });
    if (timeout !== undefined)
        timeout.cancel(false);
    chat.say(process.env.GLITCH_LASAGNA_TWITCH_CHANNEL, "Song request user level adjusted. You now must be a subscriber to request songs.");
}
async function refreshAccessToken() {
    let response = await request({
        method: "POST",
        uri: "https://api.nightbot.tv/oauth2/token",
        form: {
            client_id: process.env.GLITCH_LASAGNA_NB_CLIENT_ID,
            client_secret: process.env.GLITCH_LASAGNA_NB_CLIENT_SECRET,
            refresh_token: tokens.refresh,
            grant_type: "refresh_token",
            redirect_uri: process.env.GLITCH_LASAGNA_NB_REDIRECT_URI
        }
    });
    tokens.access = response.access_token;
    tokens.refresh = response.refresh_token;
}
const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
const tokens = {
    access: undefined,
    refresh: undefined
};
server.use("/auth/callback", (req, res) => {
    if (req.query.error)
        throw new Error("Something went wrong:" + req.query.error);
    if (tokens.access !== undefined) {
        res.send("Already authorized application");
        return;
    }
    request({
        method: "POST",
        uri: "https://api.nightbot.tv/oauth2/token",
        form: {
            client_id: process.env.GLITCH_LASAGNA_NB_CLIENT_ID,
            client_secret: process.env.GLITCH_LASAGNA_NB_CLIENT_SECRET,
            code: req.query.code,
            grant_type: "authorization_code",
            redirect_uri: process.env.GLITCH_LASAGNA_NB_REDIRECT_URI
        },
        json: true
    }).then(response => {
        tokens.access = response.access_token;
        tokens.refresh = response.refresh_token;
        setInterval(refreshAccessToken, Math.pow(2,31)-1);
        console.log("Application authorized.");
        res.send("Application authorized.");
    });
});
server.listen(3000, async () => {
    await chat.connect();
    await chat.join(process.env.GLITCH_LASAGNA_TWITCH_CHANNEL);
    await ngrok.connect({
        authtoken: process.env.NGROK_AUTHTOKEN,
        addr: 3000,
        subdomain: process.env.NGROK_SUBDOMAIN
    });
    console.log("Listening on port 3000");
    console.log(`https://api.nightbot.tv/oauth2/authorize?${qs.stringify({
        client_id: process.env.GLITCH_LASAGNA_NB_CLIENT_ID,
        redirect_uri: process.env.GLITCH_LASAGNA_NB_REDIRECT_URI,
        response_type: "code",
        scope: "song_requests"
    })}`);
});
