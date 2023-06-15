<script setup lang="ts">
import { getBackend, postBackendWithQueryParams } from '@/utils/backend-requests';
import { Modal } from 'usemodal-vue3';
import SocketioService from '../services/socketio.service.js';
import { GameMode } from '@/utils/game-definitions';
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
            <!-- <button
              class="bg-blue-300 hover:bg-blue-500 text-white text-xs py-1 px-1 rounded-full m-1"
              @click="inviteSubmit(chatId, GameMode.FIESTA)"
            >
              Invite to game
            </button> -->
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
              class="bg-blue-300 hover:bg-blue-500 text-white text-xs py-1 px-1 rounded-full m-1"
              type="button"
              @click="changeVisibleInvite()"
            >
              Invite to game
            </button>
            <div
              v-if="visibleInvite == true"
              id="dropdown"
              class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
            >
              <ul
                class="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownDefaultButton"
              >
                <li>
                  <button
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    @click="inviteSubmit(chatId, GameMode.NORMAL)"
                  >
                    Normal
                  </button>
                </li>
                <li>
                  <button
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    @click="inviteSubmit(chatId, GameMode.FREEMOVE)"
                  >
                    Freemove
                  </button>
                </li>
                <li>
                  <button
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    @click="inviteSubmit(chatId, GameMode.POWERUP)"
                  >
                    Powerup
                  </button>
                </li>
                <li>
                  <button
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    @click="inviteSubmit(chatId, GameMode.FIESTA)"
                  >
                    Fiesta
                  </button>
                </li>
              </ul>
            </div>
            <!-- <div class="relative inline-block text-left">
  <div>
    <button type="button" class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" id="menu-button" aria-expanded="true" aria-haspopup="true">
      Options
      <svg class="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>
  </div> -->

            <!--
    Dropdown menu, show/hide based on menu state.

    Entering: "transition ease-out duration-100"
      From: "transform opacity-0 scale-95"
      To: "transform opacity-100 scale-100"
    Leaving: "transition ease-in duration-75"
      From: "transform opacity-100 scale-100"
      To: "transform opacity-0 scale-95"
  -->
            <!-- <div class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
    <div class="py-1" role="none"> -->
            <!-- Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" -->
            <!-- <a href="#" class="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-0">Account settings</a>
      <a href="#" class="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-1">Support</a>
      <a href="#" class="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-2">License</a>
      <form method="POST" action="#" role="none">
        <button type="submit" class="text-gray-700 block w-full px-4 py-2 text-left text-sm" role="menuitem" tabindex="-1" id="menu-item-3">Sign out</button>
      </form>
    </div>
  </div>
