const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
const dotenv = require('dotenv');

let users = [];
let messages = [];
// let index = 0;

dotenv.config();

mongoose.connect(process.env.DATABASE);

const ChatSchema = mongoose.Schema({
  username: String,
  msg: String
});

const ChatModel = mongoose.model("chat", ChatSchema);

ChatModel.find((err, result) => {
  if(err) throw err;
  messages = result;
})

io.on("connection", socket => {
  socket.emit('loggedIn', {
    users: users.map(s => s.username),
    messages: messages
  });
  socket.on('newuser', username => {
    console.log(`${username} a rejoint la discussion`);
    socket.username = username;
    users.push(socket);
    io.emit('userOnline', socket.username);
  })
  socket.on('msg', msg => {
    let message = new ChatModel({
      username: socket.username,
      msg: msg
    })
    message.save().then((result, err) => {
      if(err) throw err;
      console.log(result);
      messages.push(result);
      io.emit('msg', result);
    })
    // message.save((err, result) => {
    //   if(err) throw err;
    //   console.log(result);
    //   messages.push(result);
    //   io.emit('msg', result);
    // })
    // messages.push(message);
    // io.emit('msg', message);
    // index++;
  });
  // Disconnect
  socket.on("disconnect", () => {
    console.log(`${socket.username} a quitté la discussion`);
    io.emit("userLeft", socket.username);
    users.splice(users.indexOf(socket), 1);
  })
})

http.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port %s", process.env.PORT || 3000);
})