import { getDataById } from '../../lib/js/dataConversion';
import Home from '../../lib/vue/zone/views/Home';
import MomentDetail from '../../lib/vue/zone/views/MomentDetail';
import Vuex from 'vuex';
import EditorPage from '../../lib/vue/zone/views/Editor.vue';
import EditorHistoryPage from '../../lib/vue/zone/views/EditorHistory.vue';

window.Vue.use(Vuex);
//自定义长按事件
window.Vue.directive('long-press', {
  bind(el, binding) {
    if (typeof binding.value !== 'function') {
      console.warn(`Expect a function, got ${typeof binding.value}`);
      return;
    }

    let pressTimer = null;

    const start = (e) => {
      if (e.type === 'click' && e.button !== 0) {
        return;
      }

      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          binding.value(e);
        }, 1000); // 长按时间为 1000 毫秒
      }
    };

    const cancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start);
    el.addEventListener('click', cancel);
    el.addEventListener('mouseout', cancel);
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
  },
});

const zoneElementId = 'zoneApp';
$(function () {
  const element = document.getElementById(zoneElementId);
  if (element) {
    initZoneVueApp();
  }
});

function initZoneVueApp() {
  const {
    momentsData,
    permissions,
    subUid,
    tab,
    zoneTab,
    type,
    paging,
    zoneTypes,
    articlesPanelData,
    latestZoneArticlePanelStyle,
    currentPage,
  } = getDataById('data');
  const store = new Vuex.Store({
    state: {
      momentsData,
      permissions,
      subUid,
      tab,
      zoneTab,
      type,
      paging,
      zoneTypes,
      articlesPanelData,
      latestZoneArticlePanelStyle,
      currentPage,
      savePosition: {
        y: 0,
        x: 0,
      },
    },
    mutations: {
      setMomentsData(state, data) {
        state.momentsData = data;
      },
      setArticlesPanelData(state, data) {
        state.articlesPanelData = data;
      },
      setLatestZoneArticlePanelStyle(state, data) {
        state.latestZoneArticlePanelStyle = data;
      },
      setPaging(state, paging) {
        state.paging = paging;
      },
      setTab(state, tab) {
        state.tab = tab;
      },
      setType(state, type) {
        state.type = type;
      },
      setPermissions(state, p) {
        state.permissions = p;
      },
      setZoneTab(state, zoneTab) {
        state.zoneTab = zoneTab;
      },
      setZoneTypes(state, zoneTypes) {
        state.zoneTypes = zoneTypes;
      },
      setSavePosition(state, position) {
        state.savePosition = position;
      },
    },
  });
  // 初始化路由信息
  const routes = [
    {
      name: 'Zone',
      path: '/z',
      component: Home,
      meta: { title: '电波' },
    },
    {
      name: 'MomentDetail',
      path: '/z/m/:mid',
      component: MomentDetail,
      meta: { title: '电文详情' },
    },
    {
      name: 'MomentEditor',
      path: '/z/editor/rich',
      component: EditorPage,
      meta: { title: '电文编辑器' },
    },
    {
      name: 'MomentEditorHistory',
      path: '/z/editor/rich/history',
      component: EditorHistoryPage,
      meta: { title: '电文历史' },
    },
  ];
  // 防止路由重复点击报错
  const originalPush = window.VueRouter.prototype.push;
  const originalReplace = window.VueRouter.prototype.replace;
  window.VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
  };
  window.VueRouter.prototype.replace = function replace(location) {
    return originalReplace.call(this, location).catch((err) => err);
  };

  const router = new window.VueRouter({
    mode: 'history',
    routes,
    scrollBehavior(to, from, savePosition) {
      if (savePosition) {
        // window.scrollTo({
        //   top: savePosition.y,
        //   left: savePosition.x,
        //   behavior: 'smooth',
        // });
        return savePosition;
      } else {
        return { x: 0, y: 0 };
      }
    },
  });
  router.beforeEach((to, from, next) => {
    if (to.name === 'MomentDetail' && from.name === 'Zone') {
      const scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      store.commit('setSavePosition', {
        mid: '',
        x: 0,
        y: scrollPosition,
      });
    }
    if (to.meta && to.meta.title) {
      document.title = to.meta.title;
    }
    next();
  });
  router.afterEach((to, from) => {});
  const app = new window.Vue({
    el: `#${zoneElementId}`,
    router,
    store,
    data: {},
    computed: {},
  });
}
