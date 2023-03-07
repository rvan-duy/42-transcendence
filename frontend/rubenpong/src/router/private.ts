import AboutView from '@/views/AboutView.vue';
import ChatView from '@/views/ChatView.vue';
import ChatRoomView from '@/views/ChatRoomView.vue';
import GameView from '@/views/GameView.vue';

const routes = [
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView,
  },
  {
    path: '/chatroom',
    name: 'chatroom',
    component: ChatRoomView,
  },
  {
    path: '/game',
    name: 'game',
    component: GameView,
  },
];

export default routes.map(route => {
  return { ...route, meta: { public: false } };
});