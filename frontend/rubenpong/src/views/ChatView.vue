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
          <form v-if="chatCreate === false">
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
              > </span>
            </div>
            <button
              v-if="enteredPW === selectedChat.password || selectedChat.type === 'public' || selectedChat.type === 'private'"
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
          <form>
            <div
              v-if="chatCreate === true"
              class="form-control"
            >
              <label for="room">Select a Chat Type</label>
              <select
                id="room"
                v-model="newChat.type"
                class="text-black"
                name="room"
                style="border-radius: 20px"
                required
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
                <div v-if="newChat.type === 'withPassword'">
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
                @click="goTo('chatroom')"
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
          type: 'withPassword',
          password: 'getIn',
          channelOwnerId: 3
        },
        {
          name: 'Less Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '', id: 3}, {name: 'Oswin', pic: '', id: 4}, {name: 'Lindsay', pic: '', id: 5}],
          type: 'private',
          password: 'getIn',
          channelOwnerId: 3
        },
        {
          name: 'Least Awesome Chat',
          users: [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '', id: 3}, {name: 'Oswin', pic: '', id: 4}, {name: 'Lindsay', pic: '', id: 5}],
          type: 'public',
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
    // createChat()
    // {
    //   this.chatCreate = true;
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
