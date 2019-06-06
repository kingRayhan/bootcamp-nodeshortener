const User = require('../models/User')
const { promisify } = require('util')
const { randomBytes } = require('crypto')
const bcrypt = require('bcryptjs')
const mail = require('../utils/mail')
const { isEmail } = require('validator')
module.exports.loginUser = async (req, res) => {
    // validation

    // username is required
    if (req.body.username.length === 0)
        req.check('username', 'Username is requred').custom(() => false)
    // Name should be atleaqst 3 character
    else {
        const fetchedUser = await User.findOne({
            username: req.body.username,
        })

        if (!fetchedUser)
            req.check('username', 'User not found').custom(() => false)

        if (fetchedUser) {
            const passwordMatched = bcrypt.compareSync(
                req.body.password,
                fetchedUser.password
            )

            if (passwordMatched) {
                req.session.authUserId = fetchedUser._id
                req.flash('success_msg', 'You have logged in successfully')
            } else {
                req.check('password', 'Wrong credentials').custom(() => false)
            }
        }
    }

    if (req.validationErrors()) req.flash('errors', req.validationErrors())

    res.redirect('back')
}

module.exports.logoutUser = (req, res) => {
    req.flash('success_msg', 'You have successfully logged out')
    req.logout()
    res.redirect('/auth/login')
}

module.exports.createUser = async (req, res) => {
    // name is required

    // username is required
    if (req.body.name.length === 0)
        req.check('name', 'Name is requred').custom(() => false)
    // Name should be atleaqst 3 character
    else
        req.check('name', 'Name should be atleaqst 3 character').isLength({
            min: 6,
        })

    // username required
    if (req.body.username.length === 0)
        req.check('username', 'Username is requred').custom(() => false)
    // username should be atleaqst 6 character
    else if (req.body.username.length >= 6) {
        // username should be unique
        const userNameExists = await User.findOne({
            username: req.body.username,
        })

        if (userNameExists)
            req.check(
                'username',
                `${req.body.username} has already taken`
            ).custom(() => false)
    } else
        req.check(
            'username',
            'Username should be atleaqst 6 character'
        ).isLength({
            min: 6,
        })
    // username should be unique
    const userNameExists = await User.findOne({
        username: req.body.username,
    })

    if (userNameExists)
        req.check('username', `${req.body.username} has already taken`).custom(
            () => false
        )

    // email is required
    if (req.body.email.length === 0)
        req.check('email', 'Email is required').custom(() => false)
    // email is is wrong format
    else req.check('email', 'Email is not valid').isEmail()

    const emailExits = await User.findOne({ email: req.body.email })
    console.log(emailExits)
    if (emailExits)
        req.check('email', 'Email is already taken').custom(() => false)

    // password is required

    if (req.body.password.length === 0)
        req.check('password', 'Password is required').custom(() => false)
    else if (req.body.password.length < 6)
        req.check('password', 'Password should be atleast 6 character').custom(
            () => false
        )

    req.check(
        'password',
        'Password did not matched with confirm password'
    ).equals(req.body.comfirm_password)
    // password should be atleast 6 character
    // password and confirm password should be matched

    /**
     * Upload Profile Photo
     */
    const allowed = ['jpeg', 'jpg', 'png', 'gif']
    const profilePhoto = req.files.profilePhoto
    const ext = profilePhoto.mimetype.split('/')[1]

    if (profilePhoto) {
        if (!allowed.includes(ext)) {
            req.check(
                'profilePhoto',
                'Only imaqge formot are allowed for profile photo'
            ).custom(() => false)
        } else if (profilePhoto.size > 1024 * 1024 * 3) {
            req.check(
                'profilePhotoSize',
                'Profile photo can not be more than 3mb in size'
            ).custom(() => false)
        }
    }

    if (!req.validationErrors()) {
        let { name, username, email, password } = req.body
        password = bcrypt.hashSync(password)

        // Generate a unique activat6ion token to user
        const user = new User({ name, username, email, password })
        const randomBytesPromoise = promisify(randomBytes)
        const token = await randomBytesPromoise(20)
        user.activationToken = token.toString('hex')

        mail.sendMail({
            from: process.env.MAIL_MAIL,
            to: user.email,
            subject: 'Node Shortener | Activate your account',
            html: `
                <div style="
                    border: 2px solid #333;
                    width: 300px;
                    padding: 45px;
                    font-size: 16px;
                    font-family: Arial;
                    
                ">
                    <h2>Activate your Account</h2>
                    <p>Hi, ${user.name}</p>
                    <p>Thanks for creatting account on our site. Now before login to your account, please activate it</p>
                    <a href="${
                        process.env.APP_URL
                    }/auth/activateAccount?token=${
                user.activationToken
            }">Activate</a>
                    
                </div>
            `,
        })

        try {
            let newUser
            if (profilePhoto) {
                profilePhoto.mv(
                    __dirname +
                        '/../public/___uploads/profile_photos/' +
                        user._id +
                        '.' +
                        ext,
                    async err => {
                        if (!err) {
                            user.profilePhoto = `${user._id}.${ext}`
                            newUser = await user.save()
                        }
                    }
                )
            } else {
                newUser = await user.save()

                req.flash('success_msg', 'You have registered successfully!!')
                res.redirect('/auth/login')
            }
        } catch (error) {}
    } else {
        req.flash('errors', req.validationErrors())
    }
    res.redirect('back')
}

