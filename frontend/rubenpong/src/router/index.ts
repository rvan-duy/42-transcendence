import { createRouter, createWebHistory } from 'vue-router';
import LogInView from '@/views/LogInView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LogInView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
    },
    {
      path: '/matchmaking',
      name: 'matchmaking',
      component: () => import('@/views/MatchMakingView.vue'),
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
      //   props: route=> ({ username: route.query.username, room: route.query.room})
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
  ],
});

export default router;
