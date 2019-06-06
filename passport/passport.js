const passport = require('passport')
const PassportLocal = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const User = require('../models/User')
passport.use(
    new PassportLocal(async (username, password, done) => {
        const user = await User.findOne({ username })

        if (!user) return done(null, false, { message: 'User not found' })
        else if (user.activationToken) {
            return done(null, false, {
                message: 'Your account is not activated yet',
            })
        } else if (bcrypt.compareSync(password, user.password)) {
            done(null, user)
        } else {
            return done(null, false, {
                message: 'Password did not matched',
            })
        }
    })
)

// require('./github')
require('./facebook')

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    done(null, user)
})
