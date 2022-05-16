const http = require('http');
const express = require('express');
const socketio  = require('socket.io');


const app = express();
app.set('view engine' , 'ejs')
app.use(express.static(`${__dirname}/../client`));


// app.get('/', (req, res) =>{
//     console.log(req);
//     res.render(`${__dirname}/../client/index.html`)
// })

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
        io.to(name).emit('mess', mess);
        console.log('sent ' + mess + ' to ' + name);
    } )
   
})


server.on('error', (err)=> {
    console.error(err);
})

server.listen(8080,()=>{
    console.log('server on port 8080 is ready!');
})
