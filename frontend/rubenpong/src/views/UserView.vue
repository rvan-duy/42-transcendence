<script setup lang="ts">

</script>

<template>
  <div class="chat">
    <body>
      <div class="join-container">
        <header class="join-header">
            <div class="columns-1" style="text-align: center">
                <p style="text-align: center"><img src="../assets/dagmar.jpeg" width="50" height="50" style="border-radius: 50%; display:block; margin-left: auto; margin-right: auto;"/></p>
                <figcaption class="text-white text-m">{{name}}</figcaption>
            </div>
        </header>
        <main class="join-main">
        <!-- <form action="/chatroom"> -->
            <div class="form-control">
              <label for="username">Change Username</label>
              <span class="p-2"> <input
                
                id="username"
                type="text"
                name="username"
                placeholder="Enter username..."
                required
                style="border-radius: 20px; width:300px"
              > </span><span><button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-full"
          >Submit
          </button></span>
            </div>
            <div class="form-control">
              
              <label class="custom-file-upload" style="border-radius: 20px">
                 Change Avatar
                <div><input type="file" style=" width:315px"/><span><button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-full"
          >Submit
          </button></span></div>
               
              </label>
            </div>
            <label for="status">Status</label>
            <p class="text-black">{{status}}</p>
            <div class="columns-1" style="text-align: center; float: left;">
            <span class="p-1">Wins</span>
            <font-awesome-icon icon="award" />
            <p class="text-black">1</p>
            </div>
            <div class="columns-1" style="text-align: center; float: center;">
             <span class="p-1">Losses</span>
            <font-awesome-icon icon="skull-crossbones" />
            <p class="text-black">0</p>
            </div>
            <label for="status">Ranking</label>
            <p class="text-black">330</p>
            <!-- Stats (ladder level, achievements, and so forth) have to be displayed on the user profile.

Each user should have a Match History including 1v1 games, ladder, and anything else useful. Anyone who is logged in should be able to consult it. -->
        </main>
      </div>
    </body>
  </div>
</template>
<script lang="ts">
import { RouterLink, RouterView } from 'vue-router';
export default {

  data()
  {
    return {
      selectGameMode: false,
      matched: false,
      gameMode : '',
      name: '',
      status: ''
    };
  },
  async created () {
  let name: string = '';
  let status: string = '';
    await fetch('http://localhost:3000/user/me')
    .then(function(res){
      return res.json();
    })
    .then(function(data){
      name = data.name;
      status = data.status;
      console.log(data);
    });
    this.name = name;
    this.status = status;
    this.status = 'Online';

  },
}
</script>
<style src="../assets/chat.css">

@media (min-width: 1024px) {
  .chat {
    min-height: 100vh;
    align-items: center;
  }
}

.custom-file-upload {
    border: 1px solid #ccc;
    border-radius: 50%;
}
</style>
