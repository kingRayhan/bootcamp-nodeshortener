const mongoose = require('mongoose')
require('colors')

mongoose
    .connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(res => {
        console.log('Database connected'.green)
    })
    .catch(e => {
        console.log('can not connect to database'.red)
    })
