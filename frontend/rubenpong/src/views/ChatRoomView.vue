<script setup lang="ts">
import SocketioService from '../services/socketio.service.js';

</script>

<script lang="ts">
const connection = SocketioService;

var username;

async function getUsername(){
  if (typeof username !== 'undefined'){
    console.log('Username already fetched');
    return username;
  }
  else{
    console.log('Fetching username');
    await fetch('http://localhost:3000/user/me', {mode: 'cors'})
      .then(async function(res)
      {
        var data = await res.json();
        username = data.name;
      })
      .catch(error => console.log('Failed to fetch user : ' + error.message));
  }
  //   console.log(`Username returned by getUsername: ${username}`);
  return username;
}

connection.setupSocketConnection('/chat');
// connection.socket.on('connection', () => {console.log('Chat client connected');});
connection.socket.on('msgToClient', (msg) => {
  console.log(`client received message: ${msg}`);
  outputMessages(msg);
});

// const chatForm = document.getElementById('chat-form');

async function chatFormSubmit(e){
  const msg = e.target.elements.msg;
  const packet = {username: getUsername(), msg: (msg.value)};
  packet.username = await getUsername();
  console.log(packet.username);
  console.log(packet);
  connection.socket.emit('msgToServer', packet);
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

</script>

<template>
  <div class="chat">
    <!-- <h1 id="chat_text">This is the chat page (for now)</h1> -->
    <body>
      <div class="chat-container p-8">
        <header class="chat-header">
          <h1><i class="fas fa-smile" /> ChatCord</h1>
          <a
            href="/chat"
            class="btn"
          >Leave Room</a>
        </header>
        <main class="chat-main">
          <div class="chat-sidebar">
            <h3><i class="fas fa-comments" /> Room Name:</h3>
            <h2 id="room-name">
              Room 1
            </h2>
            <h3><i class="fas fa-users" /> Users</h3>
            <ul id="users">
              <li>Ruben 1</li>
              <li>Ruben 2</li>
              <li>Lindsay</li>
              <li>Oswin</li>
              <li>Dagmar</li>
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
    </body>
  </div>
</template>

<style src="../assets/chat.css">
@media (min-width: 1024px) {
  .chat {
    min-height: 100vh;
    align-items: center;
  }
}
</style>
