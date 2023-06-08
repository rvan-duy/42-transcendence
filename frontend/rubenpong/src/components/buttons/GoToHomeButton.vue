<template>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
    @click="goToHome"
  >
    Go to home
  </button>
</template>

<script lang="ts">

export default {
  methods: {
    goToHome() {
      this.$router.push('/');
    },
  },
};

</script>