const passport = require('passport')
const GithubAuth = require('passport-github').Strategy

passport.use(
    new GithubAuth(
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
