import ChatView from '@/views/ChatView.vue';
import ChatRoomView from '@/views/ChatRoomView.vue';
import GameView from '@/views/GameView.vue';
import LogoutView from '@/views/LogoutView.vue';
import UserView from '@/views/UserView.vue';
import OtherUserView from '@/views/OtherUserView.vue';
import SearchUserView from '@/views/SearchUserView.vue';
import AuthenticationSettingsView from '@/views/AuthenticationSettingsView.vue';
import FriendsView from '@/views/FriendsView.vue';
import HomeView from '@/views/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView,
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
    path: '/otheruser/:id',
    name: 'otheruser',
    component: OtherUserView,
    props: { id: null }
  },
  {
    path: '/chatroom/:id',
    name: 'chatroom',
    component: ChatRoomView,
    props: { id: null }
  },
  {
    path: '/searchuser',
    name: 'searchuser',
    component: SearchUserView,
  },
  {
    path: '/authentication-settings',
    name: 'authentication-settings',
    component: AuthenticationSettingsView,
  },
  {
    path: '/friends',
    name: 'friends',
    component: FriendsView,
  },
  {
    path: '/backend',
    name: 'backend',
    beforeEnter() {
      location.href = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/api`;
    },
  },
];

export default routes.map(route => {
  return { ...route, meta: { public: false, LoginPage: false } };
});
