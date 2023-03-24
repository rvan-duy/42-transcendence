<script setup lang="ts">
// This function describes what the Meow-button does onclick.
// It either runs a GET request to "/cat" of the back-end, and sets the
// about_text to the text received as a response. Or it changes the
import { getBackend } from '@/utils/backend-requests';

// about_text to be "dog" if the value is currently "cat".
async function onclickMeow(){
  const about_text_element = document.getElementById('about_text');

  if (about_text_element.innerHTML !== 'dog') {
    about_text_element.innerHTML = 'dog';
  }
  else
  {
    await getBackend('user/me')
      .then((response => response.json()))
      .then((data) => {
        about_text_element.innerHTML = data.name;
      });
  }
}

</script>

<template>
  <div
    class="about"
    style="text-align: center"
  >
    <h1 id="about_text">
      This is an about page
    </h1>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      @click="onclickMeow"
    >
      Meow
    </button>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    align-items: center;
  }
}
</style>
