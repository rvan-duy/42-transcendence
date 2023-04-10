<script setup lang="ts">
import SocketioService from '../services/socketio.service.js';
import { getBackend } from '@/utils/backend-requests';
import { Modal } from 'usemodal-vue3';
// import { ref } from "vue";

// var username;
// var id;
// var intraId;
// async function getUserInfo(){
//   if (typeof username !== 'undefined' & typeof id !== 'undefined' & typeof intraId !== 'undefined'){
//     console.log('getUserInfo: User info already fetched');
//     return {username, id, intraId};
//   }
//   else{
//     console.log('getUserInfo: Fetching user info');
//     await getBackend('user/me')
//       .then((response => response.json()))
//       .then((data) => {
//         username = data.name;
//         id = data.id;
//         intraId = data.intraId;
//         console.log(data);
//       }).catch(error => console.log('getUserInfo: Failed to fetch user : ' + error.message));
//   }
//   return {username, id, intraId};
// }
// connection.setupSocketConnection('/chat');
// connection.socket.emit('loadRequest', 1);

// connection.socket.on('loadRoomUsers', async (usrs) => {
//   console.log('loadRoomUsers: client received users for this room', usrs);
//   usrs.forEach(usr => {
//     displayUsers(usr.name);
//   });
// });

// connection.socket.on('loadChatHistory', async (data) =>{
//   console.log('loadChatHistory: client received chat history for this room');
//   for (const msg of data)
//   {
//     var username = await getBackend(`user/id/${msg.authorId}`)
//       .then(async function(res)
//       {
//         var data = await res.json();
//         return data.name;
//       })
//       .catch(error => console.log(`loadChatHistory: Couldn't fetch username for userId ${msg.authorId}: ` + error.message));
//     // const format_time = `${new Date(msg.timestamp).getHours()}:`+ `00${new Date(msg.timestamp).getMinutes()}`.slice(-2);
//     const format_time = new Date(msg.timestamp).toLocaleTimeString('nl-NL');
//     var packet = {username: username, time: format_time, body: msg.body};
//     outputMessages(packet);
//   }
// });

// connection.socket.on('receiveNewMsg', (msg) => {
//   outputMessages(formatMessage(msg));
// });
// // const chatForm = document.getElementById('chat-form');
// async function chatFormSubmit(e){
//   const msg = e.target.elements.msg;
//   const info_bundle = await getUserInfo();
//   const packet = {id: info_bundle.id, username: info_bundle.username, msg: (msg.value)};
//   connection.socket.emit('sendMsg', packet);
//   msg.value = ''; //clears the message text you just entered
//   msg.focus(); //focuses on the text input area again after sending
// }
// // Displays the messages that the frontend receives from the server.
// function outputMessages(message)
// {
//   const div = document.createElement('div');
//   div.classList.add('message');
//   div.innerHTML =
// 	`<p class="meta">${message.username} <span>${message.time}</span></p>
// 	<p class="text">
// 		${message.body}
// 	</p>`;
//   const chatMessages = document.querySelector('.chat-messages');
//   if (chatMessages != null){
//     chatMessages.appendChild(div);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
//   }
// }

// function displayUsers(username)
// {
//   const list_item = document.createElement('li');
//   list_item.innerHTML = `${username}`;
//   // let usersList = ref(user[]);
//   // usersList.value.appendChild(list_item);
// }

