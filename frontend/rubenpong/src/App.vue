<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <body>
    <div class="container">
      <div>
        <img src="./assets/42-logo.png" alt="42 Logo" />
        <button class="log">Login</button>
        <p>Made with <span>❤</span> by Lindsay, Dagmar, Oswin, Ruben & Ruben.</p>
      </div>
    </div>
  </body>
</template>

<style>
img {
  position: relative;
  bottom: 100px;
  width: 150px;
}

body {
  font-family: sans-serif;
  background-color: rgba(250, 250, 250);
}

.container {
  border: 0;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  display: flex;
  text-align: center;
}

.container div > p span {
  color: red;
}

p {
  position: relative;
  top: 30px;
}

p a {
  color: black;
  text-decoration: none;
}

button {
  cursor: pointer;
  border: 0;
  border-radius: 4px;
  font-weight: 600;
  margin: 0 10px;
  width: 200px;
  padding: 10px 0;
  box-shadow: 0 0 20px rgba(104, 85, 224, 0.2);
  transition: 0.4s;
}

.log {
  color: rgb(104, 85, 224);
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(104, 85, 224, 1);
}

button:hover {
  color: white;
  box-shadow: 0 0 20px rgba(104, 85, 224, 0.6);
  background-color: rgba(104, 85, 224, 1);
}
</style>