</div> -->
            <div style="text-align: right;">
              <button
                class="bg-blue-500 border border-red-500 hover:bg-red-400 text-white py-1 px-2 rounded-full text-xs m-3"
                @click="confirmAndGo('leave chat ' + $route.params.id, leaveChat, 1)"
              >
                Leave Chat
              </button>
              <span v-if="isOwner">
                <span
                  v-if="chat?.access === 'PUBLIC' || chat?.access === 'PROTECTED'"
                  class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white"
                  @click="isVisible = true"
                > Set
                  / Change Password</span>
                <Modal
                  v-model:visible="isVisible"
                  class="text-black"
                  style="text-align: left;"
                  :cancel-button="cancelBtn"
                  :ok-button="okBtn"
                  :title="'Set Password'"
                >
                  <div>
                    <label>This will make sure the channel cannot be entered without the correct
                      password.</label>
                    <span class="text-black pr-4"><input
                      v-model="newPassword"
                      VALYE
                      type="text"
                      name="username"
                      placeholder="Enter password..."
                      required
                      style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
                    >
                    </span>
                  </div>
                </Modal>
                <span
                  v-if="chat?.access === 'PROTECTED'"
                  class="btn px-2 py-1 text-xs m-1 bg-blue-500 hover:bg-blue-300 text-white"
                  @click="confirmAndGo('delete password, and make public chat: ' + $route.params.id, changeAccess, 'PUBLIC')"
                >
                  Delete Password</span>
              </span>
              <span
                class="btn ml-3"
                @click="goTo('chat')"
              >Leave Room</span>
            </div>
          </header>
          <main class="chat-main">
            <div class="chat-sidebar">
              <!-- <div v-if="chat?.access === 'PRIVATE'"> -->
              <div v-if="isAdmin">
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
              </div>
              <h3><i class="fas fa-users" /> Users</h3>
              <ul id="users">
                <li
                  v-for="user in usersAdded"
                  :key="user.id"
                  class="m-1"
                >
                  <span
                    @click="user.id === idUser ? goTo('user') : goTo('otheruser/' + user.name + '?id=' + user.id)"
                  >
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
                    v-if="determineAdmin(user.id)"
                    class="text-green-200 text-xs p-1"
                  >
                    Admin
                  </span>
                  <span
                    v-else-if="user.id !== chat?.ownerId && idUser === chat?.ownerId"
                    class="text-green-200 text-xs p-1"
                  >
                    <button
                      class="bg-green-400 hover:bg-green-500 text-white text-xs py-1 px-1 rounded-full m-1"
                      @click="confirmAndGo('make ' + user.name + ' Admin', makeAdmin, user.id)"
                    >Make
                      Admin</button>
                  </span>

                  <!-- checks in the frontedn are not definetive (will be reevaluated in backend) -->
                  <div v-if="isAdmin && user.id !== idUser && !determineOwner(user.id)">
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
                <p
                  v-if="message.invite === false"
                  class="text"
                >
                  <!-- if the message is not an invite -->
                  {{ message.body }}
                </p>
                <p
                  v-else-if="message.invite === true && message.authorId === idUser"
                  class="text"
                >
                  <!-- if the invite is from yourself -->
                  {{ `You have invited this room to play a game` }}
                </p>
                <p
                  v-else
                  class="text"
                >
                  {{ message.body }}
                </p>
                <button
                  v-if="message.invite === true && message.authorId !== idUser"
                  class="bg-blue-500 border border-red-500 hover:bg-red-400 text-white py-1 px-2 rounded-full text-xs m-3"
                  @click="acceptInvite(message.id)"
                >
                  accept invite
                </button>
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

enum Debug {
	ENABLED = 0,
}

enum InviteStatus {
	NotInRoom = 'You do not have access to the room you have provided',
	AlreadyInGame = 'You are already playing an ongoing game',
	CreatorAlreadyInGame = 'The creator is currently in an ongoing game',
	InviteAccepted = 'You have accepted the invite',
	InviteNotFound = 'Unable to find the invite you are trying to accept',
	InvalidPacket = 'You have sent an invalid packet to the server',
	Muted = 'You are muted in the provided room',
}

