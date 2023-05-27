<script setup lang="ts">
import { getBackend, postBackendWithQueryParams } from '@/utils/backend-requests';
</script>

<template>
  <div class="chat">
    <body>
      <div class="join-container">
        <header class="join-header">
          <h1><i class="fas fa-smile" /> OnlyFriends</h1>
        </header>
        <main class="join-main">
          <div v-if="pending.length > 0">
            <h1>Pending friend requests</h1>
            <ul id="users">
              <li
                v-for="user in pending"
                :key="user.id"
                class="mt-6"
              >
                <span @click="goTo('otheruser/' + user.name + '?id=' + user.id)">
                  <img
                    :src="String(getUserPicture(user.id))"
                    width="30"
                    height="30"
                    style="border-radius: 50%; display:block;  vertical-align: center; float: left;"
                    class="w-11 h-11 shrink-0 grow-0 rounded-full"
                  >
                </span>
                <span class="text-white text-xs p-1">
                  {{ user.name }}
                </span>
                <button
                  class="bg-blue-300 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded-full m-2"
                  @click="addFriend(user)"
                >
                  Add as friend
                </button>

                <!-- checks in the frontedn are not definetive (will be reevaluated in backend) -->
              </li>
            </ul>
          </div>
          <div>
            <h1 class="mt-8">
              Friends
            </h1>
            <ul id="users">
              <li
                v-for="user in friends"
                :key="user.id"
                class="mt-6"
              >
                <span @click="goTo('otheruser/' + user.name + '?id=' + user.id)">
                  <img
                    :src="String(getUserPicture(user.id))"
                    width="30"
                    height="30"
                    style="border-radius: 50%; display:block;  vertical-align: center; float: left;"
                    class="w-11 h-11 shrink-0 grow-0 rounded-full"
                  >
                  <span class="text-white text-xs p-1">
                    {{ user.name }}
                  </span>
                  <span
                    v-if="user.status === 'ingame'"
                    class="text-red text-xs p-1"
                  >
                    {{ user.status }}
                  </span>
                  <span
                    v-if="user.status === 'offline'"
                    class="text-black text-xs p-1"
                  >
                    {{ user.status }}
                  </span>
                  <span
                    v-if="user.status === 'online'"
                    class="text-green text-xs p-1"
                  >
                    {{ user.status }}
                  </span>
                </span>
                <button
                  class="bg-blue-300 hover:bg-blue-500 text-white text-xs py-1 px-1 rounded-full"
                  @click="goTo('game')"
                >
                  Invite to game
                </button>

                <!-- checks in the frontedn are not definetive (will be reevaluated in backend) -->
              </li>
            </ul>
          </div>
        </main>
      </div>
    </body>
  </div>
</template>

<script lang="ts">

interface User {
  id: number;
  name: string;
  status: string;
}
export default {
  data() {
    return {
      friends: [] as User[],
      pending: [] as User[],
    };
  },
  async created() {
    await getBackend('user/onlyFriends')
      .then((res) => {
        res.json()
          .then((data) => {
            this.friends = data.onlyFriends;
            this.pending = data.onlyPending;
            console.log(data);
          });
      });
  },
  methods: {
    goTo(route: string) {
      this.$router.push('/' + route);
    },
    getUserPicture(userId: number): string {
      return (`http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/public/user_${userId}.png`);
    },
    async addFriend(user: User) {
      await postBackendWithQueryParams('user/befriend', undefined, { id: user.id });
      this.friends.push(user);
      const index = this.pending.indexOf(user);
      this.pending.splice(index, 1); },
  },
};
</script>

