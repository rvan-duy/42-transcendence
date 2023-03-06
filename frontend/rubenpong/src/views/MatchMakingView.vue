<script setup lang="ts">
// const selectGameMode: Boolean = false;

</script>

<template>
  <div class="">
    <div style="text-align: center">
      <h1> wanna match? ;)</h1>
      <button v-if="!selectGameMode" @click="selectGameMode = true">Play game </button>
      <div><button v-if="selectGameMode">NORMAL</button></div>
      
      <div><button v-if="selectGameMode">FREEMOVE</button></div>
      <div><button v-if="selectGameMode">POWERUP</button></div>
      <div><button v-if="selectGameMode">FIESTA</button></div>
      </div>

  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      selectGameMode: false,
    }
  },
}
</script>
