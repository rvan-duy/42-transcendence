<template>
  <input
    v-model="input"
    type="text"
    placeholder="Search users..."
    VALYE
    required
    style="border-radius: 20px; width:300px; font-size: 12px; height: 35px; margin-left: auto; margin-right: auto;"
  >
  <div
    v-for="user in filteredList()"
    :key="user"
    class="item fruit"
    style="text-align: center;"
  >
    <button
      class="btn m-1 p-0"
      @click="goTo('otheruser/' + user.name, user.id)"
    >
      {{ user.name }}
    </button>
  </div>
  <div
    v-if="input && !filteredList()?.length"
    class="item error"
    style="text-align: center;"
  >
    <p>No results found!</p>
  </div>
</template>

<script lang="ts">
import { getBackend } from '@/utils/backend-requests';

interface User {
  id: number;
  name: string;
}

export default {
  data() {
    return {
      allUsers: [] as User[],
      input: '',
      myId: 0
    };
  },
  async created() {
    await getBackend('user/all').then(res => res.json())
      .then((data: User[]) => {
        this.allUsers = data;
      });
    getBackend('user/me')
      .then((res) => { res.json()
        .then((data) => {
          this.myId = data.id;
        });
      });
  },
  methods: {
    goTo(route: string, id: number) {
      if (id === this.myId)
        this.$router.push('/user');
      else
        this.$router.push('/' + route + '?id=' + id);
    },
   
    filteredList() {
      if (this.input !== '') {
        return this.allUsers.filter((user) =>
          user.name.toLowerCase().includes(this.input.toLowerCase())
        );
      }
    },
  },
};
</script>

<style>
input {
  display: block;
  width: 350px;
  background: white;
  background-size: 15px 15px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
    rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}
</style>
