const http = require('http');
const express = require('express');
const socketio  = require('socket.io');
const {v4: uuidV4 }=require('uuid')
var path = require('path');
const PORT = process.env.PORT || 8080;
let callList = {}

const app = express();
app.set('view engine' , 'ejs')
app.use(express.static(path.join(__dirname, 'client')));
// app.use(express.static(`${__dirname}/../client`));


app.get('/call/:user', (req, res) =>{
    const unique = uuidV4();
    res.redirect(`/${unique}`)
    callList[req.params.user] = unique
    console.log( callList ,' for user ' + req.params.user);
})

app.get('/:room', (req, res)=>{
    res.render('room',{roomId:req.params.room})
})

const server = http.createServer(app);
const io = socketio(server);


const users = {}

io.on('connection', socket=>{
    socket.on('name', name=>{
        console.log(name , ' connected with:' + socket.id );
        users[name] = socket.id;
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
    socket.on('call', (user, caller, gender) =>{
        console.log('caller ' ,caller);
        io.to(users[user]).emit('incoming-call', caller, gender);
        
    })

    socket.on('whoCalled',  user =>{
        const uniqueuuid = callList[user];
        console.log('sending link to ' + user + ' with id ' + users[user]);
        setTimeout( ()=>{
            io.to(users[user]).emit('link', uniqueuuid, () =>{
                console.log('this is emited', uniqueuuid, ' to user ' + user);
            })  
        },1000)
       
    })
})


server.on('error', (err)=> {
    console.error(err);
})

server.listen(PORT,()=>{
    console.log(`server on port ${PORT} is ready!`);
})
