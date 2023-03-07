import { createRouter, createWebHistory } from 'vue-router';
import privateRoutes from './private';
import LoginView from '@/views/LogInView.vue';

/*
 * TODO's:
 * 1. Add a beforeEnter hook to routes that require authentication
 *  - import { checkAuth } from '@/auth';
 *  - import HomeView from '@/views/HomeView.vue';
 *  - beforeEnter: checkAuth
 */

// usefull link: https://itnext.io/vue-router-99e334094362

/*
 * This is the router for the application, it is used to navigate between
 * different views.
 *
 * Important note: you are forced to login before you can access any other
 * route. This is done by adding a beforeEnter hook to the routes that require
 * authentication. This hook checks if the user is authenticated, if not the
 * user is redirected to the login page.
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
        loginPage: true // probaly needed, or not idk we'll see
      },
    }
  ].concat(privateRoutes), // private routes are in a separate file for readability
});

router.beforeEach((to, from, next) => {
  // user is not logged in and is trying to access a private route
  // user is not logged in and is trying to access a login route
  // user is logged in and is trying to access a public route
  // user is logged in and is trying to access a private route
  next();
});

export default router;