<template>
  <div id="app">
    <div class="header">
      <h1>Chat</h1>
      <p class="username">Utilisateur: {{ username }}</p>
      <p class="online">En ligne: {{ users.length }}</p>
    </div>
    <ChatRoom @sendMessage="this.sendMessage" :messages="messages" />
  </div>
</template>

<script>
import io from 'socket.io-client';
import ChatRoom from './components/ChatRoom';

export default {
  name: 'App',
  components: {
    ChatRoom
  },
  data() {
    return {
      username: "",
      socket: io("https://arcane-coast-41323.herokuapp.com/"),
      // socket: io("http://localhost:3000/"),
      messages: [],
      users: []
    }
  },
  methods: {
    joinServer() {
      this.socket.on('loggedIn', data => {
        this.messages = data.messages;
        this.users = data.users;
        this.socket.emit('newuser', this.username);
      });

      this.listen();
    },
    listen() {
      this.socket.on('userOnline', user => {
        this.users.push(user);
      });
      this.socket.on('userLeft', user => {
        this.users.splice(this.users.indexOf(user), 1)
      });
      this.socket.on('msg', message => {
        this.messages.push(message);
      })
    },
    sendMessage(message) {
      console.log(message);BeforeUnloadEvent
      this.socket.emit('msg', message);
    }
  },
  mounted: function() {
    this.username = prompt("Nom d'utilisateur ?", "Anonyme");
    if(!this.username) {
      this.username = "Anonyme";
    }
    this.joinServer();
  }
}
</script>

<style lang="scss">
body {
  font-family: 'Avenir', Helvetica, Arial, Helvetica, sans-serif;
  color: #2C3E50;
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding: 15px;
  box-sizing: border-box;
}
</style>
