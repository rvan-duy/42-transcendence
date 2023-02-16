<script setup lang="ts">
import SocketioService from '../services/socketio.service.js';
</script>

<script lang="ts">
const connection = SocketioService;

connection.setupSocketConnection();
// connection.socket.on('connection', () => {console.log('Chat client connected');});
connection.socket.on('msgToClient', (msg) => {
  console.log(`client received message: ${msg}`);
  outputMessages(msg);
});

// const chatForm = document.getElementById('chat-form');

function chatFormSubmit(e){
  const msg = e.target.elements.msg;
  connection.socket.emit('msgToServer', msg.value);
  msg.value = ''; //clears the message text you just entered
  msg.focus(); //focuses on the text input area again after sending
}

// Displays the messages that the frontend receives from the server.
function outputMessages(message)
{
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML =
	`<p class="meta">NAME <span>TIME</span></p>
	<p class="text">
		${message}
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
      <div class="chat-container">
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
              type="text"
              placeholder="Enter Message"
              required
              autocomplete="off"
            >
            <button class="btn">
              <i class="fas fa-paper-plane" /> Send
            </button>
          </form>
        </div>
      </div>
    </body>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .chat {
    min-height: 100vh;
    align-items: center;
  }
}
</style>
