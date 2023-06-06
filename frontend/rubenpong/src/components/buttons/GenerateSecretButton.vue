<script setup lang="ts">
import { ref } from 'vue';

const imgData = ref({
  src: `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/2fa/generate`,
});

</script>

<template>
  <div>
    <div
      id="imageContainer"
      class="flex justify-center items-center"
    >
      <img
        v-bind="imgData"
      >
    </div>
  </div>
</template>
