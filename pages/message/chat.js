
import Message from './message.2.0.vue';
import {getScrollBarWidth, hasScrollBar} from "../lib/js/scrollBar";
import {setAsDraggableElement} from "../lib/js/draggable";
import {getFromLocalStorage, updateInLocalStorage, saveToLocalStorage} from "../lib/js/localStorage";
import {debounce} from "../lib/js/execution";

const messageAppId = '#messageApp';
const socketContainer = '#socketContainer';
const localStorageKey = 'NKC_CHAT_2';

const messageApp = new Vue({
  el: messageAppId,
  data: {
    showPanel: false,
    mouseOver: false,
    repeatOver: false,

    appName: '喵喵',

    containerInfo: {
      left: 0,
      top: 0,

      wideHeight: 0,
      wideWidth: 0,

      narrowHeight: 0,
      narrowWidth: 0,
    },
    containerMode: 'normal', // minimize, maximize
    defaultInfo: {
      mode: 'wide',
      containerMode: 'normal',

      wideHeight: 600,
      wideWidth: 840,

      narrowHeight: 500,
      narrowWidth: 320,

      top: 100,
      left: 100,
    },
    mode: 'wide',

    socket: socket,

    // 是否最小化
    minimize: false,
    maximize: false,

    newMessageCount: 0,

    audio: null,
  },
  components: {
    Message
  },
  computed: {
    boxContent() {
      const {newMessageCount} = this;
      if(newMessageCount === 0) {
        return '';
      } else {
        return `${newMessageCount} 条新消息`;
      }
    },
    modeName() {
      const {mode} = this;
      return mode === 'wide'? '简洁模式': '经典模式';
    },
    containerStyle() {
      const {containerMode, mode} = this;
      if(containerMode === 'minimize') {
        return `left: 0; top: 0; width: 0; height: 0;`;
      } else if(containerMode === 'maximize') {
        return `left: 0; top: 0; width: 100%; height: 100%;`;
      } else {
        const {left, top} = this.containerInfo;
        const height = this.containerInfo[`${mode}Height`];
        const width = this.containerInfo[`${mode}Width`];
        return `left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;`;
      }
    },
    fixed() {
      return this.containerMode !== 'normal';
    },
  },
  mounted() {
    this.initContainer();
    this.initAudio();
    const app = this;
    socket.on('receiveMessage', (data) => {
      if(data.localId) return;
      if(data.beep) {
        app.playAudio(data.beep);
      }
      app.updateNewMessageCount(app.newMessageCount + 1);
    });
    const newMessageCount = this.getNewMessageCountFromNKC();
    this.updateNewMessageCount(newMessageCount);
  },
  watch: {
    showPanel() {
      const app = this;
      if(this.showPanel) {
        setTimeout(() => {
          setAsDraggableElement(socketContainer, app.onContainerPositionChange);
        })
      }
    },
    mode() {
      this.saveChatInfoToLocalStorage();
    },
  },
  methods: {
    // 初始化 数据来源于本地或默认数据
    getUrl: NKC.methods.tools.getUrl,
    initContainer() {
      const {
        mode,
        containerMode,
        narrowWidth,
        narrowHeight,
        wideWidth,
        wideHeight,
        top,
        left,
      } = this.getChatInfoFromLocalStorage();
      this.setModeData(mode);
      this.setContainerModeData(containerMode);
      this.setContainerPositionData({
        left, top
      });
      this.setContainerSizeData('wide', {
        height: wideHeight,
        width: wideWidth,
      });
      this.setContainerSizeData('narrow', {
        height: narrowHeight,
        width: narrowWidth,
      });
    },
    getNewMessageCountFromNKC() {
      return NKC.configs.newMessageCount;
    },
    updateNewMessageCountToDom(count) {
      const documents = $('.message-count');
      const containers = $('.message-count-container')
      if(count === 0) {
        containers.addClass('hidden');
        documents
          .addClass('hidden')
          .text('');

      } else {
        containers.removeClass('hidden');
        documents
          .removeClass('hidden')
          .text(count);
      }
    },
    updateNewMessageCountToNKC(count) {
      NKC.configs.newMessageCount = count;
    },
    updateNewMessageCount: debounce(function(count) {
      this.newMessageCount = count;
      this.updateNewMessageCountToDom(count);
      this.updateNewMessageCountToNKC(count);
    }, 500),
    onContainerPositionChange: debounce(function(position) {
      const {left, top} = position;
      this.setContainerPositionData({left, top});
      this.saveContainerPositionToLocalStorage({left, top});
    }, 500),
    saveChatInfoToLocalStorage() {
      // 全屏模式无需更新socket面板位置以及尺寸信息
      if(this.fixed) return;
      const app = this;
      const {containerInfo, mode, containerMode} = app;
      const {
        left,
        top,
        wideHeight,
        wideWidth,
        narrowHeight,
        narrowWidth,
      } = containerInfo;
      updateInLocalStorage(localStorageKey, {
        containerMode,
        mode,
        wideHeight,
        wideWidth,
        narrowHeight,
        narrowWidth,
        left,
        top
      });
    },
    getChatInfoFromLocalStorage() {
      const {defaultInfo} = this;
      const windowWidth = $(window).width();
      let {
        mode = defaultInfo.mode,
        containerMode = defaultInfo.containerMode,
        wideHeight = defaultInfo.wideHeight,
        wideWidth = defaultInfo.wideWidth,
        narrowHeight = defaultInfo.narrowHeight,
        narrowWidth = defaultInfo.narrowWidth,
        top = defaultInfo.top,
        left
      } = getFromLocalStorage(localStorageKey);
      const panelWidth = mode === 'wide'? wideWidth: narrowWidth;
      if(!left) left = (windowWidth - panelWidth) / 2
      return {
        mode,
        containerMode,
        wideHeight,
        wideWidth,
        narrowHeight,
        narrowWidth,
        top,
        left
      };
    },
    showMessagePanel(uid) {
      this.showPanel = true;
      const app = this;
      if(uid) {
        setTimeout(() => {
          app.$refs.message.openPage({pageId: 'PageChat', data: {
              type: 'UTU',
              uid: uid
            }
          });
        });
      }
      const containerMode = 'normal';
      this.setContainerModeData(containerMode);
      this.saveContainerModeToLocalStorage(containerMode);
    },
    // 隐藏socket面板
    hideMessagePanel() {
      this.onMouseLeave();
      this.showPanel = false;
    },
    // 存储关闭前socket面板的位置
    setSocketInfo() {
      const {left, top} = $(socketContainer).offset();
      this.containerInfo.left = left;
      this.containerInfo.top = top - $(document).scrollTop();
    },
    // 切换socket面板的显隐状态
    switchMessagePanel() {
      if(this.showPanel) {
        this.hideMessagePanel();
      } else {
        this.showMessagePanel();
      }
    },
    // 取消禁止滚动
    enableScroll: debounce(function() {
      $('body').css({
        'overflow': '',
        'padding-right': ''
      });
    }, 200),
    // 禁止滚动
    disableScroll: debounce(function() {
      const body = $('body');
      const cssObj = {
        overflow: 'hidden'
      };
      if(hasScrollBar()) {
        const scrollBarWidth = getScrollBarWidth();
        cssObj['padding-right'] = scrollBarWidth + 'px';
      }
      body.css(cssObj);
    }, 200),
    containerSizeFromDomToDataAndLocalStorage() {
      if(this.fixed) return;
      const {mode} = this;
      const {width, height} = this.getContainerSizeFromDom();
      if(width === null || height === null) return;
      this.setContainerSizeData(mode, {
        width, height
      });
      this.saveContainerSizeToLocalStorage(mode, {height, width});
    },
    delayContainerSizeFromDomToDataAndLocalStorage: debounce(function() {
      this.containerSizeFromDomToDataAndLocalStorage();
    }, 1000),
    // 鼠标离开socket面板
    onMouseLeave() {
      if(!this.mouseOver) return;
      this.mouseOver = false;
      this.enableScroll();
      if(!this.fixed) {
        this.delayContainerSizeFromDomToDataAndLocalStorage();
      }
    },
    // 鼠标悬浮于socket面板之上
    onMouseOver() {
      if(this.mouseOver) return;
      this.mouseOver = true;
      this.disableScroll();
      if(!this.fixed) {
        this.delayContainerSizeFromDomToDataAndLocalStorage();
      }
    },
    // 切换窗口模式 简洁模式、经典模式
    changeSize() {
      const mode = this.mode === 'wide'? 'narrow': 'wide';
      this.setModeData(mode);
      this.saveModeToLocalStorage(mode);
    },
    saveModeToLocalStorage(mode) {
      updateInLocalStorage(localStorageKey, {mode});
    },
    saveContainerModeToLocalStorage(containerMode) {
      updateInLocalStorage(localStorageKey, {containerMode});
    },
    saveContainerSizeToLocalStorage(mode, {width, height}) {
      const newData = {};
      newData[`${mode}Height`] = height;
      newData[`${mode}Width`] = width;
      updateInLocalStorage(localStorageKey, newData);
    },
    // 仅保存面板位置到本地
    saveContainerPositionToLocalStorage({left, top}) {
      updateInLocalStorage(localStorageKey, {left, top});
    },
    setContainerInfoData(containerInfo) {
      this.containerInfo = containerInfo;
    },
    setContainerSizeData(mode, {width, height}) {
      this.containerInfo[`${mode}Width`] = width;
      this.containerInfo[`${mode}Height`] = height;
    },
    setContainerPositionData({left, top}) {
      this.containerInfo.left = left;
      this.containerInfo.top = top;
    },
    setModeData(mode) {
      this.mode = mode;
    },
    setContainerModeData(containerMode) {
      this.containerMode = containerMode;
    },
    // 获取面板的尺寸
    getContainerSizeFromDom() {
      const dom = $(this.$refs.socketContainer);
      return {
        width: dom.outerWidth(),
        height: dom.outerHeight()
      };
    },
    // 获取面板的位置
    getContainerPositionFromDom() {
      const {left, top} = $(socketContainer).offset();
      return {
        left,
        top: top - $(document).scrollTop()
      };
    },
    // 检测屏幕宽度，如果比经典模式socket面板宽度窄，则跳转到message页
    toChat(uid) {
      if($(window).width() >= this.defaultInfo.wideWidth + 100) {
        this.showMessagePanel(uid);
      } else {
        const uid = uid? `?uid=${uid}`: '';
        window.open(`/message${uid}`);
      }
    },
    toMessagePage() {
      window.open(`/message`);
    },
    setMinimize() {
      const value = 'minimize';
      this.setContainerModeData(value);
      this.saveContainerModeToLocalStorage(value);
      this.enableScroll();
    },
    unsetMinimize() {
      const value = 'normal';
      this.setContainerModeData(value);
      this.saveContainerModeToLocalStorage(value);
      if(!this.showPanel) {
        this.showMessagePanel();
      }
    },
    onRepeatOver() {
      if(this.repeatOver) return;
      this.repeatOver = true;
      this.containerSizeFromDomToDataAndLocalStorage();
    },
    onRepeatLeave() {
      if(!this.repeatOver) return;
      this.repeatOver = false;
    },
    setSocketContainerAsDefault() {
      saveToLocalStorage(localStorageKey, {});
      this.initContainer();
    },
    setMaximize() {
      this.setModeData('narrow');
      this.setContainerModeData('maximize');
    },
    playAudio(url) {
      const app = this;
      this.audio.onload = function() {
        app.play();
      };
      this.audio.src = url;
      this.audio.play();
    },
    initAudio() {
      this.audio = new Audio();
      this.audio.src = this.getUrl('messageTone');
    },
  }
});

window.messageApp = messageApp;