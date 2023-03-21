<script setup lang="ts">
import SocketioService from '../services/socketio.service.js';

</script>

<script lang="ts">
const connection = SocketioService;

var username;
var id;
var intraId;

async function getUserInfo(){
  if (typeof username !== 'undefined' & typeof id !== 'undefined' & typeof intraId !== 'undefined'){
    console.log('User info already fetched');
    return {username, id, intraId};
  }
  else{
    console.log('Fetching user info');
    await fetch('http://localhost:3000/user/me', {mode: 'cors'})
      .then(async function(res)
      {
        var data = await res.json();
        username = data.name;
        id = data.id;
        intraId = data.intraId;
      })
      .catch(error => console.log('Failed to fetch user : ' + error.message));
  }
  //   console.log(`Username returned by getUsername: ${username}`);
  return {username, id, intraId};
}

connection.setupSocketConnection('/chat');
connection.socket.emit('loadRequest', 1);
connection.socket.on('loadChatHistory', async (data) =>{
  console.log('client received chat history for this room');
  for (const msg of data)
  {
    console.log(msg);
    var username = await fetch(`http://localhost:3000/user/id/${msg.authorId}`, {mode: 'cors'})
      .then(async function(res)
      {
        var data = await res.json();
        return data.name;
      })
      .catch(error => console.log(`Couldn\'t fetch username for userId ${msg.authorId}: ` + error.message));
    var packet = {username: username, time: msg.timestamp, body: msg.body};
    console.log(packet);
    outputMessages(packet);
  }
});
connection.socket.on('receiveNewMsg', (msg) => {
  console.log(`client received message: ${msg}`);
  outputMessages(msg);
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
