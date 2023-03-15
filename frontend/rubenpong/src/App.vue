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
          class="text-blue-100 p-2 text-lg hover:text-white"
          to="/about"
        >
          About
        </RouterLink>
        <RouterLink
          class="text-blue-100 p-2 text-lg hover:text-white"
          to="/game"
        >
          Game
        </RouterLink>
        <RouterLink
          class="text-blue-100 p-2 text-lg hover:text-white"
          to="/chat"
        >
          Chat
        </RouterLink>
        <RouterLink
          class="text-blue-100 p-2 text-lg hover:text-white"
          to="/logout"
        >
          Log Out
        </RouterLink>
        
      </div>
      <div class="columns-1">
      <img src="./assets/dagmar.jpeg" width="50" height="50" class="pr-2" style="border-radius: 50%; float: right;"/>
      <div><p class="text-white text-xs">dkramer</p></div>
      </div>
    </div>
  </nav>
  <br>

  <RouterView />
</template>
<script lang="ts">
import { RouterLink, RouterView } from 'vue-router';
export default {

  data()
  {
    return {
      selectGameMode: false,
      matched: false,
      gameMode : '',
      name: '',
      
    };
  },
  mounted() {
  fetch('http://localhost:3000/user/me')
    .then(function(res){
      return res.json();
    })
    .then(function(data){
      this.name = data.name;
      console.log(data);
    });
  }
}
</script>

<style src="./assets/main.css"></style>
