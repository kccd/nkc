import Chat from '../lib/vue/message/Chat';
import Login from '../lib/vue/Login';
import UserRightDraw from "../lib/vue/publicVue/userDraw/UserRightDraw";
import {RNOpenLoginPage, RNToChat} from "../lib/js/reactNative";
import {getState} from "../lib/js/state";
import initUserNav from "./userPanel";
import UserDraw from "../lib/vue/publicVue/userDraw/UserDraw";
const {isApp, platform, uid} = getState();

window.RootApp = new Vue({
  el: '#rootApp',
  data: {
    uid,
    isReactNative: isApp && platform === 'reactNative',
  },
  components: {
    'chat': Chat,
    'login': Login,
    "user-draw": UserDraw,
  },
  computed: {
    hasLogged() {
      return !!this.uid;
    }
  },
  mounted() {
    // this.openChatPanel()
    // this.openLoginPanel();
  },
  methods: {
    openLoginPanel(type) {
      if(this.isReactNative) {
        RNOpenLoginPage(type);
      } else {
        this.$refs.login.open(type);
      }
    },
    openChatPanel(uid, name = '', type = 'UTU') {
      if(this.isReactNative) {
        RNToChat({
          uid: uid,
          name: name,
          type: type
        });
      } else {
        this.$refs.chat.showMessagePanel(uid);
      }
    },
    //打开右侧抽屉
    openDraw(type) {
      this.$refs.userDraw.openDraw(type);
    },
    //关闭抽屉
    closeDraw(type) {
      this.$refs.userDraw.colseDraw(type);
    }
  }
});


/*
* 禁止body滚动 显示悬浮div时可用
* @author pengxiguaa 2019-5-14
* */
function stopBodyScroll (isFixed) {
  var bodyEl = document.body;
  if (isFixed) {
    nkcDrawerBodyTop = window.scrollY;
    bodyEl.style.position = 'fixed';
    bodyEl.style.top = -nkcDrawerBodyTop + 'px';
  } else {
    bodyEl.style.position = '';
    bodyEl.style.top = '';
    window.scrollTo(0, nkcDrawerBodyTop) // 回到原先的top
  }
}

Object.assign(window, {
  initUserNav,
  toggleNKCDrawer
})
