<script setup lang="ts">
import { getBackend, postBackendWithQueryParams } from '@/utils/backend-requests';
</script>

<template>
  <div class="chat">
    <body>
      <div class="join-container">
        <header class="join-header">
          <div style="text-align: center;">
            <span>
              <img
                :src="String(getUserPicture())"
                width="50"
                height="50"
                style="border-radius: 50%; display:block; margin-left: auto; margin-right: auto;"
                class="w-11 h-11 shrink-0 grow-0 rounded-full"
              >
              <figcaption class="text-white text-m">
                {{ name }}
              </figcaption>
              <button
                v-if="relationStatus === RelationshipStatus.Strangers"
                class="bg-blue-300 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded-full m-2"
                @click="addFriend()"
              >
                Add as friend
              </button>
              <button
                v-else-if="relationStatus === RelationshipStatus.Friends"
                class="bg-blue-300 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded-full m-2"
                @click="removeFriend()"
              >
                Remove as friend
              </button>
              <button
                v-else-if="relationStatus === RelationshipStatus.Pending"
                class="bg-blue-300 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded-full m-2"
                @click="removeFriend()"
              >
                Pending (cancel)
              </button>
              <button
                v-else-if="relationStatus === RelationshipStatus.Accept"
                class="bg-blue-300 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded-full m-2"
                @click="addFriend()"
              >
                Accept
              </button>
            </span>
          </div>
        </header>
        <main class="join-main">
          <button
            v-if="relationStatus === RelationshipStatus.Blocked"
            class="bg-blue-500 border border-red-500 hover:bg-red-400 text-white text-xs py-1 px-2 rounded-full"
            style="float: right"
            @click="unblockUser()"
          >
            Unblock User
          </button>
          <button
            v-else
            class="bg-blue-500 border border-red-500 hover:bg-red-400 text-white text-xs py-1 px-2 rounded-full"
            style="float: right"
            @click="blockUser()"
          >
            Block User
          </button>
          <button
            class="bg-blue-300 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded-full mr-2"
            style="float: right"
            @click="gotoDM()"
          >
            Direct message
          </button>
          <label for="status">Status</label>
          <p class="text-black">
            {{ status }}
          </p>
          <label for="elo">Elo</label>
          <p class="text-black">
            {{ elo }}
          </p>
          <div
            class="columns-1"
            style="text-align: center; float: left;"
          >
            <span class="p-1">Wins</span>
            <font-awesome-icon icon="award" />
            <p class="text-black">
              {{ wins }}
            </p>
          </div>
          <div
            class="columns-1"
            style="text-align: center; float: center;"
          >
            <span class="p-1">Losses</span>
            <font-awesome-icon icon="skull-crossbones" />
            <p class="text-black">
              {{ losses }}
            </p>
          </div>
          <label for="history">Match History</label>
          <p
            v-if="matches.length === 0"
            class="text-black"
          >
            No matches played yet!
          </p>
          <div v-else-if="matches_played > 0">
            <div
              v-for="match in matches"
              :key="match.id"
            >
              <span
                v-if="match.winnerId === id"
                class="text-black font-bold"
              >WON</span>
              <span
                v-else
                class="text-black font-bold"
              >LOST</span>
              <span class="text-black"> against </span>
              <span
                v-if="match.players[0]?.name === name"
                class="text-black font-bold"
              >{{
                match.players[1]?.name
              }}</span>
              <span
                v-else
                class="text-black font-bold"
              >{{ match.players[0]?.name }}</span>
            </div>
          </div>
        </main>
      </div>
    </body>
  </div>
</template>

<script lang="ts">
enum RelationshipStatus {
	Friends = 'FRIENDS',
	Pending = 'PENDING',
	Accept = 'ACCEPT',
	Strangers = 'STRANGERS',
	Blocked = 'BLOCKED',
}

enum Debug {
  ENABLED = 0,
}

