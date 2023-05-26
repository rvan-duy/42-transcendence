<script setup lang="ts">

import GenerateSecretButtonVue from '@/components/buttons/GenerateSecretButton.vue';

</script>

<template>
  <div class="item">
    <div class="p-2" style="text-align: center">
      <p>Scan this QR code with your authenticator app:</p>
      <GenerateSecretButtonVue />
      <br><br>
      <form class="p-2" style="display: flex; flex-direction: column; align-items: center;" @submit.prevent>
        <label for="code">Enter the code from your authenticator app:</label>
        <input id="code" v-model="code" type="text" name="code" style="margin: 20px; width: 300px;">
        <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full" @click="submitCode">
          Turn on Two Factor Authentication
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { postBackend } from '@/utils/backend-requests';

export default {
  data() {
    return {
      code: '',
    };
  },
  methods: {
    async submitCode() {
      await postBackend('2fa/turn-on', { "code": this.code })
        .then(() => {
          this.$router.push({ name: 'user' });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
}

</script>
