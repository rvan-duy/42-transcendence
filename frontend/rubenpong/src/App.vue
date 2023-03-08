<script setup lang="ts">
</script>

<template>
  <header>
    <!-- <img
      alt="Vue logo"
      class="logo"
      src="@/assets/logo.svg"
      width="125"
      height="125"
    > -->

    <div class="wrapper">
      <!-- <HelloWorld msg="You did it!" /> -->
      <nav>
        <RouterLink to="/">
          Home
        </RouterLink>
        <RouterLink to="/about">
          About
        </RouterLink>
        <RouterLink to="/game">
          Game
        </RouterLink>
        <RouterLink to="/matchmaking">
          Matchmaking
        </RouterLink>
        <RouterLink to="/chat">
          Chat
        </RouterLink>
        <RouterLink to="/login">
          Log in
        </RouterLink>
        <!-- <RouterLink to="/canvas">Canvas</RouterLink> -->
      </nav>
    </div>
  </header>
  <br>

  <RouterView />
</template>
<script lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components:{
    HelloWorld
  }
})
</script>

<style src="./assets/main.css"></style>
