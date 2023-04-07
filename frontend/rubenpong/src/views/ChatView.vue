
<script setup lang="ts">
import SocketioService from '../services/socketio.service.js';
// import { chat_socket } from '../main.ts';
import SearchBar from '@/components/SearchBarUsers.vue';

</script>

<template>
  <div class="chat">

    <body>
      <div class="join-container">
        <header class="join-header">
          <h1><i class="fas fa-smile" /> RubenSpeak</h1>
        </header>
        <main class="join-main">
          <div v-if="chatCreate === false">
            <div class="form-control">
              <label for="room">Room</label>
              <select id="room" v-model="selectedChat" class="text-black" name="room" style="border-radius: 20px">
                <option v-for="chat in chats" :key="chat.id" :value="chat">
                  {{ chat.name }}
                </option>
              </select>
            </div>
            <div v-if="selectedChat?.access === 'PROTECTED'">
              <label for="name">Password</label>
              <span class="text-black pr-4"><input id="username" v-model="enteredPW" VALYE type="text" name="username"
                  placeholder="Enter username..." required
                  style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"> </span>
            </div>
            <button v-if="selectedChat?.access === 'PUBLIC' || selectedChat?.access === 'PRIVATE'"
              :disabled="selectedChat?.name === ''" class="btn bg-blue-100"
              @click="goTo('chatroom/' + selectedChat?.name)">
              Join Chat
            </button>
          </div>
          <button v-if="chatCreate === false" class="btn bg-blue-500 text-white" @click="chatCreate = true">
            Create Chat
          </button>
          <div v-if="chatCreate === true" class="form-control">
            <label for="room">Room</label>
            <select id="chat_type" v-model="newChat.type" class="text-black" name="room" style="border-radius: 20px"
              required>
              <option value="private">
                Private
              </option>
              <option value="public">
                Public
              </option>
              <option value="withPassword">
                With Password
              </option>
            </select>
            <div v-if="newChat.type === 'private'">
              <label for="name" class="pt-2">Add users</label>
              <span class="text-black pr-4">
                <SearchBar />
              </span>
            </div>
            <label for="name" class="pt-2">Chat name</label>
            <span class="text-black pr-4"><input id="username" v-model="newChat.name" VALYE type="text" name="username"
                placeholder="Enter username..." required
                style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"> </span>
            <div v-if="newChat.type === 'withPassword'">
              <label for="name" class="pt-2">Password</label>
              <span class="text-black pr-4"><input id="username" v-model="newChat.password" VALYE type="text"
                  name="username" placeholder="Enter username..." required
                  style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"> </span>
            </div>
            {{ newChat }}
            <button :disabled="newChat.name === ''" class="btn bg-blue-100" @click="createChat(newChat.name)">
              Create Chat
            </button>
          </div>
        </main>
      </div>
    </body>
  </div>
</template>

<script lang="ts">
import { getBackend } from '../utils/backend-requests';
const connection = SocketioService;
connection.setupSocketConnection('/chat');

interface Chat {
  id: number;
  name: string;
  ownerId: number;
  access: string;
  lastId: number;
}


let chats: Chat[] = [];

connection.socket.on('loadAllChats', async (allChats: any) => {
  chats = allChats;
});

export default {
  data() {
    return {
      chats: [],
      selectedChat: null as Chat | null,
      chatCreate: false,
      enteredPW: '',
      newChat: {
        id: null,
        name: '',
        users: [{ name: 'Ruben1', pic: '', id: 1 }, { name: 'Ruben2', pic: '', id: 2 }, { name: 'Dagmar', pic: '', id: 3 }, { name: 'Oswin', pic: '', id: 4 }, { name: 'Lindsay', pic: '', id: 5 }],
        type: '',
        password: '',
        channelOwnerId: -1
      },
      id: -1,
    };
  },
  async created() {
    await getBackend('user/me')
      .then((response => response.json()))
      .then((data) => {
        // this.name = data.name;
        // this.backendPictureUrl = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/public/${this.name}.jpg`;
        this.id = data.id;
        console.log(this.id);
        // this.status = 'Online';
      });
  },
  methods: {
    goTo(route: string) {
      // if (isAuthenticated) {
      //   this.$router.push('/dashboard')
      // } else {
      //   this.$router.push('/login')
      console.log('/' + route + '?id=3');

      this.$router.push('/' + route + '?id=3');
    },
    createChat(nameChat: string) {
      this.newChat.channelOwnerId = this.id;
      console.log('create chat');
      this.goTo('chatroom/' + nameChat);
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
