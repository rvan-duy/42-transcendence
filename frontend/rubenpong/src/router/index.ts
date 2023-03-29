import { createRouter, createWebHistory } from 'vue-router';
import privateRoutes from './private';
import LoginView from '@/views/LoginView.vue';
import { isLoggedIn } from './auth';

// usefull link: https://itnext.io/vue-router-99e334094362

/*
 * This is the router for the application, it is used to navigate between
 * different views.
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        public: true,
        loginPage: true
      }
    }
  ].concat(privateRoutes), // private routes are in a separate file for readability
});

/*
 * This hook is called before each route is navigated to.
 */
router.beforeEach(async (to, from, next) => {
  const userIsLoggedIn: boolean = await isLoggedIn();

  if (userIsLoggedIn === false) {
    if (to.meta.loginPage === true) {
      return next();
    }
    else {
      return next('/login');
    }
  }
  else {
    if (to.meta.loginPage === true) {
      return next('/');
    }
    else {
      return next();
    }
  }
});

export default router;
