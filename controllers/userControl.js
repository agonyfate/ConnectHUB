const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const bcrypt = require('bcrypt');
const Log = require('../models/logsModel')

const registerLoad = async(req, res)=>{
    try {
        res.render('register') //renders the views page saved as register
    } catch (error) {
        console.log(error.message); //if there is an error
    }
}

const register = async(req, res)=>{
    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10); //hashes the password with a strength of 10. firat arg is telling where the passwrod is stored. 'await' cuz we want the code to wait for the password to hash (it usually takes some time)
        
        try {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: passwordHash
            }); //stores data from the form

            await newUser.save(); //saves to database
            console.log('User Saved to DB');
        } catch (err) {
            console.error('Error', err.message);
        }

        res.render('register', {message:'Your Registration was Successful!'}); //just renders the page again with message
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async(req, res)=>{
    try {
        res.render('login', {message: null}) //renders the views page saved as login
    } catch (error) {
        console.log(error.message); //if there is an error
    }
}

const login = async(req, res)=>{
    console.log(req.body);
    try {
        const email = req.body.email; 
        const password = req.body.password; //saving the data entered by user

        const userData = await User.findOne({ email:email }); //checking if the same email exists in the stored data base of emails
        console.log('User Found', userData);
        if(userData){
            const pwdmatch = await bcrypt.compare(password, userData.password); //if email is found the comparing the password entered to password stores for that user
            console.log('Pwd Match', pwdmatch) 
            if(pwdmatch){
                req.session.user = userData; //if everything matches, then creating new session with the details of the user found in database
                console.log('redirecting')
                return res.redirect('/dash');
            } else{
                console.log('pwd inc')
                return res.render('login', {message: 'Email or Password entered in incorrect.'})
            }
        }
        else{
            console.log('email inc')
            return res.render('login', {message: 'Email or Password entered in incorrect.'})
        }
    } catch (error) {
        console.log(error.message); //if there is an error
    }
}

const logout = async(req, res)=>{
    try {
        req.session.destroy(); 
        res.redirect('/'); //destroys the ongoing session and redirects to login page
    } catch (error) {
        console.log(error.message); //if there is an error
    }
}

const loadDash = async(req, res)=>{
    try {
        /* const guy = await User.find(req.session.user._id);
        if(guy.isBanned) {
            return res.status(403).send({success:false, message: 'get unbanned'});
        } */

        var users = await User.find({_id: {$ne: req.session.user._id}});   
        res.render('dash', {user: req.session.user, users:users}); //renders the views page saved as dash with the name being pulled from the data given by user
    } catch (error) {
        console.log(error.message); //if there is an error
    }
}

const loadAdmin = async(req,res)=>{
    try {
        var users = await User.find({_id: {$ne: req.session.user._id}});
        const logs = await Log.find().sort({timestamp:-1}).limit(10);
        res.render('admin', {user :req.session.user, users:users, logs:logs});
    } catch(error) {
        console.log(error.message);
    }
}

const ban = async(req,res)=>{
    try {
        await User.updateOne({ name: req.params.name }, { isBanned: true });
        await Log.create({ admin: req.session.name, action: 'Ban', targetUser: req.params.name });
        res.redirect('/admin');
    } catch(error) {
        console.log(error.message);
    }
}

const mute = async(req,res)=>{
    try {
        await User.updateOne({ name: req.params.name }, { isMuted: true });
        await Log.create({ admin: req.session.name, action: 'Mute', targetUser: req.params.name });
        res.redirect('/admin');
    } catch(error) {
        console.log(error.message);
    }
}

const unban = async(req,res)=>{
    try {
        await User.updateOne({ name: req.params.name }, { isBanned: false });
        await Log.create({ admin: req.session.name, action: 'Unban', targetUser: req.params.name });
        res.redirect('/admin');
    } catch(error) {
        console.log(error.message);
    }
}

const unmute = async(req,res)=>{
    try {
        await User.updateOne({ name: req.params.name }, { isMuted: false });
        await Log.create({ admin: req.session.name, action: 'Unmute', targetUser: req.params.name });
        res.redirect('/admin');
    } catch(error) {
        console.log(error.message);
    }
}

const saveChat = async(req, res)=>{
    try {
        const sender = await User.findById(req.body.sid);
        if(sender.isMuted){
            return res.status(403).send({success:false, message: 'ur muted'})
        }

        var chat = new Chat({
            sender:req.body.sid,
            receiver:req.body.rid,
            message:req.body.message,
        });

        var newChat = await chat.save();
        res.status(200).send({success:true, msg:'Chat!', data:newChat});
    } catch(error) {
        res.status(400).send({success:false, msg:error.message});
    }
}

const video = async(req, res)=>{
    try {
        const senderId = req.session.user._id.toString();
        const receiverId = req.params.id;
        const user = req.session.user;
        res.render('video', {senderId, receiverId});
    } catch(error) {
        console.log(error.message);
    }
}

module.exports = {
    register,
    registerLoad,
    loadLogin,
    login,
    logout,
    loadDash,
    saveChat,
    loadAdmin,
    ban,
    mute,
    unban,
    unmute,
    video
}

//registerload renders the page and register handles the form submission. loadLogin renders the page while login checks the submitted data aginst stored, if matching creates session. logout deletes the session created by login func. loadDash renders dashboard