import Chat from '../lib/vue/message/Chat';
import Login from '../lib/vue/Login';
import {RNOpenLoginPage, RNSyncPageInfo, RNToChat} from "../lib/js/reactNative";
import {getState} from "../lib/js/state";
import UserDraw from "../lib/vue/publicVue/userDraw/UserDraw";
import FloatUserPanel from "../lib/vue/FloatUserPanel";
import {
  initAppGlobalClickLinkEvent,
  initGlobalClickEvent,
  initGlobalLongPressEvent,
  initGlobalMouseOverEvent
} from "./event";
import {initUserPanel} from "./userPanel";
let userPanel;
$(() => {
  userPanel = initUserPanel();
})
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
    "float-user-panel": FloatUserPanel
  },
  computed: {
    hasLogged() {
      return !!this.uid;
    }
  },
  mounted() {
    initGlobalClickEvent();
    initGlobalLongPressEvent();
    initAppGlobalClickLinkEvent();
    initGlobalMouseOverEvent();
    this.$refs.floatUserPanel.initPanel();
    $(() => {
      // 这里的代码会在页面准备就绪之后执行
      RNSyncPageInfo({uid});
    });
  },
  methods: {
    //更新右侧抽屉消息条数
    updateNewMessageCount(count) {
      this.$refs.userRightDraw.updateNewMessageCount(count);
      userPanel.updateNewMessageCount(count);
    },
    showUserPanel() {
      userPanel.showDraw();
    },
    //
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

