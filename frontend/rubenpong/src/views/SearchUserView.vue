<script setup lang="ts">
// This function describes what the Meow-button does onclick.
// It either runs a GET request to "/cat" of the back-end, and sets the
// about_text to the text received as a response. Or it changes the
// import { getBackend } from '@/utils/backend-requests';
import SearchBar from '@/components/SearchBarUsers.vue';

</script>

<template>
  <body>
    <div>
      <SearchBar />
    </div>
  </body>
</template>

<style>

</style>