export default {
  data() {
    return {
      messages: [] as any,
      chat: {} as Chat | null,
      users: [] as User[],
      idUser: null,
      isAdmin: false,
      isOwner: false,
      isVisible: false,
      isVisibleChange: false,
      newPassword: '',
      cancelBtn: { text: 'cancel', onclick: () => { this.setVisibilityFalse(); }, loading: false },
      okBtn: { text: 'ok', onclick: () => { this.clickOk(); }, loading: false },
      chatId: Number(this.$route.query.id),
      connection: SocketioService,
      setup: false,
      myBlockedUsers: [] as number[],
      usersAdded: [] as User[],
      allUsers: [] as User[],
      chatAdmins: [] as number[],
      input: '',
      visibleInvite: false
    };
  },
  async created() {
    await getBackend('user/me')
      .then((res) => {
        res.json()
          .then((data) => {
            this.idUser = data.id;
            setTimeout(() => {
              this.amIAdmin();
            }, 100);
          });
      });
    await getBackend('chat/roomAdmins/' + '?roomId=' + this.chatId)
      .then(res => res.json())
      .then((data) => {
        data.forEach(user => {
          this.chatAdmins.push(user.id);
        });
      })
      .catch(err => {
        console.log(err);
        this.$router.push('/404');
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
    clickOk() {
      if (Debug.ENABLED)
        console.log(this.chat?.access);
      if (this.chat?.access === 'PUBLIC')
        this.changeAccess('PROTECTED');
      else
        this.changePassword();
      this.setVisibilityFalse();
    },
    setVisibilityFalse() {
      this.isVisible = false;
    },
    goTo(route: string) {
      this.$router.push('/' + route);
    },
    addMessage(msg: any) {
      this.messages.push(msg);
      const chatMessages = document.querySelector('.chat-messages'); //This is how we used to scroll to end but it no longer works
      chatMessages.scrollTop = (chatMessages.scrollHeight);
    },
    toLocale(timestamp: any) {
      return new Date(timestamp).toLocaleTimeString('nl-NL');
    },
    amIAdmin() {
      if (this.chat?.ownerId === this.idUser) {
        this.isAdmin = true;
        this.isOwner = true;
      }
      if (this.chatAdmins.includes(this.idUser))
        this.isAdmin = true;
    },
    determineAdmin(query_id: number) {
      if (query_id === this.chat?.ownerId)
        return true;
      if (this.chatAdmins.includes(query_id))
        return true;
    },
    determineOwner(query_id: number) {
      if (query_id === this.chat?.ownerId)
        return true;
    },
    async loadChatBaseListener(room: any) {
      if (Debug.ENABLED)
        console.log('loadRoom: ', room);
      this.chat = room.chat;
      await getBackend('user/me')
        .then(res => res.json())
        .then(user => {
          this.myBlockedUsers = user.blocked;
        });
      const promises = room.history.map((msg: any) => {
        return getBackend('user/id/' + msg.authorId)
          .then(res => res.json())
          .then(user => {
            msg.username = user.name;
            if (this.myBlockedUsers.includes(msg.authorId))
              msg.body = 'This message was sent by a user you blocked.';
          });
      });
      await Promise.all(promises);
      this.messages = room.history;
      this.users = room.users;
      Array.prototype.push.apply(this.usersAdded, this.users);
    },

    createInviteErrorListener(message: string) {
      alert(`Error creating invite:\n${message}`);
    },

    async editMessageListener(editedMessage: any) { // ToDo: find a way to set the username in the backend instead of reusing the old name?
      for (let index = 0; index < this.messages.length; index++) {
        if (this.messages[index].id === editedMessage.id) {
          const userName: string = this.messages[index].username;
          this.messages[index] = editedMessage;
          this.messages[index].username = userName;
          return;
        }
      }
    },

    receiveNewMsgListener(msg: any) {
      msg.username = msg.author.name;
      this.addMessage(msg);
      // this.scrollChatToBottom();
    },

    async setupSocketListeners() {
      this.connection.socket.on('loadChatBase', this.loadChatBaseListener);
      this.connection.socket.on('receiveNewMsg', this.receiveNewMsgListener);
      this.connection.socket.on('inviteStatus', this.receiveInviteStatusListener);
      this.connection.socket.on('editMessage', this.editMessageListener);
      this.connection.socket.on('createInviteError', this.createInviteErrorListener);
      this.connection.socket.on('removedFromRoom', this.removedFromRoomListener);
      // request the chat messages once the listener has been setup
      this.connection.socket.emit('loadRequest', Number(this.$route.query.id));
    },

    dropSocketListeners() {
      this.connection.socket.off('loadChatBase', this.loadChatBaseListener);
      this.connection.socket.off('inviteStatus', this.receiveInviteStatusListener);
      this.connection.socket.off('receiveNewMsg', this.receiveNewMsgListener);
      this.connection.socket.off('createInviteError', this.createInviteErrorListener);
      this.connection.socket.off('editMessage', this.editMessageListener);
      this.connection.socket.off('removedFromRoom', this.removedFromRoomListener);
    },

    async makeAdmin(newAdminId: number) {
      await postBackendWithQueryParams('chat/makeUserAdmin', undefined, { roomId: this.chatId, userId: newAdminId });
      this.chatAdmins.push(newAdminId);
    },

    async banUser(bannedUserId: number) {
      postBackendWithQueryParams('chat/banUserFromRoom', undefined, { roomId: this.chatId, banUserId: bannedUserId });
    },
    async kickUser(kickedUserId: number) {
      postBackendWithQueryParams('chat/kickUserFromRoom', undefined, { roomId: this.chatId, kickUserId: kickedUserId });
      this.usersAdded.forEach(element => {

        if (element.id === kickedUserId) {
          this.usersAdded.splice(this.usersAdded.indexOf(element), 1);
        }

      });
    },
    async muteUser(mutedUserId: number) {
      postBackendWithQueryParams('chat/muteUserInRoom', undefined, { roomId: this.chatId, muteUserId: mutedUserId });
    },

    confirmAndGo(message: string, f: Function, param: any) {
      if (confirm('Are you sure you want to ' + message + '?') === true) {
        if (Debug.ENABLED)
          console.log('You pressed OK!');
        f(param);
      } else {
        if (Debug.ENABLED)
          console.log('You canceled!');
      }
    },
    leaveChat() {
      if (Debug.ENABLED)
        console.log('leave');
      postBackendWithQueryParams('chat/leaveRoom', undefined, { roomId: this.chatId });
      this.usersAdded.forEach(element => {

        if (element.id === this.idUser) {
          this.usersAdded.splice(this.usersAdded.indexOf(element), 1);
        }

      });
    },

    scrollChatToBottom() {
      const messageContainer = this.$refs.messageContainer as HTMLElement;
      if (Debug.ENABLED)
        console.log('current: ', messageContainer.scrollTop, ' next: ', messageContainer.scrollHeight);
      messageContainer.scrollTop = messageContainer.scrollHeight;
    },
    async chatFormSubmit(e: any, chatId: number) {
      const msg = e.target.elements.msg;
      const packet = { roomId: chatId, body: (msg.value), invite: false };
      SocketioService.socket.emit('sendMsg', packet);
      msg.value = ''; //clears the message text you just entered
      msg.focus(); //focuses on the text input area again after sending
      this.scrollChatToBottom();
    },

    async inviteSubmit(chatId: number, mode: GameMode) {
      SocketioService.socket.emit('sendInvite', { roomId: chatId, mode: mode });
    },

    // disableInviteListener(invite to be disabled/removed ) {

    // },

    receiveInviteStatusListener(inviteStatus: InviteStatus) {
      if (inviteStatus === InviteStatus.InviteAccepted) {
        this.goTo('');
        return;
      }
      alert(`Error accepting invite:\n${inviteStatus}`);
    },

    removedFromRoomListener(data: any) {
      if (data.roomId === this.chatId) {
        alert(`You've been ${data.message} from the chat room`);
        this.goTo('chat');
      }
    },

    async acceptInvite(messageId: number) {
      SocketioService.socket.emit('acceptInvite', { roomId: this.chatId, messageId: messageId });
    },

    async addUser(user: User) {
      this.usersAdded.push(user);
      await postBackendWithQueryParams('chat/addUserToRoom', undefined, { roomId: this.chatId, userToAdd: user.id });
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
    async changePassword() {
      if (Debug.ENABLED)
        console.log('change pw' + this.newPassword);
      const result = await postBackendWithQueryParams('chat/changePassword', { password: this.newPassword }, { roomId: this.chatId });
      if (Debug.ENABLED)
        console.log(result);
      if (result.statusCode === 403) {
        alert('You have to be an admin for this action.');
        return;
      }
      else if (result.statusCode === 400)
      {
        alert('Password too long.');
        return;
      }
      else
        alert('Password changed succesfully.');
    },
    //change access is for setting a password and change password is for changing a password
    async changeAccess(newAccess: string) {
      if (Debug.ENABLED)
        console.log('change access' + newAccess);
      if (newAccess !== 'PUBLIC' && newAccess !== 'PRIVATE' && newAccess !== 'PROTECTED')
        return;
      const result = await postBackendWithQueryParams('chat/changeAccess', { password: this.newPassword }, { roomId: this.chatId, newAccess: newAccess });
      if (Debug.ENABLED)
        console.log(result);
      if (result.statusCode === 403) {
        alert('You have to be in the channel for this action.');
        return;
      }
      else if (result.statusCode === 400)
      {
        alert('Password too long.');
        return;
      }
      else {
        alert('Access changed succesfully.');
        this.chat.access = newAccess;
      }
    },
    changeVisibleInvite() {
      this.visibleInvite = !this.visibleInvite;
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
