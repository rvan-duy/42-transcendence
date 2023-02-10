// import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

// export const useConnectionStore = defineStore('connections', () => {
// 	let connection;
	
// //   const count = ref(0);
// //   const doubleCount = computed(() => count.value * 2);
//   function set(val: any) {
//     connection = val;
//   }

//   return { connection };
// });

export const useConnectionStore = defineStore('connections', {
  state: () => ({
    /* Socket for this server-client connection */
    connection: '',
  }),
  getters: {
    getConnection(state) {
      return state.connection;
    },
  },
  actions: {
    setSocket(val: any) {
      this.connection = val;
    },
  },
});
  