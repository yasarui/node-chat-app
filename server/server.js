const path = require("path");
const express = require("express");
const http = require('http');
const Filter = require("bad-words");
const socketIO = require("socket.io");
const { generateMessage,generateLocationMessage } = require("./utils/messages");
const {addUser,removeUser,getUser,getUsersInRoom } = require("./utils/users");

//Init app
const app = express();
const port = process.env.PORT;

const publicDirectoryPath = path.join(__dirname,"../public");

//static routes
app.use(express.static(publicDirectoryPath));


const server = http.createServer(app);
const io = socketIO(server);

let count = 0;

io.on('connection',(socket)=>{
    console.log("New user connected ",socket.id);
    
    socket.on("join",(options,cb)=>{
        const { user,error } = addUser({id:socket.id,...options});
        if(error) return cb(error);
        socket.join(user.room);
        socket.emit("message",generateMessage("Admin","Welcome"));
        socket.broadcast.to(user.room).emit("message",generateMessage("Admin",`${user.username} has joined`)); 
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        cb();       
    })
    
    socket.on("sendMessage",(message,cb)=>{
        const user = getUser(socket.id);
        const filter = new Filter();
        if(filter.isProfane(message)){
            return cb("No bad words are allowed");
        }
        io.to(user.room).emit("message",generateMessage(user.username,message));
        cb();
    });
    
    socket.on("shareLocation",(coords,cb)=>{
        const user = getUser(socket.id);
        if(!user) return cb("Something went wrong");
        io.to(user.room).emit("locationMessage",generateMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        cb();
    });

    socket.on("disconnect",()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit("message",generateMessage("Admin",`${user.username} has left the room`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
});

server.listen(port,()=>{
    console.log(`Server is up and Running on port ${port}`);
})