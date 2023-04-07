<script setup lang="ts">
import SocketioService from '../services/socketio.service.js';
import { getBackend } from '@/utils/backend-requests';

</script>

<script lang="ts">
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

connection.socket.on('loadRoomUsers', async (usrs) => {
  console.log('loadRoomUsers: client received users for this room', usrs);
  usrs.forEach(usr => {
    displayUsers(usr.name);
  });
});

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
  msg.username = msg.author.name;
  msg.time = new Date().toLocaleTimeString('nl-NL'),
  outputMessages(msg);
});

async function chatFormSubmit(e){
  const msg = e.target.elements.msg;
  const packet = {roomId: 1, body: (msg.value)};  // hardcoded roomid
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
  if (chatMessages != null){
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function displayUsers(username)
{
  const list_item = document.createElement('li');
  list_item.innerHTML = `${username}`;
  const usersList = document.querySelector('.users');
  if (usersList != null)
    usersList.appendChild(list_item);
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
            <ul class="users">
              <!-- USERS APPEAR HERE -->
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
