<template lang="pug">
  div 
    bubble(@scroll='scroll' :avatars="avatars" v-if='updated' :isapp='isApp')
    moments(@handleDetail='handleDetail' :latests="latestData" :moments="momentsData" :permissions="permissions" v-if='momentsData.length > 0')
    .p-t-5.p-b-5.text-center(v-else) 空空如也~
</template>

<style lang="less" scoped></style>

<script>
import { getDataById } from '../../../js/dataConversion';
import { visitUrl } from '../../../js/pageSwitch';
import { getSocket} from '../../../js/socket';
import { getState } from '../../../js/state';
import Bubble from '../Bubble.vue';
import Moments from '../Moments.vue';

// import {momentVote} from "../../js/zone/vote";
const { uid } = getState();
const socket = getSocket();
const { momentsData, permissions, subUid, isApp } = getDataById('data');
export default {
  components: {
    moments: Moments,
    bubble: Bubble,
  },
  // props: ['data', 'focus', 'permissions', 'mode', 'type'],
  data: () => ({
    momentsData,
    latestData: [],
    //beforeLatestIds: [],
    permissions,
    avatars: [],
    isApp,
  }),
  mounted() {
    if (uid) {
      this.connectZoneHomeRoom();
    }
  },
  computed: {
    updated() {
      return this.avatars.length > 0;
    },
  },
  destroyed() {},
  methods: {
    refresh() {
      this.avatars = [];
      visitUrl(
        `${window.location.pathname}?t=m-${
          localStorage.getItem('zoneTab') || 'a'
        }`,
      );
    },
    scroll() {
      this.refresh();
    },
    joinRoom() {
      socket.emit('joinRoom', {
        type: 'zoneHome',
        data: {
          testID: 'testID',
        },
      });
    },
    connectZoneHomeRoom() {
      const self = this;
      if (socket.connected) {
        self.joinRoom();
      } else {
        socket.on('connect', () => {
          self.joinRoom();
        });
      }

      socket.on('zoneHomeMessage', ({ bubbleData }) => {
        const data = bubbleData;
        if (uid === data.uid || data.status !== 'normal') {
          return;
        }

        let avatarsArray = [...self.avatars];
        if (subUid) {
          const index = subUid.indexOf(data.uid);
          if (index !== -1 && subUid[index] !== uid) {
            avatarsArray.unshift(data.avatarUrl);
          }
        } else {
          avatarsArray.unshift(data.avatarUrl);
        }
        // 需要去重
        self.avatars = [...new Set(avatarsArray)];
      });
    },
    handleDetail(id){
      // console.log('22222',id);
      this.$router.push({
          name: 'MomentDetail',
          params: {
            mid:id,
          }
        });
    }
  },
};
</script>
