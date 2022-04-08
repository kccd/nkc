import Chat from '../lib/vue/message/Chat';
import Login from '../lib/vue/Login';
import {RNOpenLoginPage, RNToChat} from "../lib/js/reactNative";
import {getState} from "../lib/js/state";
import UserDraw from "../lib/vue/publicVue/userDraw/UserDraw";
import UserFloatPanel from "../lib/vue/UserFloatPanel";
import SubscribeTypes from "../lib/vue/SubscribeTypes";
import FloatForumPanel from "../lib/vue/forum/FloatForumPanel";
import {
  initAppGlobalClickLinkEvent,
  initGlobalClickEvent,
  initGlobalLongPressEvent,
  initGlobalMouseOverEvent
} from "./event";
import {initUserPanel} from "./userPanel";
import {subUsers} from "../lib/js/subscribe";
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
    "user-float-panel": UserFloatPanel,
    "float-forum-panel": FloatForumPanel,
    "subscribe-types": SubscribeTypes
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
    $(() => {
      // 这里的代码会在页面准备就绪之后执行
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
    },
    //关注取关用户
    subscribe(options) {
      const {uid, sub} = options;
      const self = this;
      if(sub) {
        self.$refs.subscribeTypes.open((cid) => {
          subUsers(uid, sub, [...cid])
            .then(() => {
              sweetSuccess('关注成功');
              self.$refs.subscribeTypes.close();
            })
            .catch(err => {
              sweetError(err);
            })
        }, {
        })
      } else {
        subUsers(uid, sub)
          .then(()=>{
            sweetSuccess('取关成功');
          })
          .catch(err => {
            sweetError(err);
          })
      }
    }
  }
});

