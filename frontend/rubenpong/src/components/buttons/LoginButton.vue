<script setup lang="ts">

const clientId = 'u-s4t2ud-77defdf5da75714147831f8ce2531c3aa1554a9e79226dc62041558ded39460b';
const redirectUri = 'http://localhost:3000/auth/callback';
const responseType = 'code';
const state = 'RubenRubenEnDeRest';
const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&state=${state}`;

const loginWith42 = () => {
  console.log('Redirecting to 42...');
  window.location.href = authUrl;
};
</script>

<template>
  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" @click="loginWith42">
    Log in with 42
  </button>
</template>

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
