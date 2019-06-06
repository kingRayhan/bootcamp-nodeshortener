const express = require('express')
const app = express()
const flash = require('connect-flash')
const expressEjsLayouts = require('express-ejs-layouts')
const expressValodator = require('express-validator')
const session = require('express-session')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const fileupload = require('express-fileupload')

const morgan = require('morgan')
require('dotenv').config()

require('./passport/passport')

app.use(morgan('dev'))
app.use(
    fileupload({
        createParentPath: true,
    })
)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(expressEjsLayouts)
app.use(expressValodator())

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
)
app.use(cookieParser())

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

require('./dbconnection')

app.locals.appName = 'Node Shortener'

app.use(async (req, res, next) => {
    app.locals.errors = req.flash('errors')
    app.locals.error = req.flash('error')
    app.locals.success_msg = req.flash('success_msg')
    app.locals.isAuthenticated = req.isAuthenticated()
    app.locals.autenticatedUser = req.user
    next()
})

/**
 * Routes
 */
const authRoutes = require('./routes/auth')
const ShortenerRoutes = require('./routes/shortener')

app.use('/auth', authRoutes)
app.use('/', ShortenerRoutes)

// app.get('/get', (req, res) => {
//     res.json(req.user)
// })

app.listen(process.env.PORT, () => {
    console.log('server working http://localhost:' + process.env.PORT)
})
