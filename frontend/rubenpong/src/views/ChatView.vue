
<script setup lang="ts">
</script>

<template>
  <div class="chat">
    <body>
      <div class="join-container">
        <header class="join-header">
          <h1><i class="fas fa-smile" /> RubenSpeak</h1>
        </header>
        <main class="join-main">
          <form @submit.prevent>
            <div v-if="chatCreate === false">
              <div class="form-control">
                <label for="room">Room</label>
                <select
                  id="room"
                  v-model="selectedChat"
                  class="text-black"
                  name="room"
                  style="border-radius: 20px"
                  required
                >
                  <option
                    v-for="chat in chats"
                    :key="chat.id"
                    :value="chat"
                  >
                    {{ chat.name }}
                  </option>
                </select>
              </div>
              <div v-if="selectedChat?.access === 'PROTECTED'">
                <label for="name">Password</label>
                <span class="text-black pr-4"><input
                  id="username"
                  v-model="enteredPW"
                  VALYE
                  type="text"
                  name="username"
                  placeholder="Enter password..."
                  required
                  style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
                > </span>
              </div>
              <!-- We need a backend check to see if password is valid, but I implemented a frontend check to make user check whether they typed a password if one is required -->
              <button
                v-if="selectedChat == NULL || (selectedChat?.access === 'PROTECTED' && enteredPW === '')"
                type="submit"
                class="btn bg-blue-100"
              >
                Join Chat
              </button>
              <button
                v-else
                type="submit"
                class="btn bg-blue-100"
                @click="goTo('chatroom/' + selectedChat?.name + '?id=' + selectedChat?.id)"
              >
                Join Chat
              </button>
            </div>
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
              <!-- this needs to change -->
              <select
                id="chat_access"
                v-model="newChat.access"
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
              <div v-if="newChat.access === 'PROTECTED'">
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
              {{ newChat }}

              <button
                v-if="newChat.name == NULL || newChat.access === undefined || ( newChat.access === 'PROTECTED'&& newChat.password == NULL)"
                type="submit"
                class="btn bg-blue-100"
              >
                Create Chat
              </button>
              <button
                v-else
                type="submit"
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
import { getBackend, postBackend } from '../utils/backend-requests';

interface Chat {
  id: number;
  name: string;
  ownerId: number;
  access: string;
  lastId: number;
  password: string;
}
export default {
  data() {
    return {
      chats: [] as Chat[],
      selectedChat: null as Chat | null,
      chatCreate: false,
      enteredPW: '',
      id: -1,
      newChat: {} as Chat,
    };
  },
  async created() {
    const res = await getBackend('chat/myRooms');
    this.chats = await res.json() as Chat[];
    console.log(this.chats);
    await getBackend('user/me')
      .then((response => response.json()))
      .then((data) => {
        this.id = data.id;
        console.log(this.id);
      });
  },
  methods: {
    goTo(route: string) {
      console.log('/' + route);
      this.$router.push('/' + route);
    },
    async createChat(newChat: Chat) {
      const createdChat = await postBackend('chat/createRoom', undefined, { name: newChat.name, access: newChat.access, password: newChat.password }) as Chat;
      console.log('create chat');
      this.goTo('chatroom/' + newChat.name + '?id=' + createdChat.id);
    },
    // need to implement in the back-end too before this ca work
    // addUser(user: any) {
    //   this.newChat.users.push(user);
    //   this.usersAdded.push(user.id);
    // }
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
