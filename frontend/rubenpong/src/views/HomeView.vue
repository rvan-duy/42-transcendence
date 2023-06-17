<script setup lang="ts">

</script>

<template>
  <div class="item">
    <div
      class="p-2"
      style="text-align: center;"
    >
      <h1 style="font-size: 100px;">
        Welcome {{ name }} to RubenPong! 🏓
      </h1>
      <p>
        Brought to you with ❤️ by Ruben, Ruben & de Rest
      </p>
      <br><br>
      <div style="display: flex; justify-content: center;">
        <img
          src="../assets/rubenruben.jpg"
          alt="RubenPong Logo"
          style="width: 50%; height: 50%;"
        >
      </div>
      <div
        style="display: flex; justify-content: center;"
      >
        <img
          src="../assets/dkramer.jpeg"
          alt="dkramer"
          style="width: 10%; height: 10%;"
        >
        <img
          src="../assets/limartin.jpeg"
          alt="limartin"
          style="width: 10%; height: 10%;"
        >
        <img
          src="../assets/obult.jpeg"
          alt="obult"
          style="width: 10%; height: 10%;"
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { getBackend } from '@/utils/backend-requests';

export default {
  data()
  {
    return {
      name: '',
    };
  },
  async created() {
    await getBackend('user/me')
      .then((response => response.json()))
      .then((data) => {
        this.name = data.name;
      });
  }
};

</script>
