<script setup lang="ts">

</script>

<template>
  <nav class="flex items-center justify-between flex-wrap bg-blue-400 p-6">
    <div class="flex items-center flex-shrink-0 text-white mr-6">
      <font-awesome-icon icon="table-tennis-paddle-ball" /> <span
        class="p-2 font-semibold text-xl tracking-tight"
      >RubenPong</span>
    </div>
    <div class="w-1/2 block flex-grow lg:flex lg:items-center lg:w-auto">
      <div class="text-sm lg:flex-grow">
        <RouterLink
          v-if="userIsLoggedIn"
          class="text-blue-100 p-2 text-lg hover:text-white"
          to="/"
        >
          Home
          <RouterLink
            v-if="userIsLoggedIn"
            class="text-blue-100 p-2 text-lg hover:text-white"
            to="/game"
          >
            Game
          </RouterLink>
          <RouterLink
            v-if="userIsLoggedIn"
            class="text-blue-100 p-2 text-lg hover:text-white"
            to="/chat"
          >
            Chat
          </RouterLink>
          <RouterLink
            v-if="userIsLoggedIn"
            class="text-blue-100 p-2 text-lg hover:text-white"
            to="/searchuser"
          >
            Search User
          </RouterLink>
          <RouterLink
            v-if="userIsLoggedIn"
            class="text-blue-100 p-2 text-lg hover:text-white"
            to="/friends"
          >
            OnlyFriends
          </RouterLink>
          <RouterLink
            v-if="userIsLoggedIn"
            class="text-blue-100 p-2 text-lg hover:text-white"
            to="/logout"
          >
            Log Out
          </RouterLink>
        </routerlink>
      </div>
      <div
        class="columns-1"
        style="text-align: center; float: right;"
      >
        <RouterLink
          v-if="userIsLoggedIn"
          to="/user"
        >
          <img
            :src="backendPictureUrl"
            width="50"
            height="50"
            class="w-11 h-11 shrink-0 grow-0 rounded-full"
          >
          <figcaption class="text-white text-xs">
            {{ name }}
          </figcaption>
        </RouterLink>
      </div>
    </div>
  </nav>
  <br>
  <main>
    <RouterView />
  </main>
</template>

<script lang="ts">

import { isLoggedIn } from '@/router/auth';
import { getBackend } from './utils/backend-requests';
import { RouterLink, RouterView } from 'vue-router';
import SocketioService from '@/services/socketio.service.js';

export default {
  components: { RouterView, RouterLink },
  data() {
    return {
      selectGameMode: false,
      matched: false,
      gameMode: '',
      name: '',
      id: 0,
      backendPictureUrl: '',
      userIsLoggedInStatus: 0,
      userIsLoggedIn: false,
      statusConnection: SocketioService,
    };
  },
  async created() {
    this.userIsLoggedInStatus = await isLoggedIn();
    if (this.userIsLoggedInStatus === 200) {
      getBackend('user/me')
        .then((res) => {
          res.json()
            .then((data) => {
              this.name = data.name;
              this.id = data.id;
              this.backendPictureUrl = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/public/user_${this.id}.png`;
              this.userIsLoggedIn = true;
            });
        });
    }
  },
  mounted() {
    this.statusConnection.setupSocketConnection('/status'); // In created this doesn't work?
    this.setupSocketListeners();
  },
  unmounted() {
    this.dropSocketListeners();
  },
  methods: {
    goTo(route: string) {
      this.$router.push('/' + route);
    },
    
    setupSocketListeners() {
      this.statusConnection.socket.on('switchToGameTab', this.switchToGameTabListener);
      this.statusConnection.socket.on('updateUsername', this.updateName);
      this.statusConnection.socket.on('requestNewPicture', this.requestNewPicture);
    },

    dropSocketListeners() {
      this.statusConnection.socket.off('switchToGameTab', this.switchToGameTabListener);
      this.statusConnection.socket.off('updateUsername', this.updateName);
      this.statusConnection.socket.off('requestNewPicture', this.requestNewPicture);
    },

    switchToGameTabListener() {
      setTimeout(() => {
        this.goTo('game');
      }, 100);
    },

    updateName(newName: string) {
      this.name = newName;
    },

    requestNewPicture() {
      this.backendPictureUrl = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/public/user_${this.id}.png?${new Date().getTime()}`;
    }
  },
};

</script>

<style src="./assets/main.css"></style>
