const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
    host: process.env.DATA_HOST,
    user: process.env.DATA_USER,
    password: process.env.DATA_PASS,
    database: process.env.DATA,
});

exports.register = (req, res) => {
    console.log(req.body);

    const {
        name,
        email,
        password,
        passwordConfirm
    } = req.body;

    db.query('SELECT email FROM user WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            return res.render('register', {
                message: 'That email has been registered'
            });
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Your password doesn\'t match'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword)

        db.query('INSERT INTO user SET ?', {
            name: name,
            email: email,
            password: hashedPassword
        }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                message: 'Register user successfully'
            }
        })
    });

}

exports.login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please provide email & password'
            })
        }

        db.query('SELECT * FROM user WHERE email = ?', [email], async (error, results) => {
            console.log(results)
            if (!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message: 'The email or password is incorrect'
                })
            } else {
                const id = results[0].id;

                const token = jwt.sign({
                    id
                }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("The token is: " + token);

                const cookieOptions = {
                    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/")
            }
        })


    } catch (error) {
        console.log(error)
    }
}