<script setup lang="ts">
import { ref } from 'vue';

const timestamp = new Date().getTime(); // Generate a timestamp
const imgData = ref({
  src: `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/2fa/generate?timestamp=${timestamp}`,
});

const toggleSecret = () => {
  const timestamp = new Date().getTime(); // Generate a timestamp
  imgData.value.src = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/2fa/generate?timestamp=${timestamp}`;
};

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
    <div>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        @click="toggleSecret"
      >
        Generate new secret
      </button>
    </div>
  </div>
</template>
