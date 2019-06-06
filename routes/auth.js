const Router = require('express').Router()
const ifUserNotLoggedIn = require('../middlewares/ifUserNotLoggedIn')
const ifUserLoggedIn = require('../middlewares/ifUserLoggedIn')
const passport = require('passport')

const {
    createUser,
    loginUser,
    logoutUser,
    activateAccount,
    passwordResetRequest,
    resetPassword,
} = require('../controllers/authController')

Router.get('/login', ifUserNotLoggedIn, (req, res) => {
    res.render('auth/login', { title: 'Login' })
})
Router.get('/register', ifUserNotLoggedIn, (req, res) => {
    res.render('auth/register', { title: 'Register' })
})
Router.get('/setting', ifUserLoggedIn, (req, res) => {
    res.render('auth/setting', { title: 'Update Profile' })
})

/**
 * Post methods
 */
Router.post('/register', createUser)
Router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true,
    })(req, res, next)
})
Router.get('/logout', logoutUser)
Router.get('/activateAccount', activateAccount)

// View of password reset request
Router.get('/forget-password', (req, res) => {
    res.render('auth/forget-password', { title: 'Password reset Request' })
})
// store and send reset mail
Router.post('/forget-password', passwordResetRequest)

// Come back from mail with token
Router.get('/password-reset', (req, res) => {
    res.render('auth/change-password', {
        title: 'Change Your password',
        token: req.query.token,
    })
})

Router.post('/change-password', resetPassword)

/**
 * OAuth Authentications
 */

// Github
Router.get('/github', (req, res, next) => {
    passport.authenticate('github', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true,
    })(req, res, next)
})
//
Router.get('/redirect/github', passport.authenticate('github'), (req, res) => {
    res.send('Githb')
})

module.exports = Router
