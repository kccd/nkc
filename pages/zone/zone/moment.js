import { getDataById } from '../../lib/js/dataConversion';
import Moments from '../../lib/vue/zone/Moments';
import Home from '../../lib/vue/zone/views/Home';
import MomentDetail from '../../lib/vue/zone/views/MomentDetail';
import { getState } from '../../lib/js/state';
import { visitUrl } from '../../lib/js/pageSwitch';
import { getSocket } from '../../lib/js/socket';
import Bubble from '../../lib/vue/zone/Bubble';

// 初始化路由信息
const routes = [
  {
    name: 'Zone',
    path: '/z',
    component: Home,
  },
  {
    name: 'MomentDetail',
    path: '/z/m/:mid',
    component: MomentDetail,
  },
];
// 防止路由重复点击报错
const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch((err) => err);
};

const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior(to, from, savePosition) {
    if (savePosition) {
      window.scrollTo({
        top: savePosition.y,
        left: savePosition.x,
        behavior: 'smooth',
      });
    } else {
      return { x: 0, y: 0 };
    }
  },
});
router.afterEach((to, from) => {
  let title = '电波 - 科创网';
  const $domTab = document.getElementById('zone-tab');
  const $domEditor = document.getElementById('ZoneMomentEditor');
  const $domBack = document.getElementById('bubble-back');
  if (to.name === 'MomentDetail') {
    title = '电文详情';
    if ($domTab) {
      $domTab.style.display = 'none';
    }
    if ($domEditor) {
      $domEditor.style.display = 'none';
    }
    $domBack.style.display = 'block';
  } else {
    if ($domTab) {
      $domTab.style.display = 'block';
    }
    if ($domEditor) {
      $domEditor.style.display = 'block';
    }
    $domBack.style.display = 'none';
  }
  document.title = title;
});
// const { uid } = getState();
// const socket = getSocket();
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
    router,
    // components: {
    //   moments: Moments,
    //   bubble: Bubble,
    // },
    data: {
      // momentsData,
      // latestData: [],
      // //beforeLatestIds: [],
      // permissions,
      // avatars: [],
      // isApp,
      // showPadding: true,
    },
    // mounted() {
    //   if (uid) {
    //     this.connectZoneHomeRoom();
    //   }
    // },
    computed: {
      showPadding() {
        return this.$route.name === 'Zone';
      },
    },
    // methods: {
    //   refresh() {
    //     this.avatars = [];
    //     visitUrl(
    //       `${window.location.pathname}?t=m-${
    //         localStorage.getItem('zoneTab') || 'a'
    //       }`,
    //     );
    //   },
    //   scroll() {
    //     this.refresh();
    //   },
    //   joinRoom() {
    //     socket.emit('joinRoom', {
    //       type: 'zoneHome',
    //       data: {
    //         testID: 'testID',
    //       },
    //     });
    //   },
    //   connectZoneHomeRoom() {
    //     const self = this;
    //     if (socket.connected) {
    //       self.joinRoom();
    //     } else {
    //       socket.on('connect', () => {
    //         self.joinRoom();
    //       });
    //     }

    //     socket.on('zoneHomeMessage', ({ bubbleData }) => {
    //       const data = bubbleData;
    //       if (uid === data.uid || data.status !== 'normal') {
    //         return;
    //       }

    //       let avatarsArray = [...self.avatars];
    //       if (subUid) {
    //         const index = subUid.indexOf(data.uid);
    //         if (index !== -1 && subUid[index] !== uid) {
    //           avatarsArray.unshift(data.avatarUrl);
    //         }
    //       } else {
    //         avatarsArray.unshift(data.avatarUrl);
    //       }
    //       // 需要去重
    //       self.avatars = [...new Set(avatarsArray)];
    //     });
    //   },
    // },
  });
}
