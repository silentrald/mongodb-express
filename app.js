// MODULES
const express       = require('express');

const bcrypt        = require('bcrypt');
const bodyParser    = require('body-parser');
const exphbs        = require('express-handlebars');
const mongoose      = require('mongoose');
const session       = require('express-session');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;

const SESSION_OPT = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: process.env.NODE_ENV === 'development',
        sameSite: true
    }
};

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(() => console.log('MONGO CONNECTED'))
    .catch((err) => console.log(err));

// SET TEMPLATING ENGINE
app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(require('morgan')('dev'));
}
app.use(session(SESSION_OPT));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MODELS
const User = require('./models/User');

// LOGIN
app.get('/', (req, res) => {
    return res.render('index', { title: 'Login' });
});

app.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(403).render('index', {
                title: 'Login',
                error: 'Auth Failed'
            });
        }

        delete user.password;
        req.session.user = user;

        return res.redirect('/user');
    } catch (err) {
        console.log(err);

        return res.status(500).render('index', {
            title: 'Login',
            error: 'Something went wrong on our end'
        });
    }
});

// REGISTER
app.get('/register',  (_req, res) => {
    return res.render('register', { title: 'Register' });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(8);
        const hash = await bcrypt.hash(password, salt);

        const user = new User({ username, password: hash });
        await user.save();

        return res.redirect('/');
    } catch (err) {
        console.log(err);

        return res.status(500).render('register', {
            title: 'Register',
            error: 'Something went wrong on our end'
        });
    }
});

// AUTH
app.get('/user', (req, res) => {
    return res.render('user', {
        title: 'User',
        username: req.session.user.username
    });
});

const server = app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
});

module.exports = server;