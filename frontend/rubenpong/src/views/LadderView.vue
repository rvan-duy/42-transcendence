<script setup lang="ts">
import { getBackend } from '@/utils/backend-requests';
</script>

<template>
  <div class="chat">
    <body>
      <div class="join-container">
        <header class="join-header">
          <div style="text-align: center;">
            <span>
              <div
                class="columns-1"
                style="text-align: center"
              >
            <figcaption class="text-white text-m">
              Kings & Queens
            </figcaption>
              </div>
            </span>
          </div>
        </header>
        <main class="join-main">
              <ul id="users">
                <li
                v-for="(user, index) in users"
                  :key="user.id"
                  class="m-2"
                >
                <span v-if="index === 0">
                  <font-awesome-icon :icon="['fas', 'crown']" :style="{ color: 'gold' }" />
                </span>
                <span v-if="index === 1">
                  <font-awesome-icon :icon="['fas', 'crown']" :style="{ color: 'silver' }" />
                </span>
                <span v-if="index === 2">
                  <font-awesome-icon :icon="['fas', 'crown']" :style="{ color: '#cd7f32' }" />
                </span>
                <span v-else-if="index > 2" class="ml-4">
                </span>
                  <span @click="user.id === idUser ? goTo('user') : goTo('otheruser/' + user.name + '?id=' + user.id)">
                    <!-- <img
                      :src="String(getUserPicture(user.id))"
                      width="30"
                      height="30"
                      style="border-radius: 50%; display:block;  vertical-align: center; float: left;"
                      class="w-11 h-11 shrink-0 grow-0 rounded-full"
                    > -->
                    <span class="text-white text-xs p-1">
                      {{ user.name }}
                    </span>
                  </span>
                  <button
                    class="bg-blue-300 hover:bg-blue-500 text-white text-xs py-1 px-1 rounded-full"
                    style="float: right; padding-bottom: 1px; padding-top: 1px;"
                    @click="goTo('game')"
                  >
                    Invite to game
                  </button>
                </li>
              </ul>
        </main>
      </div>
    </body>
  </div>
</template>

<script lang="ts">
interface User {
  id: number;
  name: string;
}
export default {
  data() {
    return {
      users: [{id: 2, name: 'd'}, {id: 2, name: 'd'}, {id: 2, name: 'd'}, {id: 2, name: 'd'}] as User[],
      idUser: 0,
    };
  },
  async created() {
    await getBackend('user/me')
      .then((res) => {
        res.json()
          .then((data) => {
            this.idUser = data.id;
          });
      });
  },
};
</script>
