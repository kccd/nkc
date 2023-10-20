import { getDataById } from '../../lib/js/dataConversion';
import Moments from '../../lib/vue/zone/Moments';
import { getState } from '../../lib/js/state';
import { visitUrl } from '../../lib/js/pageSwitch';
import { getSocket } from '../../lib/js/socket';
import Bubble from '../../lib/vue/zone/Bubble';
import { hasScrollBar } from '../../lib/js/scrollBar';

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
  const { momentsData, permissions, subUid } = getDataById('data');
  const app = new Vue({
    el: `#${momentElementId}`,
    components: {
      moments: Moments,
      bubble: Bubble,
    },
    data: {
      momentsData,
      latestData: [],
      permissions,
      avatars: [],
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
        this.avatars = [];
        if (hasScrollBar) {
          window.scroll({ top: 0, left: 0, behavior: 'smooth' });
        }
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

        socket.on('zoneHomeMessage', ({ momentsData }) => {
          const data = momentsData[0];
          if (uid === data.uid || data.status !== 'normal') {
            return;
          }

          let avatarsArray = [...self.avatars];
          let latestArray = [...self.latestData];
          if (subUid) {
            const index = subUid.indexOf(data.uid);
            if (index !== -1 && subUid[index] !== uid) {
              avatarsArray.unshift(data.avatarUrl);
              latestArray.unshift(data);
            }
          } else {
            avatarsArray.unshift(data.avatarUrl);
            latestArray.unshift(data);
          }
          self.latestData = [...latestArray];
          // 需要去重
          self.avatars = [...new Set(avatarsArray)];
        });
      },
    },
  });
}
