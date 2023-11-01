import { getDataById } from '../../lib/js/dataConversion';
import Moments from '../../lib/vue/zone/Moments';
import { getState } from '../../lib/js/state';
import { visitUrl } from '../../lib/js/pageSwitch';
import { getSocket } from '../../lib/js/socket';
import Bubble from '../../lib/vue/zone/Bubble';

const { uid } = getState();
const socket = getSocket();
// const bubbleData = getDataById('bubbleData');
const momentElementId = 'ZoneMoments';
$(function () {
  const element = document.getElementById(momentElementId);
  if (element) {
    initMomentVueApp();
  }
});

function initMomentVueApp() {
  const { momentsData, permissions, subUid, isApp } = getDataById('data');
  const app = new Vue({
    el: `#${momentElementId}`,
    components: {
      moments: Moments,
      bubble: Bubble,
    },
    data: {
      momentsData,
      latestData: [],
      //beforeLatestIds: [],
      permissions,
      avatars: [],
      isApp,
    },
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
    },
  });
}
