<template lang="pug">
  .message-app(ref="messageApp" v-cloak)
    Lottery(v-if = "showLottery")
    .minimize-container.theme-primary(v-if='containerMode === "minimize"' @click='unsetMinimize')
      .fa.fa-comments
      span(v-if='boxContent') {{boxContent}}
    .display-socket-container(v-show='containerMode !== "minimize"')
      .socket-container(
        v-if='showPanel'
        :style='containerStyle'
        ref='socketContainer'
      )
        .common-socket-header.draggable-handle.theme-primary
          span.m-r-05.fa.fa-comments
          span.m-r-1.app-name
          span(v-if='containerMode !== "maximize"')
            button.options-switch(
              @click='changeSize'
              @mouseover='onRepeatOver'
              @mouseleave='onRepeatLeave'
            ) {{modeName}}
            button.options-repeat.options(
              @click='setSocketContainerAsDefault'
              @mouseover='onRepeatOver'
              @mouseleave='onRepeatLeave'
              title='重置面板'
            )
              .fa.fa-repeat
            button.options-link.options(@click='toMessagePage' title='消息独立页')
              .fa.fa-external-link
            button.options-minimize.options(@click='setMinimize' title='最小化')
              .fa.fa-window-minimize
            button.options-remove.options(
              @click='hideMessagePanel'
              title='关闭'
            )
              .fa.fa-remove

        .message-container
          Message(
            :mode='mode'
            ref='message'
            :socket='socket'
            @update-new-message-count='updateNewMessageCount'
          )
</template>


