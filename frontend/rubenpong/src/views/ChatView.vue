
<script setup lang="ts">
import SearchBar from '@/components/SearchBarUsers.vue';

</script>

<template>
  <div class="chat">
    <body>
      <div class="join-container">
        <header class="join-header">
          <h1><i class="fas fa-smile" /> ChatCord</h1>
        </header>
        <main class="join-main">
          <div v-if="chatCreate === false">
            <div  class="form-control">
              <label for="room">Room</label>
              <select
                id="room"
                class="text-black"
                name="room"
                style="border-radius: 20px"
                v-model="selectedChat"
              >
                <option v-for="chat in chats" :value="chat">
                  {{chat.name}}
                </option>
              </select>
            </div>
            <div v-if="selectedChat.type === 'withPassword'">
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
              > </span></div>
            <button :disabled="selectedChat.name === ''" v-if="enteredPW === selectedChat.password || selectedChat.type === 'public' || selectedChat.type === 'private'" @click="goTo('chatroom/' + selectedChat.name)"
              class="btn bg-blue-100"
            >
              Join Chat
            </button>
          </div>
          <button v-if="chatCreate === false"
              class="btn bg-blue-500 text-white" @click="chatCreate = true"
            >
              Create Chat
          </button>
            <div  v-if="chatCreate === true" class="form-control">
              <label for="room">Room</label>
              <select
                id="room"
                class="text-black"
                name="room"
                v-model="newChat.type"
                style="border-radius: 20px"
              >
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
              <span class="text-black pr-4"><SearchBar /></span>
              </div>
              <label for="name" class="pt-2">Chat name</label>
              <span class="text-black pr-4"><input
                id="username"
                v-model="newChat.name"
                VALYE
                type="text"
                name="username"
                placeholder="Enter username..."
                required
                style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
              > </span>
              <div v-if="newChat.type === 'withPassword'">
                <label for="name" class="pt-2">Password</label>
              <span class="text-black pr-4"><input
                id="username"
                v-model="newChat.password"
                VALYE
                type="text"
                name="username"
                placeholder="Enter username..."
                required
                style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
              > </span></div>
            {{ newChat }}
              <button :disabled="newChat.name === ''" @click="createChat(newChat.name)" 
              class="btn bg-blue-100"
            >
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

export default {
  data() {
    return {
      chatCreate: false,
      enteredPW: '',
      chats: [
        {
          name: 'Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '',  id: 3}, {name: 'Oswin', pic: '',  id: 4}, {name: 'Lindsay', pic: '', id: 5}],
          type: 'withPassword',
          password: 'getIn',
          channelOwnerId: 3
        },
        {
          name: 'Less Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '',  id: 3}, {name: 'Oswin', pic: '',  id: 4}, {name: 'Lindsay', pic: '', id: 5}],
          type: 'private',
          password: 'getIn',
          channelOwnerId: 3
        },
        {
          name: 'Least Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '',  id: 3}, {name: 'Oswin', pic: '',  id: 4}, {name: 'Lindsay', pic: '', id: 5}],
          type: 'public',
          password: 'getIn',
          channelOwnerId: 3
        },
      ],
      selectedChat: {
        name: '',
        users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '',  id: 3}, {name: 'Oswin', pic: '',  id: 4}, {name: 'Lindsay', pic: '', id: 5}],
        type: '',
        password: '',
        channelOwnerId: 3
      },
      newChat: {
        name: '',
        users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '',  id: 3}, {name: 'Oswin', pic: '',  id: 4}, {name: 'Lindsay', pic: '', id: 5}],
        type: '',
        password: '',
        channelOwnerId: -1
      },
      id: -1,
    }
  },
  async created() {
    await getBackend('user/me')
      .then((response => response.json()))
      .then((data) => {
        // this.name = data.name;
        // this.backendPictureUrl = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/public/${this.name}.jpg`;
        this.id = data.id;
        console.log(this.id)
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
      
      this.$router.push('/' + route + '?id=3')
      },
    createChat(nameChat: string)
    {
     this.newChat.channelOwnerId = this.id;
     console.log('create chat');
     this.goTo('chatroom/' + nameChat);
    }
  },
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
