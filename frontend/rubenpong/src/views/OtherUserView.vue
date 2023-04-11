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
              <img
                src="../assets/dagmar.jpeg"
                width="50"
                height="50"
                style="border-radius: 50%; display:block;margin-left: auto; margin-right: auto"
              >
              <figcaption class="text-white text-m">
                {{ name }}
              </figcaption>
            </span>
          </div>
        </header>
        <main class="join-main">
          <button
            class="bg-blue-500 border border-red-500 hover:bg-red-400 text-white text-xs py-1 px-2 rounded-full"
            style="float: right"
          >
            Block User
          </button>
          <label for="status">Status</label>
          <p class="text-black">
            {{ status }}
          </p>
          <div
            class="columns-1"
            style="text-align: center; float: left;"
          >
            <span class="p-1">Wins</span>
            <font-awesome-icon icon="award" />
            <p class="text-black">
              1
            </p>
          </div>
          <div
            class="columns-1"
            style="text-align: center; float: center;"
          >
            <span class="p-1">Losses</span>
            <font-awesome-icon icon="skull-crossbones" />
            <p class="text-black">
              0
            </p>
          </div>
          <label for="status">Ranking</label>
          <p class="text-black">
            {{ rank }}
          </p>
          <label for="status">Match History</label>
          <p
            v-if="matches_played === 0"
            class="text-black"
          >
            No matches played yet!
          </p>
          <div v-else-if="matches_played > 0">
            <div
              v-for="match in matches"
              :key="match.player1"
            >
              <span
                v-if="match.won === name"
                class="text-black font-bold"
              >WON</span>
              <span
                v-else-if="match.won !== name"
                class="text-black font-bold"
              >LOST</span>
              <span class="text-black"> against </span>
              <span
                v-if="match.player1 === name"
                class="text-black font-bold"
              >{{ match.player2 }}</span>
              <span
                v-else
                class="text-black font-bold"
              >{{ match.player1 }}</span>
            </div>
          </div>
        </main>
      </div>
    </body>
  </div>
</template>
<script lang="ts">
export default {
  data()
  {
    return {
      name: '',
      status: 'Online',
      matches_played: 1,
      newUsername: '',
      rank: 0,
      matches: [{player1: 'Oswin', player2: 'Alice', won: 'Alice'}, {player1: 'Alice', player2: 'Ruben', won: 'Ruben'}]
    };
  },
  async created () {
    let name: string = '';
    let status: string = '';
    let rank: number = 500;
    await getBackend('user/id/2')
      .then(function(res){
        return res.json();
      })
      .then(function(data){
        name = data.name;
        status = data.status;
        rank = data.elo;
        console.log(data);
      });
    this.name = name;
    this.rank = rank;
    this.status = status;
    this.status = 'Online';
  },
  methods: {
    goTo(route: string) {
      // if (isAuthenticated) {
      //   this.$router.push('/dashboard')
      // } else {
      //   this.$router.push('/login')
      this.$router.push('/' + route);
    }
  }
};
</script>
<style src="../assets/chat.css">
@media (min-width: 1024px) {
  .chat {
    min-height: 100vh;
    align-items: center;
  }
}
.custom-file-upload {
    border: 1px solid #ccc;
    border-radius: 50%;
}
</style>