<script setup lang="ts">
import { getBackend, postBackendWithQueryParams} from '@/utils/backend-requests';
</script>

<template>
  <div class="chat">
    <body>
      <div class="join-container">
        <header class="join-header">
          <div style="text-align: center;">
            <span>
              <img
                :src="String(getUserPicture())"
                width="50"
                height="50"
                style="border-radius: 50%; display:block; margin-left: auto; margin-right: auto;"
                class="w-11 h-11 shrink-0 grow-0 rounded-full"              >
              <figcaption class="text-white text-m">
                {{ name }}
              </figcaption>
              <button
                v-if="!alreadyFriends()"
                class="bg-blue-300 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded-full m-2"
                @click="addFriend()"
              >
                Add as friend
              </button>
              <button
                v-else-if="alreadyFriends()"
                class="bg-blue-300 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded-full m-2"
                @click="removeFriend()"
              >
                Remove as friend
              </button>
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
          <button
            class="bg-blue-300 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded-full mr-2"
            style="float: right"
            @click="goTo('chatroom/AwesomeChat')"
          >
            Send message
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
              <!-- :key="match.player1" -->

            <div
              v-for="match in matches"
            >
              <!-- <span
                v-if="match.won === name"
                class="text-black font-bold"
              >WON</span>
              <span
                v-else-if="match.won !== name"
                class="text-black font-bold"
              >LOST</span> -->
              <span class="text-black"> against </span>
              <span
                v-if="match.players[0] === name"
                class="text-black font-bold"
              >{{ match.players[1] }}</span>
              <span
                v-else
                class="text-black font-bold"
              >{{ match.players[0] }}</span>
            </div>
          </div>
        </main>
      </div>
    </body>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      name: '',
      status: 'Online',
      matches_played: 1,
      newUsername: '',
      rank: 0,
      matches: [
        {players: [], score: []}
      ],
      myFriends: [1],
    };
  },
  async created() {
    let name: string = '';
    let status: string = '';
    let rank: number = 500;
    // let friends: number[] = [];
    await getBackend(`user/id/${Number(this.$route.query.id)}`)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        name = data.name;
        status = data.status;
        rank = data.elo;
        console.log('friends');
        console.log(data.friends);
        // friends = data.friends;
      });
    this.name = name;
    this.rank = rank;
    this.status = status;
    this.status = 'Online';
    // this.myFriends = friends;
    await getBackend('user/id/' + Number(this.$route.query.id) + '?withGames=true')
          .then(res => res.json())
          .then(user => {
            console.log('user');
            console.log(user);
          });
  },
  methods: {
    goTo(route: string) {
      // if (isAuthenticated) {
      //   this.$router.push('/dashboard')
      // } else {
      //   this.$router.push('/login')
      this.$router.push('/' + route);
    },
    alreadyFriends(): boolean
    {
      return (this.myFriends.includes(Number(this.$route.query.id)));
    },
    async addFriend() {
      console.log(Number(this.$route.query.id));
      await postBackendWithQueryParams('user/befriend', undefined, { id: Number(this.$route.query.id)});
    },
    async removeFriend() {
      await postBackendWithQueryParams('user/unfriend', undefined, { id: Number(this.$route.query.id)});
    },
    getUserPicture(): string{
      return (`http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/public/user_${Number(this.$route.query.id)}.png`);
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
