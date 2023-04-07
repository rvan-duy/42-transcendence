<script setup lang="ts">
import SocketioService from '../services/socketio.service.js';
// import { chat_socket } from '../main.ts';
</script>

<template>
  <div class="chat">
    <body>
      <div class="join-container">
        <header class="join-header">
          <h1><i class="fas fa-smile" /> RubenSpeak</h1>
        </header>
        <main class="join-main">
          <form
            v-if="chatCreate === false"
            @submit.prevent="goTo('chatroom')"
          >
            <div class="form-control">
              <label for="room">Room</label>
              <select
                id="room"
                v-model="selectedChat"
                class="text-black"
                name="room"
                style="border-radius: 20px"
              >
                <option
                  v-for="chat in chats"
                  :key="chat"
                  :value="chat"
                >
                  {{ chat.name }}
                </option>
              </select>
            </div>
            <div v-if="selectedChat.type === 'PROTECTED'">
              <label for="name">Password</label>
              <span class="text-black pr-4"><input
                id="username"
                v-model="enteredPW"
                VALYE
                type="text"
                name="username"
                placeholder="Enter username..."
                required
                style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
              > </span>
            </div>
            <button
              v-if="enteredPW === selectedChat.password || selectedChat.type === 'PUBLIC' || selectedChat.type === 'PRIVATE'"
              class="btn bg-blue-100"
              @click="goTo('chatroom')"
            >
              Join Chat
            </button>
          </form>
          <button
            v-if="chatCreate === false"
            class="btn bg-blue-500 text-white"
            @click="chatCreate = true"
          >
            Create Chat
          </button>
          <form @submit.prevent>
            <div
              v-if="chatCreate === true"
              class="form-control"
            >
              <label for="room">Select a Chat Type</label>
              <select
                id="chat_type"
                v-model="newChat.type"
                class="text-black"
                name="room"
                style="border-radius: 20px"
                required
              >
                <option value="PRIVATE">
                  Private
                </option>
                <option value="PUBLIC">
                  Public
                </option>
                <option value="PROTECTED">
                  With Password
                </option>
              </select>
              <form action="">
                <label
                  for="name"
                  class="pt-2"
                >Chat name</label>
                <span class="text-black pr-4"><input
                  id="chatName"
                  v-model="newChat.name"
                  VALYE
                  type="text"
                  name="username"
                  placeholder="Enter a name for the chat"
                  required
                  style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
                > </span>
                <div v-if="newChat.type === 'PROTECTED'">
                  <label
                    for="name"
                    class="pt-2"
                  >Password</label>
                  <span class="text-black pr-4"><input
                    id="password"
                    v-model="newChat.password"
                    VALYE
                    type="text"
                    name="username"
                    placeholder="Enter a password for the chat"
                    required
                    style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
                  > </span>
                </div>
              </form>
              DEBUGGING STATEMENT:
              {{ newChat }}
              <button
                class="btn bg-blue-100"
                @click="createChat(newChat)"
              >
                Create Chat
              </button>
            </div>
          </form>
        </main>
      </div>
    </body>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      chatCreate: false,
      enteredPW: '',
      chats: [
        {
          name: 'Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '', id: 3}, {name: 'Oswin', pic: '', id: 4}, {name: 'Lindsay', pic: '', id: 5}],
          type: 'PROTECTED',
          password: 'getIn',
          channelOwnerId: 3
        },
        {
          name: 'Less Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '', id: 3}, {name: 'Oswin', pic: '', id: 4}, {name: 'Lindsay', pic: '', id: 5}],
          type: 'PRIVATE',
          password: 'getIn',
          channelOwnerId: 3
        },
        {
          name: 'Least Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '', id: 3}, {name: 'Oswin', pic: '', id: 4}, {name: 'Lindsay', pic: '', id: 5}],
          type: 'PUBLIC',
          password: 'getIn',
          channelOwnerId: 3
        },
      ],
      selectedChat: {
        name: '',
        users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '', id: 3}, {name: 'Oswin', pic: '', id: 4}, {name: 'Lindsay', pic: '', id: 5}],
        type: '',
        password: '',
        channelOwnerId: 3
      },
      newChat: {
        name: '',
        users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '', id: 3}, {name: 'Oswin', pic: '', id: 4}, {name: 'Lindsay', pic: '', id: 5}],
        type: '',
        password: '',
        channelOwnerId: 3
      }
    };
  },
  methods: {
    goTo(route: string) {
      // if (isAuthenticated) {
      //   this.$router.push('/dashboard')
      // } else {
      //   this.$router.push('/login')
      console.log('/' + route);
      this.$router.push('/' + route);
    },
    createChat(chatObject: any) {
      var dto = {name: chatObject.name, ownerId: chatObject.channelOwnerId, access: chatObject.type};
      console.log(`Creating chat (frontend): ${dto.name}`);
      const connection = SocketioService;
      connection.setupSocketConnection('/chat');
      connection.socket.emit('createRoom', dto); //make this a global socket like the example below
    //   chat_socket.$socket.emit('createRoom', dto);
    },
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
