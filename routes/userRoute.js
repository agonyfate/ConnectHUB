const express = require('express');

const userRoute = express();

const session = require('express-session');
const { SESSION_SECRET } = process.env; //session secret is like the password for the sessions. it stores information for diff users
userRoute.use(session({ secret:SESSION_SECRET })); //applies the session middleware to all routes in userRoute so each user has a unique session

// const bodyParser = require('body-parser'); // commented out cuz new version of express.js doesnt require this here 

userRoute.use(express.json()); // ok so this basically parses the information coming in form of json payloads and makes it available as a js object in req.body format for the code to run.
userRoute.use(express.urlencoded({ extended: true })); // does the same thing except instead of json payloads we have html forms and stuff. basically a secondary type of data so another line of code. extended true allows for nested objects.

userRoute.set('view engine', 'ejs');
userRoute.set('views', './views'); //set command for configuring internal settings of express. the 10th line tells express to use ejs to see views and 11th line is where to find the ejs files. first argument is the name of setting and the second argument is the value of the setting

userRoute.use(express.static('public')); //using static files directly for streamlining. we are pulling these files from 'public' folder

/* const path = require('path'); //built in module to make it easy to build paths i.e. the paths for diff files and folders. works across all OS

const multer = require('multer'); //for images/other file types upload

const store = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, path.join(__dirname, '../public/images'));
    }, //destination tells multer where to save the file. function is form of the request created, the file uploaded, cb handles file upload. 'path.join' helps make the path between the OS and public/images. 'null' is there to give error when there is no image. cb is callback middleware. second argument is the value passed but if there is no value then first argument passes which is an error 
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name); 
    } //tells how to save the file name. timestamp+original name
});

const upload = multer({storage:store}); */

const userControl = require('../controllers/userControl');

const userAuth = require('../middlewares/auth');

userRoute.get('/register', userAuth.isLogout, userControl.registerLoad); //get() is for client wanting to retrieve data from the server. first arg loads the register view page. second arg makes it check if the user is logged out then only will the page load. third arg renders the form
userRoute.post('/register', /* upload.single('image'), */ userControl.register); //post() is for client submitting data to the server. firt arg handles form submission and second arg stores the data. there is no need to check login logout because here the client is submitting data. login/logout would already have been checked when client asked for data
userRoute.get('/', userAuth.isLogout, userControl.loadLogin); //first arg loads login page. just / means this is the default page which makes sense. second args check if user is logged out before loading the page. third arg renders the form
userRoute.post('/', userControl.login); //handles form submission + checks data against stored data and starts new session
userRoute.get('/logout', userAuth.isLogin, userControl.logout); //logs user out + checks if user is logged in before letting them logout (obviously) (making sure logic is consistent) + destroys session
userRoute.get('/dash', userAuth.isLogin, userControl.loadDash); //loads dash after login + checks if user is logged in before loading dash + renders page
userRoute.post('/save-chat', userControl.saveChat);
userRoute.get('/admin', userAuth.isLogin, userAuth.isAdmin, userControl.loadAdmin);
userRoute.post('/admin/ban/:name', userAuth.isLogin, userAuth.isAdmin, userControl.ban);
userRoute.post('/admin/mute/:name', userAuth.isLogin, userAuth.isAdmin, userControl.mute);
userRoute.post('/admin/unban/:name', userAuth.isLogin, userAuth.isAdmin, userControl.unban);
userRoute.post('/admin/unmute/:name', userAuth.isLogin, userAuth.isAdmin, userControl.unmute);
userRoute.get('/video', userAuth.isLogin, userControl.video);
userRoute.get('/video/:id', userAuth.isLogin, userControl.video);

module.exports = userRoute;