const Router = require('express').Router()
const ifUserLoggedIn = require('../middlewares/ifUserLoggedIn')

Router.get('/', ifUserLoggedIn, (req, res) => {
    res.render('index', { title: 'Home' })
})

module.exports = Router
