<script setup lang="ts">

</script>

<template>
  <div class="item">
    <div
      class="p-2"
      style="text-align: center"
    >
      <p>Insert authentication code:</p>
      <form
        class="p-2"
        style="display: flex; flex-direction: column; align-items: center;"
        @submit.prevent
      >
        <input
          id="code"
          v-model="code"
          type="text"
          name="code"
          style="margin: 20px; width: 300px;"
        >
        <button
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
          @click="submitCode"
        >
          Submit
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
      const response = await postBackend('2fa/submit-code', {
        code: this.code,
      });
      if (response.status === 200) {
        window.location.href = `http://${import.meta.env.VITE_CODAM_PC}:8000`;
      } else {
        alert('Invalid code');
      }
    },
  }
};

</script>
