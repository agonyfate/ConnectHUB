//server

require('dotenv').config(); // gets the .env file which has the config set up. so we run the config()

var mongoose = require('mongoose'); //makes a variable mongoose so that we can use it whenever we pull from database

mongoose.connect('mongodb://127.0.0.1:27017/ConnectHUB'); //creates a database and names it which we can refer to later

const run = require('express')(); // () creates an application instance in express. basically our app is created.

const serv = require('http').Server(run); //for server start (listen)

const userRoute = require('./routes/userRoute');
const User = require('./models/userModel');
const Chat = require('./models/chatModel');

run.use('/', userRoute); // 'use' basically allows us to run middleware fucntions. first arg is the path on which the router will be mounted and the second arg is the name of the router we are mounting (here it is one we created) 

const io = require('socket.io')(serv); //initializes socket io server

var usp = io.of('/user-namespace'); //creates namespace. namespace is like a subgroup of the server. people belonging to one namespace can only talk in that namespace

usp.on('connection', async function(socket){ //listens for connections
    console.log('User Connected');
    console.log('Handshake auth:', socket.handshake.auth);

    var uid = socket.handshake.auth.token; //userid is received from the client and saved.
    const user = await User.findById(uid);

    if(user.isBanned){
        console.log(`User ${uid} is banned lmao`);
        socket.emit('banNotice', {Message: 'get unbanned'});
        return socket.disconnect(true);
    }

    await User.findByIdAndUpdate({_id: uid}, {$set:{is_online:'1'}}); //updates db to mark user as online

    socket.broadcast.emit('HI', {user_id: uid}); //broadcasts that this user id just came online. socket.broadcast.emit sends the change to all users except the sender. so every other user's screen will update that this guy just came online or offline or whatever

    socket.on('disconnect', async function(){
        console.log('User disconnected');

        await User.findByIdAndUpdate({_id: uid}, {$set:{is_online:'0'}});

        socket.broadcast.emit('BYE', {user_id: uid}); //broadcasts ki user just went offline. the reason we are putting these two lines of broadcast.emit in is cause otherwise there will be no live updates. jaise ki we are logged in and someone logs in after us, it will still show him as offline in our page
    });

    socket.on('newChat', async function(data){
        const user = await User.findById(uid);
        
        if(user.isMuted){
            socket.emit('muteNotice', {message: 'ur muted'});
            return;
        }

        socket.broadcast.emit('loadnewChat', data); 
    }); //listens for the newChat event being called by the client and then emits it to all other ports using broadcast.emit. the sender is alr seeing the message on their side so they dont need to see the message again which is why we use broadcast.emit

    socket.on('pastChat', async function(data){
        var chats = await Chat.find({$or:[
            {sender: data.sender_id, receiver: data.receiver_id},
            {sender: data.receiver_id, receiver: data.sender_id},
        ]}); //if frontend asks for the msg history, we find chats between the two concnerned in either direction

        socket.emit('loadChat', {chats: chats}); //and then send the data back to the requesting socket
    });
});

serv.listen(7777, function(){
    console.log('Server is running');
}); // command for starting server on port 7777. the second argument is optional, here its a function which just writes the message in the terminal (a verification)

