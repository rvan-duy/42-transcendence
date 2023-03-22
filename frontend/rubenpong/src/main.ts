import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import './assets/main.css';
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core';

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* import specific icons */
// import { faUserSecret } from '@fortawesome/free-solid-svg-icons'

import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
// import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
// import { faFile as faFileRegular } from '@fortawesome/free-regular-svg-icons'
library.add(fas);
library.add(far);
/* add icons to the library */
// library.add(fas, far)

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component('FontAwesomeIcon', FontAwesomeIcon);

app.mount('#app');

console.log(import.meta.env); // debug
