<script setup lang="ts">

</script>

<template>
  <nav class="flex items-center justify-between flex-wrap bg-blue-400 p-6">
    <div class="flex items-center flex-shrink-0 text-white mr-6">
      <font-awesome-icon icon="table-tennis-paddle-ball" />    <span class="p-2 font-semibold text-xl tracking-tight">RubenPong</span>
    </div>
    <div class="w-1/2 block flex-grow lg:flex lg:items-center lg:w-auto">
      <div class="text-sm lg:flex-grow">
        <RouterLink
          v-if="userIsLoggedIn"
          class="text-blue-100 p-2 text-lg hover:text-white"
          to="/"
        >
          Home
        </RouterLink>
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
          to="/logout"
        >
          Log Out
        </RouterLink>
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
            src="./assets/dagmar.jpeg"
            width="50"
            height="50"
            style="border-radius: 50%"
          >
          <figcaption class="text-white text-xs p-1">
            {{ name }}
          </figcaption>
        </RouterLink>
      </div>
    </div>
  </nav>
  <br>
  <RouterView />
</template>

<script lang="ts">

import { RouterLink, RouterView } from 'vue-router';
import { isLoggedIn } from '@/router/auth';
import { getBackend } from './utils/backend-requests';

export default {
  data()
  {
    return {
      selectGameMode: false,
      matched: false,
      gameMode : '',
      name: '',
      userIsLoggedIn: false,
    };
  },
  async created () {
    this.userIsLoggedIn = await isLoggedIn();
    if (this.userIsLoggedIn) {
      getBackend('user/me')
        .then((res) => { res.json()
          .then((data) => {
            this.name = data.name;
          });
        });
    }
  }
};

</script>

<style src="./assets/main.css"></style>
