
<script setup lang="ts">
import SocketioService from '../services/socketio.service.js';
import { ref } from "vue";
let input = ref("");
const users = [{name: 'Ruben1', pic: '', id: 1, admin: false}, {name: 'Ruben2', pic: '', id: 2, admin: false}, {name: 'Dagmar', pic: '',  id: 3, admin: false}, {name: 'Oswin', pic: '',  id: 4, admin: false}, {name: 'Lindsay', pic: '', id: 5, admin: false}];
function filteredList() {
  if (input.value !== "")
    return users.filter((user) =>
      user.name.toLowerCase().includes(input.value.toLowerCase())
    );
}

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
              <!-- <div v-if="selectedChat.type === 'PROTECTED'"></div> -->
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
            <!-- v-if="enteredPW === selectedChat.password || selectedChat.type === 'PUBLIC' || selectedChat.type === 'PRIVATE'" -->
          </div>
          <button v-if="chatCreate === false"
              class="btn bg-blue-500 text-white" @click="chatCreate = true"
            >
              Create Chat
          </button>
            <div  v-if="chatCreate === true" class="form-control">
              <label for="room">Type</label>
              <select
                id="chat_type"
                v-model="newChat.type"
                class="text-black"
                name="room"
                style="border-radius: 20px"
                required
              >
<!-- <option value="PRIVATE">
                  Private
                </option>
                <option value="PUBLIC">
                  Public
                </option>
                <option value="PROTECTED">
                  With Password
                </option>                 -->

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
                <input
    type="text" v-model="input" placeholder="Search users..."
                VALYE
                required
                style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
              > 
              <div class="item fruit" v-for="user in filteredList()" :key="user">
                <span><button @click="goTo('otheruser/' + user.name, user.id)" class="bg-blue-300 hover:bg-blue-500 text-white text-xs py-1 px-1 rounded-full m-1">{{ user.name }}</button></span>
                <span><button v-if="!usersAdded.includes(user.id)" @click="addUser(user)" class="bg-blue-500 text-white text-xs py-1 px-1 rounded-full m-1" >Add</button></span>
              </div>

              <div class="item error" style="text-align: center;" v-if="input && !filteredList().length">
                <p>No results found!</p>
              </div>
              </span>
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
          id: 1,
          name: 'Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1, admin: true}, {name: 'Ruben2', pic: '', id: 2, admin: false}, {name: 'Dagmar', pic: '',  id: 3, admin: true}, {name: 'Oswin', pic: '',  id: 4, admin: true}, {name: 'Lindsay', pic: '', id: 5, admin: false}],
          type: 'withPassword',
          password: 'getIn',
          channelOwnerId: 3
        },
        {
          id: 2,
          name: 'Less Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1, admin: true}, {name: 'Ruben2', pic: '', id: 2, admin: false}, {name: 'Dagmar', pic: '',  id: 3, admin: true}, {name: 'Oswin', pic: '',  id: 4, admin: true}, {name: 'Lindsay', pic: '', id: 5, admin: false}],
          type: 'private',
          password: 'getIn',
          channelOwnerId: 3
        },
        {
          id: 3,
          name: 'Least Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '',  id: 3}, {name: 'Oswin', pic: '',  id: 4}, {name: 'Lindsay', pic: '', id: 5}],
          type: 'public',
          password: 'getIn',
          channelOwnerId: 3
        },
      ],
      selectedChat: {
        id: null,
        name: '',
        users: [{name: 'Ruben1', pic: '', id: 1, admin: true}, {name: 'Ruben2', pic: '', id: 2, admin: false}, {name: 'Dagmar', pic: '',  id: 3, admin: true}, {name: 'Oswin', pic: '',  id: 4, admin: true}, {name: 'Lindsay', pic: '', id: 5, admin: false}],
        type: '',
        password: '',
        channelOwnerId: 3
      },
      newChat: {
        id: null,
        name: '',
        users: [],
        type: '',
        password: '',
        channelOwnerId: -1
      },
      id: -1,
      usersAdded: [],
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
      
      this.$router.push('/' + route + '?id=' + 3)
      },
    createChat(nameChat: string)
    {
     this.newChat.channelOwnerId = this.id;
     console.log('create chat');
     this.goTo('chatroom/' + nameChat);
    },
    // createChat(chatObject: any) {
    //   var dto = {name: chatObject.name, ownerId: chatObject.channelOwnerId, access: chatObject.type};
    //   console.log(`Creating chat (frontend): ${dto.name}`);
    //   const connection = SocketioService;
    //   connection.setupSocketConnection('/chat');
    //   connection.socket.emit('createRoom', dto); //make this a global socket like the example below
    // //   chat_socket.$socket.emit('createRoom', dto);
    // },
    addUser(user: any)
    {
      this.newChat.users.push(user);
      this.usersAdded.push(user.id);
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
