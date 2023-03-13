import { createRouter, createWebHistory } from 'vue-router';
import { auth } from './auth';
import privateRoutes from './private';
import LoginView from '@/views/LoginView.vue';

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
        loginPage: true // probaly needed, or not idk we'll see
      },
    },
    {
      path: '/',
      name: 'home',
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
router.beforeEach((to, from, next) => {
  const userIsLoggedIn: boolean = auth.isLoggedIn();
  const pageIsPublic: boolean = to.meta.public as boolean;
  const pageIsLoginPage: boolean = to.meta.loginPage as boolean;
  
  if (userIsLoggedIn) {
    if (pageIsLoginPage)
      next('/');
    else
      next();
  } else {
    if (pageIsPublic)
      next();
    else
      next('/login');
  }
});

export default router;
