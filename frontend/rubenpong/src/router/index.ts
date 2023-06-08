import LoginView from '@/views/LoginView.vue';
import TwoFactorView from '@/views/TwoFactorView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import privateRoutes from './private';
import { createRouter, createWebHistory } from 'vue-router';
import { isLoggedIn } from './auth';
import { HttpStatus } from '@nestjs/common';

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
    },
    {
      path: '/2fa',
      name: '2fa',
      component: TwoFactorView,
      meta: {
        public: true,
        loginPage: false
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: NotFoundView,
      meta: {
        public: true,
        loginPage: false
      }
    }
  ].concat(privateRoutes), // private routes are in a separate file for readability
});

/*
 * This hook is called before each route is navigated to.
 */
router.beforeEach(async (to, from, next) => {
  const loggedInCode: number = await isLoggedIn();
  console.log('loggedInCode: ' + loggedInCode);

  /*
   * This can probably done more elegantly, but it works for now.
  */

  if (loggedInCode === null) {
    return next('/login');
  }

  if (to.meta.public === true) {
    return next();
  }

  if (loggedInCode === HttpStatus.FORBIDDEN) {
    return next('/2fa');
  }

  if (loggedInCode === HttpStatus.UNAUTHORIZED) {
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
