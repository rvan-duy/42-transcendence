import { createRouter, createWebHistory } from 'vue-router';

/*
 * TODO's:
 * 1. Add a beforeEnter hook to routes that require authentication
 *  - import { checkAuth } from '@/auth';
 *  - beforeEnter: checkAuth
 * 2. Props to the ChatRoomView? <- Lindsay
 */
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/ChatView.vue'),
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('@/views/GameView.vue'),
  },
  {
    path: '/chatroom',
    name: 'chatroom',
    component: () => import('@/views/ChatRoomView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LogInView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;