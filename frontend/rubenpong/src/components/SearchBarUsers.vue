<script setup lang="ts">
import { ref } from "vue";
let input = ref("");
const users = [{name: 'Ruben1', pic: '', id: 1}, {name: 'Ruben2', pic: '', id: 2}, {name: 'Dagmar', pic: '',  id: 3}, {name: 'Oswin', pic: '',  id: 4}, {name: 'Lindsay', pic: '', id: 5}];
function filteredList() {
  if (input.value !== "")
    return users.filter((user) =>
      user.name.toLowerCase().includes(input.value.toLowerCase())
    );
}
</script>

<template>
<input
    type="text" v-model="input" placeholder="Search users..." 
                VALYE
                required
                style="border-radius: 20px; width:300px; font-size: 12px; height: 35px; margin-left: auto; margin-right: auto;"
              > 
    <div class="item fruit" style="text-align: center;" v-for="user in filteredList()" :key="user">
    <button class="btn m-1 p-0" @click="goTo('otheruser/' + user.name)">{{ user.name }}</button>
  </div>
  <div class="item error" style="text-align: center;" v-if="input && !filteredList().length">
    <p>No results found!</p>
  </div>
</template>


<script lang="ts">
export default {
    methods: {
        goTo(route: string) {
      // if (isAuthenticated) {
      //   this.$router.push('/dashboard')
      // } else {
      //   this.$router.push('/login')
      console.log('/' + route + '?id=3');
      
      this.$router.push('/' + route + '?id=3')
      },
    // createChat()
    // {
    //   this.chatCreate = true;
    // }
    },
    }

</script>

<style>

input {
  display: block;
  width: 350px;
  background: white url("assets/search-icon.svg") no-repeat 15px center;
  background-size: 15px 15px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
    rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}

</style>
