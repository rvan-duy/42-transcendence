<script setup lang="ts">
import SocketioService from '../services/socketio.service.js';
import { getBackend } from '@/utils/backend-requests';

</script>

<!-- • The user should be able to create channels (chat rooms) that can be either public,
or private, or protected by a password.
• The user should be able to send direct messages to other users.
• The user should be able to block other users. This way, they will see no more
messages from the account they blocked.
• The user who has created a new channel is automatically set as the channel owner
until they leave it.
◦ The channel owner can set a password required to access the channel, change
it, and also remove it.
◦ The channel owner is a channel administrator. They can set other users as
administrators.
◦ A user who is an administrator of a channel can kick, ban or mute (for a
limited time) other users, but not the channel owners.
• The user should be able to invite other users to play a Pong game through the chat
interface.
• The user should be able to access other players profiles through the chat interface. -->

<template>
  <div class="chat">
    <body>
      <div id="app">
      <div class="chat-container p-8">
        <header class="chat-header">
          <h1><i class="fas fa-smile" /> ChatCord</h1>
          <div @click="goTo('chat')"
            class="btn"
          >Leave Room</div>
        </header>
        <main class="chat-main">
          <div class="chat-sidebar">
            <h3><i class="fas fa-comments" /> Room Name:</h3>
            <h2 id="room-name">
              Room 1
            </h2>
            <h3><i class="fas fa-users" /> Users</h3>
            <ul id="users">
      <li v-for="user in users"><div
        @click="goTo('otheruser')"
      >
      <img
            src="../assets/dagmar.jpeg"
            width="30"
            height="30"
            style="border-radius: 50%; vertical-align: center; float: left;">
          <span class="text-white text-xs p-1">
            {{ user.name }}
          </span>
        </div>
      </li>
     
            </ul>
          </div>
          <div class="chat-messages">
            <!-- CHAT MESSAGES APPEAR HERE -->
          </div>
        </main>
        <div class="chat-form-container">
          <form
            id="chat-form"
            @submit.prevent="chatFormSubmit($event)"
          >
            <input
              id="msg"
              style="border-radius: 20px"
              type="text"
              placeholder="Enter Message"
              required
              autocomplete="off"
            >

            <div class="px-2">
              <button class="btn">
                <font-awesome-icon icon="paper-plane" /> Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </body>
  </div>
</template>
<script lang="ts">
export default {
  data() {
    return {
      users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '',  id: 3}, {name: 'Oswin', pic: '',  id: 4}, {name: 'Lindsay', pic: '', id: 5}]
    }
  },
  methods: {
    goTo(route: string) {
      // if (isAuthenticated) {
      //   this.$router.push('/dashboard')
      // } else {
      //   this.$router.push('/login')
      this.$router.push('/' + route)
      }
  },
};
const connection = SocketioService;
var username;
var id;
var intraId;
async function getUserInfo(){
  if (typeof username !== 'undefined' & typeof id !== 'undefined' & typeof intraId !== 'undefined'){
    console.log('getUserInfo: User info already fetched');
    return {username, id, intraId};
  }
  else{
    console.log('getUserInfo: Fetching user info');
    await getBackend('user/me')
      .then((response => response.json()))
      .then((data) => {
        username = data.name;
        id = data.id;
        intraId = data.intraId;
      }).catch(error => console.log('getUserInfo: Failed to fetch user : ' + error.message));
  }
  return {username, id, intraId};
}
connection.setupSocketConnection('/chat');
connection.socket.emit('loadRequest', 1);
connection.socket.on('loadChatHistory', async (data) =>{
  console.log('loadChatHistory: client received chat history for this room');
  for (const msg of data)
  {
    var username = await getBackend(`user/id/${msg.authorId}`)
      .then(async function(res)
      {
        var data = await res.json();
        return data.name;
      })
      .catch(error => console.log(`loadChatHistory: Couldn't fetch username for userId ${msg.authorId}: ` + error.message));
    // const format_time = `${new Date(msg.timestamp).getHours()}:`+ `00${new Date(msg.timestamp).getMinutes()}`.slice(-2);
    const format_time = new Date(msg.timestamp).toLocaleTimeString('nl-NL');
    var packet = {username: username, time: format_time, body: msg.body};
    outputMessages(packet);
  }
});
connection.socket.on('receiveNewMsg', (msg) => {
  outputMessages(formatMessage(msg));
});
// const chatForm = document.getElementById('chat-form');
async function chatFormSubmit(e){
  const msg = e.target.elements.msg;
  const info_bundle = await getUserInfo();
  const packet = {id: info_bundle.id, username: info_bundle.username, msg: (msg.value)};
  connection.socket.emit('sendMsg', packet);
  msg.value = ''; //clears the message text you just entered
  msg.focus(); //focuses on the text input area again after sending
}
// Displays the messages that the frontend receives from the server.
function outputMessages(message)
{
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML =
	`<p class="meta">${message.username} <span>${message.time}</span></p>
	<p class="text">
		${message.body}
	</p>`;
  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatMessage(packet)
{
  return {
    username: packet.username,
    body: packet.msg,
    time: new Date().toLocaleTimeString('nl-NL'),
  };
}

</script>
<style src="../assets/chat.css">
@media (min-width: 1024px) {
  .chat {
    min-height: 100vh;
    align-items: center;
  }
}
</style>