// function formatMessage(packet)
// {
//   return {
//     username: packet.username,
//     body: packet.msg,
//     time: new Date().toLocaleTimeString('nl-NL'),
//   };
// }

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
          <h1 class="text-xl"> {{ $route.params.id }}</h1>

          {{ $route.query.id}}
          <div style="text-align: right;">
            <button @click="confirmAndGo('leave chat ' + $route.params.id, banUser)"
              class="bg-blue-500 border border-red-500 hover:bg-red-400 text-white py-1 px-2 rounded-full text-xs"
            >Leave Chat</button>
            <span v-if="chat.type === 'withPassword'" @click="goTo('chat')"
            class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white"
            >Change Password</span>
            <span v-if="chat.type === 'withPassword'" @click="goTo('chat')"
              class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white"
            >Delete Password</span>
            <span v-if="chat.type === 'public'" @click="isVisible = true"
              class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white"
            > Set Password</span>
            <Modal class="text-black" style="text-align: left;" v-model:visible="isVisible" :cancelButton="cancelBtn" :title="'Set Password'">
              <div >
                <label>This will make sure the channel cannot be entered without the correct password.</label>
              <span class="text-black pr-4"><input
                v-model="newPassword"
                VALYE
                type="text"
                name="username"
                placeholder="Enter password..."
                required
                style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
              > </span>
            </div>
            </Modal>
            <span @click="goTo('chat')"
              class="btn ml-3"
            >Leave Room</span>
          </div>
          <div style="text-align: right;">
         </div>
        </header>
        <main class="chat-main">
          <div class="chat-sidebar">
         
            <h3><i class="fas fa-users" /> Users</h3>
            <ul id="users">
      <li v-for="user in chat.users"><span
        @click="goTo('otheruser/' + user.name + '?id=' + user.id)">
      <img
            src="../assets/dagmar.jpeg"
            width="30"
            height="30"
            style="border-radius: 50%; vertical-align: center; float: left;">
          <span class="text-white text-xs p-1">
            {{ user.name }}
          </span>
        </span>

        <span v-if="user.id === chat.channelOwnerId" class="text-green-800 text-xs p-1 font-bold">
        Channel Owner
        </span>
        <span v-if="user.id !== chat.channelOwnerId && user.admin === true" class="text-green-200 text-xs p-1">
        Admin
        </span>
        <span v-if="user.id !== chat.channelOwnerId && user.admin !== true && idUser === chat.channelOwnerId" class="text-green-200 text-xs p-1">
          <button class="bg-green-400 hover:bg-green-500 text-white text-xs py-1 px-1 rounded-full m-1" @click="confirmAndGo('make ' + user.name + ' Admin', banUser, user.id)">Make Admin</button>
        </span>
        <button class="bg-blue-300 hover:bg-blue-500 text-white text-xs py-1 px-1 rounded-full m-1" @click="goTo('game')">Invite to game</button>

        <div v-if="isAdmin && user.id !== idUser && user.id !== chat.channelOwnerId">
          <button class="bg-blue-500 hover:bg-red-400  text-white text-xs py-1 px-1 rounded-full m-1" @click="confirmAndGo('ban ' + user.name, banUser, user.id)">Ban</button>
          <button class="bg-blue-500 hover:bg-red-400  text-white text-xs py-1 px-1 rounded-full m-1" @click="confirmAndGo('mute ' + user.name, banUser, user.id)">Mute</button>
          <button class="bg-blue-500 hover:bg-red-400 text-white text-xs py-1 px-1 rounded-full m-1" @click="confirmAndGo('kick ' + user.name, banUser, user.id)">Kick</button>
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
      // users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '',  id: 3}, {name: 'Oswin', pic: '',  id: 4}, {name: 'Lindsay', pic: '', id: 5}]
      
      chat: {
          id: 1,
          name: 'Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1, admin: true}, {name: 'Ruben2', pic: '', id: 2, admin: false}, {name: 'Dagmar', pic: '',  id: 3, admin: true}, {name: 'Oswin', pic: '',  id: 4, admin: true}, {name: 'Lindsay', pic: '', id: 5, admin: false}],
          type: 'public',
          password: 'getIn',
          channelOwnerId: 1
      },
      idUser: null,
      isAdmin: false,
      isVisible: false,
      newPassword: '',
      cancelBtn: {text: 'cancel', onclick: () => {}, loading: false},
      okBtn: {text: 'ok', onclick: () => {this.setPassword()}, loading: false}

    }
  },
  async created() {
    let idUser: number = -1;
    await getBackend('user/me')
        .then((res) => { res.json()
          .then((data) => {
            this.idUser = data.id;
            console.log(data.id);
            this.determineAdmin();

          });
        });
  },
  mounted() {
    const connection = SocketioService;
    connection.setupSocketConnection('/chat');
    connection.socket.emit('loadRequest', 1);

    connection.socket.on('loadRoomUsers', async (usrs) => {
      console.log(usrs);
      // console.log('loadRoomUsers: client received users for this room', usrs);
      // usrs.forEach(usr => {
      //   displayUsers(usr.name);
      // });
    });
  },
  methods: {
    goTo(route: string) {
      // if (isAuthenticated) {
      //   this.$router.push('/dashboard')
      // } else {
      //   this.$router.push('/login')
      this.$router.push('/' + route)
    },
    determineAdmin() {
      this.chat.users.find((o, i) => {
          if (o.id === this.idUser) {
            if (o.admin === true)
              this.isAdmin = true;
            return true; // stop searching
          }
        });
    },
    banUser(bannedUserId: number)
    {
      console.log('ban');
      const connection = SocketioService;
      connection.setupSocketConnection('/chat');
      connection.socket.emit('banUserFromRoom', {roomId: 1, banUserId: bannedUserId}); //make this a global socket like the example below
   
      // $route.query.id
    // //   chat_socket.$socket.emit('createRoom', dto);
    },
      // createChat(chatObject: any) {
    //   var dto = {name: chatObject.name, ownerId: chatObject.channelOwnerId, access: chatObject.type};
    //   console.log(`Creating chat (frontend): ${dto.name}`);
    //   const connection = SocketioService;
    //   connection.setupSocketConnection('/chat');
    //   connection.socket.emit('createRoom', dto); //make this a global socket like the example below
    // //   chat_socket.$socket.emit('createRoom', dto);
    // },
    confirmAndGo(message: string, f: any, param: number)
    {
      if (confirm('Are you sure you want to ' + message + '?') == true) {
        console.log("You pressed OK!");
        f(param);
      } else {
        console.log("You canceled!");
      }
    },
    setPassword()
    {

    }
  },
};

</script>

<style src="../assets/chat.css">
@media (min-width: 1024px) {
  .chat {
    min-height: 100vh;
    align-items: center;
  }
}
</style>
