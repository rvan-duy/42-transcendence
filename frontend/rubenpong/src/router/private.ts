import AboutView from '@/views/AboutView.vue';
import ChatView from '@/views/ChatView.vue';
import ChatRoomView from '@/views/ChatRoomView.vue';
import GameView from '@/views/GameView.vue';
import LogoutView from '@/views/LogoutView.vue';
import UserView from '@/views/UserView.vue';
import OtherUserView from '@/views/OtherUserView.vue';

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
  {
    path: '/logout',
    name: 'logout',
    component: LogoutView,
  },
  {
    path: '/user',
    name: 'user',
    component: UserView,
  },
  {
    path: '/otheruser',
    name: 'otheruser',
    component: OtherUserView,
  },
];

export default routes.map(route => {
  return { ...route, meta: { public: false, LoginPage: false } };
});
