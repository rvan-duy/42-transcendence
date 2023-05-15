<script setup lang="ts">
import { getBackend, postBackendWithQueryParams, postBackend } from '@/utils/backend-requests';
import { Modal } from 'usemodal-vue3';
import SocketioService from '../services/socketio.service.js';
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
            {{ $route.query.id }}
            <div style="text-align: right;">
              <button
                class="bg-blue-500 border border-red-500 hover:bg-red-400 text-white py-1 px-2 rounded-full text-xs m-3"
                @click="confirmAndGo('leave chat ' + $route.params.id, leaveChat, 1)"
              >
                Leave Chat
              </button>
              <div v-if="chat?.access === 'PROTECTED'">
                <span
                  class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white"
                  @click="goTo('chat')"
                >Change
                  Password</span>
                <span
                  class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white"
                  @click="changeAccess('PRIVATE')"
                >Delete
                  Password</span>
              </div>
              <span
                v-if="chat?.access === 'PUBLIC'"
                class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white"
                @click="isVisible = true"
              > Set
                Password</span>
              <Modal
                v-model:visible="isVisible"
                class="text-black"
                style="text-align: left;"
                :cancel-button="cancelBtn"
                :title="'Set Password'"
              >
                <div>
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
              <span
                class="btn ml-3"
                @click="goTo('chat')"
              >Leave Room</span>
            </div>
          </header>
          <main class="chat-main">
            <div class="chat-sidebar">
              <!-- <div v-if="chat?.access === 'PRIVATE'"> -->
              <label
                for="name"
                class="pt-2"
              >Add users</label>
              <span class="text-black pr-4">
                <input
                  v-model="input"
                  type="text"
                  placeholder="Search users..."
                  VALYE
                  required
                  style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
                >
                <!-- {{ filteredList() }} -->
                <div
                  v-for="user in filteredList()"
                  :key="user.id"
                  :value="user"
                >
                  <span><button
                    class="bg-blue-300 hover:bg-blue-500 text-white text-xs py-1 px-1 rounded-full m-1"
                    @click="user.id === idUser ? goTo('user') : goTo('otheruser/' + user.name + '?id=' + user.id)"
                  >{{
                    user.name }}</button></span>
                  <span>
                    <button
                      v-if="!usersAdded.find(el => el.id === user.id)"
                      class="bg-blue-500 text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="addUser(user)"
                    >Add</button></span>
                </div>

                <div
                  v-if="input && !allUsers.length"
                  class="item error"
                  style="text-align: center;"
                >
                  <p>No results found!</p>
                </div>
              </span>
              <!-- </div> -->
              <h3><i class="fas fa-users" /> Users</h3>
              <ul id="users">
                <li
                  v-for="user in usersAdded"
                  :key="user.id"
                >
                  <span @click="user.id === idUser ? goTo('user') : goTo('otheruser/' + user.name + '?id=' + user.id)">
                    <img
                      :src="String(getUserPicture(user.id))"
                      width="30"
                      height="30"
                      style="border-radius: 50%; display:block;  vertical-align: center; float: left;"
                      class="w-11 h-11 shrink-0 grow-0 rounded-full"
                    >
                    <span class="text-white text-xs p-1">
                      {{ user.name }}
                    </span>
                  </span>

                  <span
                    v-if="user.id === chat?.ownerId"
                    class="text-green-800 text-xs p-1 font-bold"
                  >
                    Channel Owner
                  </span>
                  <span
                    v-if="user.id !== chat?.ownerId"
                    class="text-green-200 text-xs p-1"
                  >
                    Admin
                  </span>
                  <span
                    v-if="user.id !== chat?.ownerId && idUser === chat?.ownerId"
                    class="text-green-200 text-xs p-1"
                  >
                    <button
                      class="bg-green-400 hover:bg-green-500 text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="confirmAndGo('make ' + user.name + ' Admin', makeAdmin, user.id)"
                    >Make Admin</button>
                  </span>
                  <button
                    class="bg-blue-300 hover:bg-blue-500 text-white text-xs py-1 px-1 rounded-full m-1"
                    @click="goTo('game')"
                  >
                    Invite to game
                  </button>

                  <!-- checks in the frontedn are not definetive (will be reevaluated in backend) -->
                  <div v-if="isAdmin && user.id !== idUser">
                    <button
                      class="bg-blue-500 hover:bg-red-400  text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="confirmAndGo('ban ' + user.name, banUser, user.id)"
                    >
                      Ban
                    </button>
                    <button
                      class="bg-blue-500 hover:bg-red-400  text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="confirmAndGo('mute ' + user.name, muteUser, user.id)"
                    >
                      Mute
                    </button>
                    <button
                      class="bg-blue-500 hover:bg-red-400 text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="confirmAndGo('kick ' + user.name, kickUser, user.id)"
                    >
                      Kick
                    </button>
                  </div>
                </li>
              </ul>
            </div>
            <div class="chat-messages">
              <div
                v-for="message in messages"
                id="message-list"
                ref="messageContainer"
                :key="message.id"
                class="message"
              >
                <p class="meta">
                  {{ message.username }} <span>{{ toLocale(message.timestamp) }}</span>
                </p>
                <p class="text">
                  {{ message.body }}
                </p>
              </div>
            </div>
          </main>
          <div class="chat-form-container">
            <form
              id="chat-form"
              @submit.prevent="chatFormSubmit($event, chatId)"
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

