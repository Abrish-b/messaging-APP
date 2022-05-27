const http = require('http');
const express = require('express');
const socketio  = require('socket.io');
const {v4: uuidV4 }=require('uuid')
var path = require('path');
const PORT = process.env.PORT || 8080;
let callList = {}

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const users = {}
const genders = {}
const callLog = {}

//peer server
// const {ExpressPeerServer} = require('peer');
// const peerServer = ExpressPeerServer(server, {
//     // proxied: true,
//     // port: 433, 
//     // path: '/abrishapp',
//     debug: true,
//     // ssl: {}
// });
// app.use(peerServer);

app.set('view engine' , 'ejs')
app.use('/',express.static(path.join(__dirname, '../client')));
app.use('/audio/Hello.mp3',express.static(path.join(__dirname, '../client/assets/audio/Hello.mp3')));
app.use('/audio/ringing.mp3',express.static(path.join(__dirname, '../client/assets/audio/ringing.mp3')));

app.get('/call/:user', (req, res) =>{
    const unique = uuidV4();
    res.redirect(`/${unique}`)
    callList[req.params.user] = unique
    console.log( callList ,' for user ' + req.params.user);
})

app.get('/:room', (req, res)=>{
    res.render('room',{roomId:req.params.room})
})



io.on('connection', socket=>{
    socket.on('name', (name, sex)=>{
        console.log(name , ' connected with:' + socket.id );
        users[name] = socket.id;
        genders[name] = sex
        console.log(users);
        io.emit('users', users)
        // socket.broadcast.emit('users', users)
    })
    socket.on('to', (mess,name) =>{
        io.to(users[name]).emit('mess', mess);
        console.log('sent ' + mess + ' to ' + name);
    } )

    socket.on('disconnect', (reason)=>{
        const disUser = socket.id;
        const userName = Object.keys(users).find(key => users[key] === disUser)
        if (userName !== undefined){
            console.log('user: ' + userName + ' disconnected beacause of ' + reason);
            delete users[userName];
            console.log(users);
            io.emit('update', users)
        }
        
    } )

   //video call
    socket.on('join-room', (roomId, userId) =>{
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId)
        socket.on('disconnect' , () =>{
            socket.to(roomId).emit('user-disconnected', userId)
        })
    });
   
    socket.on('call', (called, caller) =>{

        callLog[called] = caller;
        
        io.to(users[called]).emit('incoming-call', caller, genders[called], () =>{
            console.log('incoming-call from ' + caller);
        });
        io.to(users[caller]).emit('outgoing-call', genders[called], called, () =>{
            console.log('outgoing-call from ' + called);
        });
       
    })
    socket.on('answer' ,me =>{
        io.to(users[callLog[me]]).emit('answered', me)
    } )
    socket.on('decline' ,me =>{
        io.to(users[callLog[me]]).emit('declined')
    } )

    socket.on('whoCalled',  user =>{
        const uniqueuuid = callList[user];
        console.log('sending link to ' + user + ' with id ' + users[user]);
        
        io.to(users[user]).emit('link', uniqueuuid, () =>{
            console.log('this is emited', uniqueuuid, ' to user ' + user);
        })  
        
       
    })
})


server.on('error', (err)=> {
    console.error(err);
})

server.listen(PORT,()=>{
    console.log(`server on port ${PORT} is ready!`);
})
