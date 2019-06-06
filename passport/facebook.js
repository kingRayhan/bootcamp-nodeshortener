const passport = require('passport')
const FacebookAuth = require('passport-facebook').Strategy

passport.use(
    new FacebookAuth(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CLIENT_REDIRECT,
        },
        (accessToken, refreshToken, profile, done) => {
            console.log(profile)
        }
    )
)
