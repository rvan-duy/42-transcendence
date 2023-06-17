
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
              <div v-if="selectedChat?.access === 'PROTECTED' && !myRooms.includes(selectedChat)">
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
                ></span>
              </div>
              <!-- We need a backend check to see if password is valid, but I implemented a frontend check to make user check whether they typed a password if one is required -->
              <button
                v-if="selectedChat == null || (selectedChat?.access === 'PROTECTED' && enteredPW === '' && !myRooms.includes(selectedChat))"
                type="submit"
                class="btn bg-blue-100"
              >
                Join Chat
              </button>
              <button
                v-else
                type="submit"
                class="btn bg-blue-100"
                @click="joinAndGo('chatroom/' + selectedChat?.name + '?id=' + selectedChat?.id)"
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
              <button
                v-if="newChat.name == null || newChat.access === undefined || (newChat.access === 'PROTECTED' && newChat.password == NULL)"
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
import { getBackend, postBackendWithQueryParams } from '@/utils/backend-requests';

interface Chat {
	id: number;
	name: string;
	ownerId: number;
	access: string;
	lastId: number;
	password: string;
}

enum Debug {
	ENABLED = 0,
}

export default {
  data() {
    return {
      myRooms: [] as Chat[],
      available: [] as Chat[],
      chats: [] as Chat[],
      selectedChat: null as Chat | null,
      chatCreate: false,
      enteredPW: '',
      id: -1,
      newChat: {} as Chat,
    };
  },
  async created() {
    await getBackend('chat/myRooms').then((response => response.json()))
      .then((data) => {
        this.myRooms = data.myRooms as Chat[];
        this.available = data.available as Chat[];
        const chats = this.myRooms.concat(this.available);
        Array.prototype.push.apply(this.chats, chats);
      });
    await getBackend('user/me')
      .then((response => response.json()))
      .then((data) => {
        this.id = data.id;
      });
  },
  methods: {
    async joinAndGo(route: string) {
      if (!this.myRooms.includes(this.selectedChat as Chat)) {
        const result = await postBackendWithQueryParams('chat/joinRoom', { password: this.enteredPW }, { roomId: this.selectedChat?.id });
        if (Debug.ENABLED)
          console.log(result);
        if (result.statusCode === 403) {
          alert('Cannot enter');
          return;
        }
        else
          this.$router.push('/' + route);
      }
      this.$router.push('/' + route);
    },
    goTo(route: string) {
      if (Debug.ENABLED)
        console.log('/' + route);
      this.$router.push('/' + route);
    },
    async createChat(newChat: Chat) {
      if (newChat.name.length > 100)
      {
        alert('Room name too long.');
        return ;
      }
      if (newChat.password && newChat.password.length > 20)
      {
        alert('Room password too long.');
        return ;
      }
      const createdChat = await postBackendWithQueryParams('chat/createRoom', { password: newChat.password }, { name: newChat.name, access: newChat.access }) as Chat;
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
