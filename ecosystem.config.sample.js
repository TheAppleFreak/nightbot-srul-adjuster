module.exports = {
    apps: [{
        name: "glitch_lasagna",
        script: "./build/index.js",
        env: {
            NGROK_AUTHTOKEN: "", 
            NGROK_SUBDOMAIN: "",
            GLITCH_LASAGNA_TWITCH_ACCESS_TOKEN: "",
            GLITCH_LASAGNA_TWITCH_USERNAME: "",
            GLITCH_LASAGNA_TWITCH_CHANNEL: "#",
            GLITCH_LASAGNA_NB_CLIENT_ID: "",
            GLITCH_LASAGNA_NB_CLIENT_SECRET: "",
            GLITCH_LASAGNA_NB_REDIRECT_URI: ""
        }
    }]
}