interface User {
	id: number;
	intraId: number;
	name: string;
	status: string;
	pending: number[];
	friends: number[];
	blocked: number[];
	elo: number;
	twoFactor: boolean;
	secret: string;
  losses: number;
}

export default {
  data() {
    return {
      me: {} as User,
      them: {} as User,
      relationStatus: RelationshipStatus.Strangers,
      id: 0,
      name: '',
      status: 'Online',
      matches_played: 0,
      newUsername: '',
      elo: 0,
      matches: [
        { id: 0, score: [] as number[], players: [] as User[], winnerId: 0 }
      ],
      myFriends: [],
      wins: 0 as number,
      losses: 0 as number,
    };
  },
  async created() {
    await getBackend('user/me')
      .then(res => res.json())
      .then(data => {
        if (Debug.ENABLED)
          console.log(data);
        this.me = data;
        this.myFriends = data.friends;
      });
    await getBackend('user/id/' + this.$route.query.id + '?withGames=true&withStatus=true')
      .then(res => res.json())
      .then(data => {
        this.them = data;
        this.id = data.id,
        this.name = data.name;
        this.elo = Math.round(data.elo);
        this.matches = data.games;
        this.status = data.status;
        this.wins = data.wins;
        this.losses = data.losses;
        this.relationStatus = this.relationshipStatus();
      })
      .catch(err => {
        console.log(err);
        this.$router.push('/404');
      });
  },
  methods: {
    goTo(route: string) {
      this.$router.push('/' + route);
    },
    relationshipStatus(): RelationshipStatus {
      if (this.me.blocked.includes(this.them.id))
        return(RelationshipStatus.Blocked);
      if (this.myFriends.includes(Number(this.$route.query.id)))
        return (RelationshipStatus.Friends);
      if (this.me.pending.includes(this.them.id))
        return (RelationshipStatus.Accept);
      if (this.them.pending.includes(this.me.id))
        return (RelationshipStatus.Pending);
      return (RelationshipStatus.Strangers);
    },
    async addFriend() {
      const ret = await postBackendWithQueryParams('user/befriend', undefined, { id: Number(this.$route.query.id) });
      if (ret.status === 'friend')
        this.relationStatus = RelationshipStatus.Friends;
      else if (ret.status === 'pending')
        this.relationStatus = RelationshipStatus.Pending;
    },
    async blockUser() {
      if (Debug.ENABLED)
        console.log(`blocking: ${Number(this.$route.query.id)}`);
      await postBackendWithQueryParams('user/block', undefined, { id: Number(this.$route.query.id) });
      this.relationStatus = RelationshipStatus.Blocked;
    },
    async unblockUser() {
      if (Debug.ENABLED)
        console.log(`unblocking: ${Number(this.$route.query.id)}`);
      await postBackendWithQueryParams('user/unblock', undefined, { id: Number(this.$route.query.id) });
      const index = this.me.blocked.indexOf(Number(this.$route.query.id));
      this.me.blocked.splice(index, 1);
      this.relationStatus = this.relationshipStatus();
    },
    async removeFriend() {
      await postBackendWithQueryParams('user/unfriend', undefined, { id: Number(this.$route.query.id) });
      this.relationStatus = RelationshipStatus.Strangers;
    },
    getUserPicture(): string {
      return (`http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/public/user_${Number(this.$route.query.id)}.png`);
    },
    async gotoDM() {
      const dmChat = await getBackend('chat/directMsg?friendId=' + this.id.toString());
      if (Debug.ENABLED)
        console.log('first look', dmChat);
      const chat = await dmChat.json();
      if (Debug.ENABLED)
        console.log('private chat', chat);
      this.goTo('chatroom/' + this.name + '?id=' + chat.id.toString());
    }
  }
};
</script>

<style src="../assets/chat.css">
@media (min-width: 1024px) {
	.chat {
		min-height: 100vh;
		align-items: center;
	}
}

.custom-file-upload {
	border: 1px solid #ccc;
	border-radius: 50%;
}
</style>
