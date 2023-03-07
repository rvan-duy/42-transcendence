<script setup lang="ts">
import LoginButton from '@/components/buttons/LoginButton.vue';

// This function describes what the Meow-button does onclick.
// It either runs a GET request to "/cat" of the back-end, and sets the
// about_text to the text received as a response. Or it changes the
// about_text to be "dog" if the value is currently "cat".
function onclickMeow(){
  const about_text_element = document.getElementById('about_text');

  if (about_text_element.innerHTML !== 'dog')
    about_text_element.innerHTML = 'dog';
  else
  {
    console.log('Fetching...');
    fetch('http://localhost:3000/user/me')
      .then(function(res){
        return res.json();
      })
      .then(function(data){
        about_text_element.innerHTML = data.name;
        console.log(data);
      });
  }
}

</script>

<template>
  <div class="about">
    <h1 id="about_text">
      This is an about page
    </h1>
    <button @click="onclickMeow">
      Meow
    </button>
    <LoginButton />
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
