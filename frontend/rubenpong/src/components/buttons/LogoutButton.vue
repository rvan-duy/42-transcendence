<script setup lang="ts">

const logout = () => {
  const logoutUrl = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/auth/logout`;
  window.location.href = logoutUrl;
};

</script>

<template>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
    @click="logout"
  >
    Log out
  </button>
</template>
