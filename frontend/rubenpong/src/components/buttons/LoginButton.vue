  <script setup lang="ts">

const loginWith42 = () => {
  const authUrl = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/auth`;
  window.location.href = authUrl;
};

</script>

<template>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
    @click="loginWith42"
  >
    Log in with 42
  </button>
</template>