interface Chat {
  id: number;
  name: string;
  ownerId: number;
  access: string;
  lastId: number;
}

interface User {
  id: number;
  name: string;
}

export default {
  data() {
    return {
      messages: [] as any,
      chat: {} as Chat | null,
      users: [] as User[],
      idUser: null,
      isAdmin: false,
      isVisible: false,
      newPassword: '',
      cancelBtn: { text: 'cancel', onclick: () => { }, loading: false },
      okBtn: { text: 'ok', onclick: () => { this.setPassword(); }, loading: false },
      chatId: Number(this.$route.query.id),
      connection: SocketioService,
      setup: false,
      usersAdded: [] as User[],
      allUsers: [] as User[],
      input: '',

      // input: ''
    };
  },
  async created() {
    await getBackend('user/me')
      .then((res) => {
        res.json()
          .then((data) => {
            console.log('check');
            console.log(data);
            this.idUser = data.id;
            console.log(data.id);
            setTimeout(() => {
              this.determineAdmin();
            }, 100);

          });
      });
  },
  mounted() {
    this.connection.setupSocketConnection('/chat');
    this.setupSocketListeners();
  },
  unmounted() {
    this.dropSocketListeners();
    this.connection.socket.disconnect();
  },
  methods: {
    goTo(route: string) {
      this.$router.push('/' + route);
    },
    getChatId() {
      return this.$route.query.id;
    },
    addMessage(msg: any) {
      this.messages.push(msg);
      const chatMessages = document.querySelector('.chat-messages'); //This is how we used to scroll to end but it no longer works
      chatMessages.scrollTop = (chatMessages.scrollHeight);
    },
    toLocale(timestamp: any) {
      return new Date(timestamp).toLocaleTimeString('nl-NL');
    },
    determineAdmin() {
      //temporary code
      console.log('ownerid: ' + this.chat?.ownerId);
      if (this.chat?.ownerId === this.idUser)
        this.isAdmin = true;
      // return (this.chat?.ownerId === this.idUser); // checks if is owner, admin is harder to check
      // maybe easier to alow a backend call for this? let me know if that is needed
    },
    async loadChatBaseListener(room: any) {
      console.log('loadRoom: ', room);
      this.chat = room.chat;
      // this.chat?.ownerId = room.chat.ownerId;
      const promises = room.history.map((msg: any) => {
        console.log(getBackend('user/id/' + msg.authorId));
        return getBackend('user/id/' + msg.authorId)
          .then(res => res.json())
          .then(user => {
            msg.username = user.name;
          });
      });
      await Promise.all(promises);
      this.messages = room.history;
      console.log('history messages: ', this.messages);
      this.users = room.users;
      Array.prototype.push.apply(this.usersAdded, this.users);
    },

    receiveNewMsgListener(msg: any) {
      console.log('msg: ', msg);
      msg.username = msg.author.name;
      this.addMessage(msg);
      // this.scrollChatToBottom();
    },

    async setupSocketListeners() {
      this.connection.socket.on('loadChatBase', this.loadChatBaseListener);
      this.connection.socket.on('receiveNewMsg', this.receiveNewMsgListener);
      // request the chat messages once the listener has been setup
      this.connection.socket.emit('loadRequest', Number(this.$route.query.id));
    },

    dropSocketListeners() {
      this.connection.socket.off('loadChatBase', this.loadChatBaseListener);
      this.connection.socket.off('receiveNewMsg', this.receiveNewMsgListener);
    },

    async makeAdmin(newAdminId: number) {
      await postBackend('chat/makeUserAdmin', { roomId: this.chatId, userId: newAdminId });
      // const connection = SocketioService;
      // connection.setupSocketConnection('/chat');
      // connection.socket.emit('banUserFromRoom', { roomId: this.chatId, banUserId: bannedUserId }); //make this a global socket like the example below
    },

    async banUser(bannedUserId: number) {
      postBackendWithQueryParams('chat/banUserFromRoom', undefined, { roomId: this.chatId, banUserId: bannedUserId });
      // const connection = SocketioService;
      // connection.setupSocketConnection('/chat');
      // connection.socket.emit('banUserFromRoom', { roomId: this.chatId, banUserId: bannedUserId }); //make this a global socket like the example below
    },
    async kickUser(kickedUserId: number) {
      postBackendWithQueryParams('chat/kickUserFromRoom', undefined, { roomId: this.chatId, kickUserId: kickedUserId });
      this.usersAdded.forEach(element => {

        if (element.id === kickedUserId) {
          this.usersAdded.splice(this.usersAdded.indexOf(element), 1);
        }

      });

      // const connection = SocketioService;
      // connection.setupSocketConnection('/chat');
      // connection.socket.emit('banUserFromRoom', { roomId: this.chatId, banUserId: bannedUserId }); //make this a global socket like the example below
    },

    async muteUser(mutedUserId: number) {
      postBackendWithQueryParams('chat/muteUserInRoom', undefined, { roomId: this.chatId, muteUserId: mutedUserId });

      // const connection = SocketioService;
      // connection.setupSocketConnection('/chat');
      // connection.socket.emit('banUserFromRoom', { roomId: this.chatId, banUserId: bannedUserId }); //make this a global socket like the example below
    },

    confirmAndGo(message: string, f: Function, param: number) {
      if (confirm('Are you sure you want to ' + message + '?') === true) {
        console.log('You pressed OK!');
        f(param);
      } else {
        console.log('You canceled!');
      }
    },
    leaveChat() {

    },

    scrollChatToBottom() {
      const messageContainer = this.$refs.messageContainer as HTMLElement;
      console.log('current: ', messageContainer.scrollTop, ' next: ', messageContainer.scrollHeight);
      messageContainer.scrollTop = messageContainer.scrollHeight;
    },

    setPassword() {

    },
    async chatFormSubmit(e: any, chatId: number) {
      const msg = e.target.elements.msg;
      const packet = { roomId: chatId, body: (msg.value) };
      SocketioService.socket.emit('sendMsg', packet);
      msg.value = ''; //clears the message text you just entered
      msg.focus(); //focuses on the text input area again after sending
      this.scrollChatToBottom();
    },
    async addUser(user: User) {
      this.usersAdded.push(user);
      // await putBackend('chat/addUserToRoom', { roomId: this.chatId, userToAdd: user.id})
      await postBackendWithQueryParams('chat/addUserToRoom', undefined, { roomId: this.chatId, userToAdd: user.id });
      // .then((response => response.json()))
      // .then((data) => {
      //   console.log(data);
      // }
      // );
    },
    async getUsers() {
      await getBackend('user/all').then(res => res.json())
        .then((data: User[]) => {
          this.allUsers = data;
        });

    },
    filteredList() {
      this.getUsers();
      if (this.input !== '') {
        return this.allUsers.filter((user) =>
          user.name.toLowerCase().includes(this.input.toLowerCase())
        );
      }
    },
    getUserPicture(userId: number): string {
      return (`http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/public/user_${userId}.png`);
    },
    changePassword(newPassword: string) {
      postBackendWithQueryParams('chat/changePassword', undefined, { roomId: this.chatId, newPassword });
    },
    changeAccess(newAccess: string, newPassword?: string) {
      if (newAccess !== 'PUBLIC' && newAccess !== 'PRIVATE' && newAccess !== 'PROTECTED')
        return;
      postBackendWithQueryParams('chat/changeAccess', undefined, { roomId: this.chatId, newAccess, newPassword });
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
