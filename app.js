var express                 = require('express'),
    mongoose                = require('mongoose'),
    passport                = require('passport'),
    localStrategy           = require('passport-local'),
    bodyParser              = require('body-parser'),
    passportLocalMongoose   = require('passport-local-mongoose'),
    User                    = require('./models/user'),
    path                    = require('path');

mongoose.connect('mongodb://localhost/auth_demo_app');

var app      = express();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('express-session')({
    secret: 'This is a secret message that you can not access',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: true}));

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Routes
app.get('/', function(req, res){
    res.render('home');
});

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/secret', isLoggedIn, function(req, res){
    res.render('secret');
});

//Show sign up form
app.get('/register', function(req, res){
    res.render('register');
});

//Handling user sign up
app.post('/register', function(req, res){
    User.register(new User({ username: req.body.username }), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('/register');
        }
        passport.authenticate('local')(req, res, function(){
            res.redirect('/secret');
        });
    });
});

//Login Routes
//Show login form
app.get('/login', function(req, res){
    res.render('login');
});

//Login logic
app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}), function(req, res){

});

//Logout
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}


app.listen(3000, function(){
    console.log('Server started on 3000');
})