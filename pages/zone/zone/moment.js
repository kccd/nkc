import { getDataById } from '../../lib/js/dataConversion';
import Moments from '../../lib/vue/zone/Moments';
import { getState } from '../../lib/js/state';
import { visitUrl } from '../../lib/js/pageSwitch';
import { getSocket } from '../../lib/js/socket';
import Bubble from '../../lib/vue/zone/Bubble';
import { hasScrollBar } from '../../lib/js/scrollBar';
import { nkcAPI } from '../../lib/js/netAPI';
import { sweetError } from '../../lib/js/sweetAlert';

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
      beforeLatestIds: [],
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
        // 请求推送的数据
        const self = this;
        const { beforeLatestIds } = this;
        let latestArray = this.latestData;
        // 得到数据后进行追加到最新数据中，清空待请求数据的ids
        let arrayString = '';
        for (let index in beforeLatestIds) {
          arrayString += `momentIds=${beforeLatestIds[index]}&`;
        }
        nkcAPI(`/api/v1/zone/moment?${arrayString}`, `GET`)
          .then((res) => {
            latestArray.unshift(...res.data);
            self.latestData = latestArray;
          })
          .catch((err) => {
            sweetError(err);
          });
        this.avatars = [];
        self.beforeLatestIds = [];
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

        socket.on('zoneHomeMessage', ({ bubbleData }) => {
          const data = bubbleData;
          if (uid === data.uid || data.status !== 'normal') {
            return;
          }

          let avatarsArray = [...self.avatars];
          let latestArray = [...self.beforeLatestIds];
          if (subUid) {
            const index = subUid.indexOf(data.uid);
            if (index !== -1 && subUid[index] !== uid) {
              avatarsArray.unshift(data.avatarUrl);
              latestArray.unshift(data.momentId);
            }
          } else {
            avatarsArray.unshift(data.avatarUrl);
            latestArray.unshift(data.momentId);
          }
          self.beforeLatestIds = [...latestArray];
          // 需要去重
          self.avatars = [...new Set(avatarsArray)];
        });
      },
    },
  });
}