/**
 * /
 * /?today=true
 */
const modified = async (req, res) => {
    const todo = await Todo.find()

    if (req.query.today) {
        const modifiedData = todo.filter(
            item =>
                item.createdAt.toUTCString() !== item.updatedAt.toUTCString()
        )

        res.json(modifiedData)
    }

    const todos = await Todo.find()

    if (todos.length === 0) {
        return res.status(404).json({
            message: 'No todo found',
        })
    }

    return res.json(todos)
}

module.exports.activateAccount = async (req, res) => {
    // find the user which has this token
    const user = await User.findOne({ activationToken: req.query.token })
    if (!user) res.send('<h2>Invalid Activation Token</h2>')

    user.activationToken = null
    await user.save()

    req.flash(
        'success_msg',
        'Your account activated successfully, login to your account now!!!'
    )

    res.redirect('/auth/login')
}
module.exports.passwordResetRequest = async (req, res) => {
    let user
    // Decide is it email or username
    // find the user with this email
    // const user = await User.findOne({ email:  })
    if (isEmail(req.body.user)) {
        user = await User.findOne({ email: req.body.user })
    } else {
        user = await User.findOne({ username: req.body.user })
    }

    if (!user) {
        req.flash('error', 'No user found with this username/email')
        return res.redirect('/auth/forget-password')
    }

    const randomBytesPromoise = promisify(randomBytes)
    const token = await randomBytesPromoise(20)
    // store a token to passwordResetToken
    user.passwordResetToken = token.toString('hex')
    // store a timestamp to passwordResetToken for link validity
    user.passwordResetExpiration = Date.now() + 1000 * 60 * 60

    await user.save()

    await mail.sendMail({
        from: process.env.MAIL_MAIL,
        to: user.email,
        subject: 'Node Shortener | Reset your Password',
        html: `
                <div style="
                    border: 2px solid #333;
                    width: 300px;
                    padding: 45px;
                    font-size: 16px;
                    font-family: Arial;
                    
                ">
                    <h2>Password Reset</h2>
	                <p>Hi, ${user.name}</p>
	                <p>We got a password reset request from you.</p>
	                <a href="${process.env.APP_URL}/auth/password-reset?token=${
            user.passwordResetToken
        }">Reset Your password</a>
	                <p style="color: #666; font-size: 12px;">* Ignore it if you didn't request for it.</p>
                </div>
            `,
    })

    req.flash('success_msg', 'Check your email to reset your password!!')

    // redirect to login page
    res.redirect('/auth/login')
}

module.exports.resetPassword = async (req, res) => {
    // find with the token
    const token = req.body.token
    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpiration: {
            $gt: Date.now(),
        },
    })
    if (!user) {
        req.flash('error', 'Invalid/expired reset token')
        return res.redirect('/auth/login')
    }
    // get newpassword from form body
    const password = bcrypt.hashSync(req.body.password)
    // hash it
    // store it
    user.password = password
    // passwordResetToken
    user.passwordResetToken = null
    // passwordResetExpiration
    user.passwordResetExpiration = null
    await user.save()
    req.flash('success_msg', 'Password changed successfully')
    return res.redirect('/auth/login')
}
