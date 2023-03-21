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
                src="../assets/dagmar.jpeg"
                width="50"
                height="50"
                style="border-radius: 50%; display:block; margin-left: auto; margin-right: auto;"
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
            <form action="">
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
                @click="changeAvatar()"
              >Submit
              </button></span>
            </form>
          </div>
          <div class="form-control">
            <label
              class="custom-file-upload"
              style="border-radius: 20px"
            >
              Change Avatar
              <div><input
                type="file"
                style=" width:315px"
              ><span><button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-full"
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

    await fetch('http://localhost:3000/user/me')
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
    async changeAvatar(newname) {

      try {
        // 👇️ const response: Response
        const response = await fetch('http://localhost:3000/user/1/chname/test', {
          method: 'POST',
          body: JSON.stringify({
            name: newname,
          }),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error! status: ${response.status}`);
        }

        // // 👇️ const result: CreateUserResponse
        // const result = (await response.json()) as CreateUserResponse;

        // console.log('result is: ', JSON.stringify(result, null, 4));

        // return result;
      } catch (error) {
        if (error instanceof Error) {
          console.log('error message: ', error.message);
          // return error.message;
        } else {
          console.log('unexpected error: ', error);
          // return 'An unexpected error occurred';
        }
      }

    }
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