<style lang="less" scoped>
  @import "../../../publicModules/base";
  @headerHeight: 2.8rem;
  .message-app {
    .theme-primary{
      background: rgb(28, 194, 255);
      background: -moz-linear-gradient(30deg, rgb(28, 194, 255) 30%, rgb(0, 144, 255) 70%);
      background: -webkit-linear-gradient(30deg, rgb(28, 194, 255) 30%, rgb(0, 144, 255) 70%);
      background: -o-linear-gradient(30deg, rgb(28, 194, 255) 30%, rgb(0, 144, 255) 70%);
      background: -ms-linear-gradient(30deg, rgb(28, 194, 255) 30%, rgb(0, 144, 255) 70%);
      background: linear-gradient(120deg, rgb(28, 194, 255) 30%, rgb(0, 144, 255) 70%);
    }
  }

  .display-socket-container{
    height: 100%;
    width: 100%;
  }

  .socket-container{
    //z-index: 2000;
    position: fixed;
    background-color: #fff;
    box-shadow: 0 0 7px 0 rgba(0, 0, 0, 0.3);
    border: 1px solid #eee;
    resize: both;
    border-radius: 3px;
    overflow: hidden;
    min-width: 26rem;
    min-height: 46rem;
    & *{
      resize: none;
    }
  }
  @media(max-width: 568px) {
    .socket-container{
      width: 100%!important;
      height: 100%!important;
      max-width: 100%!important;
      max-height: 100%!important;
      left: 0;
      top: 0;
    }
  }


  .message-container{
    position: absolute;
    top: @headerHeight;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  .minimize-container{
    @height: 2.4rem;
    height: @height;
    line-height: @height;
    border-radius: 2px;
    text-align: center;
    padding: 0 1rem;
    //background-color: rgba(43, 144, 217, 0.53);
    color: #fff;
    position: fixed;
    bottom: 0;
    right: 0;
    //z-index: 3000;
    cursor: pointer;
    font-size: 1rem;
    .fa{
      font-size: 1.4rem;
    }
    span{
      margin-left: 0.5rem;
    }
    opacity: 0.5;
    &:hover{
      opacity: 1;
    }

  }

  .common-socket-header{
    color: #fff;
    padding: 0 @headerHeight 0 1rem;
    height: @headerHeight;
    line-height: @headerHeight;
    position: relative;
    .options{
      border: none;
      background-color: transparent;
      position: absolute;
      top: 0;
      width: @headerHeight;
      height: @headerHeight;
      line-height: @headerHeight;
      text-align: center;
      &:hover{
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
    .app-name{
      //font-style: oblique;
    }
    .options-remove{
      right: 0;
    }
    .options-link{
      right: 3 * @headerHeight;
    }
    .options-minimize{
      right: @headerHeight;
      font-size: 1rem;
    }
    .options-switch{
      height: @headerHeight;
      line-height: @headerHeight;
      display: inline-block;
      padding: 0 1rem;
      border: none;
      background-color: transparent;
      &:hover{
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
    .options-repeat{
      right: 2 * @headerHeight;
    }
  }

</style>

<script>

  import Message from './Message.2.0.vue';
  import {getScrollBarWidth, hasScrollBar} from "../../js/scrollBar";
  import {DraggableElement} from "../../js/draggable";
  import {getFromLocalStorage, updateInLocalStorage, saveToLocalStorage} from "../../js/localStorage";
  import {debounce} from "../../js/execution";
  // import {sleep} from "../../js/timeout";
  import FastClick from "fastclick";
  import Lottery from '../lottery.vue'

  import {getSocket} from '../../js/socket';

  const localStorageKey = 'NKC_CHAT_2';

  const socket = getSocket();

  export default {
    data: () => ({
      showPanel: false,
      mouseOver: false,
      repeatOver: false,
      showLottery: false,
      // appName: '喵喵',

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
      draggable: ''
    }),
    components: {
      Message,
      Lottery
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
      socket.on('newMessageCountAndRedEnvelopeStatus', (data) => {
        const {redEnvelopeStatus , newMessageCount} = data;
        if(redEnvelopeStatus){
          this.showLottery = true
        }
        app.updateNewMessageCount(newMessageCount);
      });
      socket.on('receiveMessage', (data) => {
        if(data.localId) return;
        if(data.beep) {
          app.playAudio(data.beep);
        }
        app.newMessageCount += 1;
        app.updateNewMessageCount(app.newMessageCount);
      });
      const newMessageCount = this.getNewMessageCountFromNKC();
      this.updateNewMessageCount(newMessageCount);
      FastClick.attach(this.$refs.messageApp);
    },
    watch: {
      async showPanel() {
        const app = this;
        console.log(this.mode,'mode')
        if(this.showPanel) {
        this.$nextTick(()=>{
          this.draggableElement = new DraggableElement(this.$refs.socketContainer, '.draggable-handle', this.onContainerPositionChange);
          const JQRoot = this.draggableElement.getJQRoot();
          JQRoot.draggable('disable'); // 禁用拖动功能
          // this.draggableElement = this.$refs.socketContainer
          const localValue = getFromLocalStorage(localStorageKey);
          if (!(localValue && localValue.left && localValue.top)){
            this.draggableElement.setPositionCenter()
          }
          app.initSocketContainerMouseEvent();
          })
        }else{
          this.draggableElement && this.draggableElement.destroy()
        }
      },
      mode() {
        this.saveChatInfoToLocalStorage();
      },
    },
    methods: {
      // 初始化 数据来源于本地或默认数据
      getUrl: NKC.methods.tools.getUrl,
      initSocketContainerMouseEvent() {
        const app = this;
        const socketContainerElement = $(this.$refs.socketContainer);
        socketContainerElement.on('mouseleave', () => {
          app.onMouseLeave();
        });
        socketContainerElement.on('mouseover', () => {
          app.onMouseOver();
        });
      },
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
        this.$emit('update-new-message', count);
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
        this.setSocketInfo()
      },
      // 存储关闭前socket面板的位置
      setSocketInfo() {
        const {left, top} = $(this.$refs.socketContainer).offset();
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
        const {left, top} = $(this.$refs.socketContainer).offset();
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
  }

  // window.messageApp = messageApp;

</script>
