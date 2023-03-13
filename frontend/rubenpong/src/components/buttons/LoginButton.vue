<script setup lang="ts">

</script>

<template>
  <div v-if="!loggedIn">
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      @click="loginWith42"
    >
      Log in with 42
    </button>
  </div>
  <div v-else-if="loggedIn">
    <p>Succesfully Logged in!</p>
  </div>
</template>

<script lang="ts">
// import CurrentGameState from 'game.service'
export default {
  data()
  {
    return {
      loggedIn : false,
      clientId : 'u-s4t2ud-77defdf5da75714147831f8ce2531c3aa1554a9e79226dc62041558ded39460b',
      redirectUri : 'http://localhost:3000/auth/callback',
      responseType : 'code',
      state : 'RubenRubenEnDeRest',
     
    };
  },
  methods: {
    loginWith42() {
      console.log('Redirecting to 42...');
      const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=${this.responseType}&state=${this.state}`;
      window.location.href = authUrl;
      this.loggedIn = true;
      
    },
  },
};
</script>

<style scoped>
  /* button {
    background-color: #000000;
    color: #ffffff;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
  } */
</style>
