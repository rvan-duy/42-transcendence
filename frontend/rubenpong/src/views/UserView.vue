<script setup lang="ts">

</script>

<template>
  <div class="chat">
    <body>
      <div class="join-container">
        <header class="join-header">
          <div
            class="columns-1"
            style="text-align: center"
          >
            <p style="text-align: center">
              <img
                :src="backendPictureUrl"
                width="50"
                height="50"
                style="border-radius: 50%; display:block; margin-left: auto; margin-right: auto;"
                class="w-11 h-11 shrink-0 grow-0 rounded-full"
              >
            </p>
            <figcaption class="text-white text-m">
              {{ name }}
            </figcaption>
          </div>
        </header>
        <main class="join-main">
          <!-- <form action="/chatroom"> -->
          <div class="form-control">
            <form
              action=""
              @submit.prevent
            >
              <label for="username">Change Username</label>
              <span class="text-black pr-4"><input
                id="username"
                v-model="newUsername"
                VALYE
                type="text"
                name="username"
                placeholder="Enter username..."
                required
                style="border-radius: 20px; width:300px; font-size: 12px; height: 35px;"
              > </span><span><button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-full"
                @click="changeName"
              >Submit
              </button></span>
            </form>
          </div>
          <div class="form-control">
            <label
              class="custom-file-upload"
              style="text-black"
            >
              Change Avatar
              <div><input
                ref="file"
                type="file"
                class="block text-gray-700 text-sm mb-2"
                @change="uploadProfilePicture($event)"
              ><span><button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-full"
                @click="submitProfilePicture"
              >Submit
              </button></span></div>
            </label>
          </div>
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
          <label for="status">Match History</label>
          <p
            v-if="matches.length === 0"
            class="text-black"
          >
            No matches played yet!
          </p>
          <div v-else-if="matches_played > 0">
            <div
              v-for="match in matches"
              :key="match.id"
            >
              <span
                v-if="match.winnerId === id"
                class="text-black font-bold"
              >WON</span>
              <span
                v-else
                class="text-black font-bold"
              >LOST</span>
              <span class="text-black"> against </span>
              <span
                v-if="match.players[0]?.name === name"
                class="text-black font-bold"
              >{{ match.players[1]?.name }}</span>
              <span
                v-else
                class="text-black font-bold"
              >{{ match.players[0]?.name }}</span>
            </div>
          </div>
        </main>
      </div>
    </body>
  </div>
</template>

<script lang="ts">
import { getBackend, postBackend, postPictureBackend } from '@/utils/backend-requests';
import { HttpStatus } from '@nestjs/common';
interface User {
  id: number;
  intraId: number;
  name: string;
  status: string;
  pending: [];
  friends: [];
  blocked: [];
  elo: number;
  twoFactor: boolean;
  secret: string;
}

export default {
  data()
  {
    return {
      name: '',
      id: 0,
      backendPictureUrl: '',
      status: '',
      matches_played: 1,
      newUsername: '',
      elo: 500,
      matches: [
        {id: 0, score: [] as number[], players: [] as User[], winnerId: 0}
      ],
      // matches: [{player1: 'Oswin', player2: 'Alice', won: 'Alice'}, {player1: 'Alice', player2: 'Ruben', won: 'Ruben'}],
      image: null,
    };
  },
  async created () {
    await getBackend('user/me')
      .then((response => response.json()))
      .then((data) => {
        this.name = data.name;
        this.id = data.id;
        this.backendPictureUrl = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/public/user_${this.id}.png`;
        this.elo = data.elo;
        this.status = 'Online';
        console.log('data');
        console.log(data);
      });
    await getBackend('user/id/' + this.id + '?withGames=true&withStatus=true')
      .then(res => res.json())
      .then(user => {
        this.matches = user?.games;
        this.status = user.status;
      });
  },
  methods: {
    async changeName() {
      await postBackend('user/me/name', { name: this.newUsername })
        .then((response) => {
          if (response.status === HttpStatus.OK) {
            this.name = this.newUsername;
            this.newUsername = '';
          }
        }
        )
        .catch((error) => {
          console.log(error);
        });
    },
    uploadProfilePicture(event) {
      this.image = event.target.files[0];
    },
    async submitProfilePicture() {
      if (this.image === null) {
        return;
      }

      const formData = new FormData();
      formData.append('picture', this.image);

      await postPictureBackend('user/me/picture', formData)
        .then((response) => {
          if (response.status === HttpStatus.OK) {
            document.location.reload();
          }
        }
        )
        .catch((error) => {
          console.log(error);
        });
    },
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

.custom-file-upload {
    border: 1px solid #ccc;
    border-radius: 50%;
}
</style>

