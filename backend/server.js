const express = require('express')
//Dotenv to keep passwords and secrets safe
require('dotenv').config()

//Create the express function, create server and use it for socket.io
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const port = process.env.PORT || 5000
const mongoose = require('mongoose')
const usersRouter = require('./routes/users')

//Connecting to the database
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection
db.once('open', () => console.log('Connected to DB!'))

app.use(express.json())

app.use('/api/users', usersRouter)

//List of users is empty object and not an empty array as we have to store the key value pair for socket and username
let users = {}
//Function is called every time there is a connection
io.on('connection', socket => {    //'connection' is a reserved event name
  console.log("Hello from the Server! Socket ID: "+socket.id) //id property is different for every connection

  socket.on("userJoin", username => {
    //After user join it adds it the the user object list
    users[socket.id] = username
    socket.join(username)
    //Add all users to general Chat by Default
    socket.join("General Chat")
    console.log("User Object after connection: ", users)
    //The user should be emitted only once so we use the JS func 'Set' to get rid of duplicates
    //This way a user can log in through 2 different sockets but his name is shown only once
    io.emit("userList", [...new Set(Object.values(users))]) //Emitting a function called 'userList' to the server to set the users
  })

  //Recieving the new message from frontend
  socket.on("newMessage", newMessage => {
    //Emitting to all the people connected the same room taken care by .to
    io.to(newMessage.room).emit("newMessage", { name: newMessage.name, msg: newMessage.msg, isPrivate: newMessage.isPrivate})
  })

  socket.on("roomEntered", ({oldRoom, newRoom}) => {
    socket.leave(oldRoom)
    //Sending leave and join NEWS to old and new rooms with the user name with key value pair of socket id
    io.to(oldRoom).emit("newMessage", {name: "NEWS", msg: `${users[socket.id]} just left "${oldRoom}"`})
    io.to(newRoom).emit("newMessage", {name: "NEWS", msg: `${users[socket.id]} just joined "${newRoom}"`})
    socket.join(newRoom)
  })

  socket.on("disconnect", () => {
    //io.emit("newMessage", {name: "NEWS", msg: `${users[socket.id]} totally left the chat`})
    delete users[socket.id]
    io.emit("userList", [...new Set(Object.values(users))])
    console.log("Users after disconnection: ", users)
  })
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})