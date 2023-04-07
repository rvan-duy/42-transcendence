<script setup lang="ts">
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
            <!-- <p>This is the page that opens on <strong>/blog/{{ $route.params.id }}</strong> route</p> -->
            <h1 class="text-xl">
              {{ $route.params.id }}
            </h1>
            <!-- {{ $route.query.id}} -->
            <div style="text-align: right;">
              <button class="bg-blue-500 border border-red-500 hover:bg-red-400 text-white py-1 px-2 rounded-full text-xs"
                @click="goTo('chat')">
                Leave Chat
              </button>
              <!-- below is double is needed === '?' -->
              <span v-if="chat?.access === 'PROTECTED'"
                class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white" @click="goTo('chat')">Change
                Password</span>
              <span v-if="chat?.access === 'PROTECTED'"
                class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white" @click="goTo('chat')">Delete
                Password</span>
              <span v-if="chat?.access === 'PUBLIC'"
                class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white" @click="goTo('chat')"> Set
                Password</span>
              <span class="btn ml-3" @click="goTo('chat')">Leave Room</span>
            </div>
            <div style="text-align: right;" />
          </header>
          <main class="chat-main">
            <div class="chat-sidebar">
              <h3><i class="fas fa-users" /> Users</h3>
              <ul id="users">
                <!-- oswin testing for linter -->
                <li v-for="user in users" :key="user.id" :value="user">
                  <!-- <li v-for="user in chat.users"> -->
                  <span @click="goTo('otheruser/' + user.name + '?id=' + user.id)">
                    <img src="../assets/dagmar.jpeg" width="30" height="30"
                      style="border-radius: 50%; vertical-align: center; float: left;">
                    <span class="text-white text-xs p-1">
                      {{ user.name }}
                    </span>
                  </span>

                  <span v-if="user.id === chat?.ownerId" class="text-green-800 text-xs p-1 font-bold">
                    Channel Owner
                  </span>
                  <span v-if="user.id !== chat?.ownerId && user.admin === true" class="text-green-200 text-xs p-1">
                    Admin
                  </span>
                  <span v-if="user.id !== chat?.ownerId && user.admin !== true && idUser === chat?.ownerId"
                    class="text-green-200 text-xs p-1">
                    <button class="bg-green-400 hover:bg-green-500 text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="goTo('game')">Make Admin</button>
                  </span>
                  <button class="bg-blue-300 hover:bg-blue-500 text-white text-xs py-1 px-1 rounded-full m-1"
                    @click="goTo('game')">
                    Invite to game
                  </button>

                  <!-- checks in the frontedn are not definetive (will be reevaluated in backend) -->
                  <div v-if="isAdmin && user.id !== idUser && user.id !== chat?.ownerId">
                    <button class="bg-blue-500 hover:bg-red-400  text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="goTo('game')">
                      Ban
                    </button>
                    <button class="bg-blue-500 hover:bg-red-400  text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="goTo('game')">
                      Mute
                    </button>
                    <button class="bg-blue-500 hover:bg-red-400 text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="goTo('game')">
                      Kick
                    </button>
                  </div>
                </li>
              </ul>
            </div>
            <div class="chat-messages">
              <!-- CHAT MESSAGES APPEAR HERE -->
            </div>
          </main>
          <div class="chat-form-container">
            <form id="chat-form" @submit.prevent="chatFormSubmit($event)">
              <input id="msg" style="border-radius: 20px" type="text" placeholder="Enter Message" required
                autocomplete="off">

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
import SocketioService from '../services/socketio.service.js';


interface Chat {
  id: number;
  name: string;
  ownerId: number;
  access: string;
  lastId: number;
}

let chat: Chat | null = null;
let users: any = [];

const connection = SocketioService;
connection.setupSocketConnection('/chat');
connection.socket.emit('loadRequest', 1);

connection.socket.on('loadChatBase', async (room: any) => {
  console.log('loadRoom: ', room);
  users = room.users;
  chat = room.chat;
  let history = room.history;
  putHistory(history);
});

export default {
  data() {
    return {
      idUser: null,
      isAdmin: false
    };
  },
  async created() {
    await getBackend('user/me')
      .then((res) => {
        res.json()
          .then((data) => {
            this.idUser = data.id;
            console.log(data.id);
            this.determineAdmin();

          });
      });
  },
  methods: {
    goTo(route: string) {
      this.$router.push('/' + route);
    },
    determineAdmin() {
      users.find((user) => {
        if (user.id === this.idUser) {
          if (user.admin === true)
            this.isAdmin = true;
          return true; // stop searching
        }
      });
    }
  },
};

async function putHistory(data: any) {
  console.log('chat history : ', data);
  for (const msg of data) {
    var username = await getBackend(`user/id/${msg.authorId}`)
      .then(async function (res) {
        var data = await res.json();
        return data.name;
      })
      .catch(error => console.log(`loadChatHistory: Couldn't fetch username for userId ${msg.authorId}: ` + error.message));
    const format_time = new Date(msg.timestamp).toLocaleTimeString('nl-NL');
    var packet = { username: username, time: format_time, body: msg.body };
    outputMessages(packet);
  }
};

connection.socket.on('receiveNewMsg', (msg) => {
  msg.username = msg.author.name;
  msg.time = new Date().toLocaleTimeString('nl-NL'),
    outputMessages(msg);
});
// const chatForm = document.getElementById('chat-form');
async function chatFormSubmit(e) {
  const msg = e.target.elements.msg;
  const packet = { roomId: 1, body: (msg.value) };  // hardcoded roomid
  connection.socket.emit('sendMsg', packet);
  msg.value = ''; //clears the message text you just entered
  msg.focus(); //focuses on the text input area again after sending
}
// Displays the messages that the frontend receives from the server.
function outputMessages(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML =
    `<p class="meta">${message.username} <span>${message.time}</span></p>
	<p class="text">
		${message.body}
	</p>`;
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages != null) {
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function displayUsers(username) {
  const list_item = document.createElement('li');
  list_item.innerHTML = `${username}`;
  const usersList = document.querySelector('.users');
  if (usersList != null)
    usersList.appendChild(list_item);
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
