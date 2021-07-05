<template lang="pug">
  .chat.message-container
    //- 通用header组件
    ModuleHeader(
      :title="tUser? (tUser.friendName||tUser.name): '加载中...'"
      :leftIcon="leftIcon"
      :rightIcon="rightIcon"
      @onClickLeftButton="closePage"
      @onClickRightButton="openUserHome"
    )
    //- 对话列表容器 固定高度 内容可滚动
    .chat-container(ref='listContent' :data-type="type")
      //- 对话列表容器 长度无限制
      .chat-messages
        //- 加载消息时的状态显示
        .chat-message-info
          span(v-if="loading") 加载中...
          span(v-else-if="loadFinished")
            //- 存在对话时
            span(v-if="messages.length > 0") 没有更多信息了
            //- 不存在对话时
            span(v-else) 空空如也
        //- 单条对话信息
        .chat-message-item(v-for="message in messages" :key="message._id")
          //- 时间戳
          .message-time(v-if="message.contentType === 'time'")
            span {{timeFormat(message.content)}}
          //- 被撤回的消息
          .message-withdrawn(v-else-if="message.contentType === 'withdrawn'")
            //- 对方撤回
            span(v-if="message.position === 'left'") 对方撤回了一条消息
            //- 自己撤回
            span(v-else) 你撤回了一条消息
          //- 消息内容容器
          .message(v-else :class='message.position')

            .timestamp {{message.sUser.name}} {{message.timeString}}
            //- 发信人头像
            .icon(@click='openUserHome(message.position)')
              img(:src="message.sUser.icon")
            //- 消息内容 .nkc-media 代表媒体内容 可用于单独控制背景
            .message-body(:class="['image', 'video'].includes(message.contentType)?'nkc-media':''")
              //- 头像旁的箭头 同于标识谁发的消息
              .smart
              .status.error(v-if='message.status === "error"' @click="sendMessage(message, true)")
                .fa.fa-exclamation-circle
              //- 图标 表示消息发送成功并可以撤回 点击后消息将被撤回
              .status.withdrawn(v-if='message.canWithdrawn' @click="withdrawn(message._id)" title="撤回")
                .fa.fa-trash
              //- 具体的消息内容 如果是
              .message-content
                //- 富文本内容 包含普通消息、添加好友、应用通知以及系统提醒
                .html(v-html='message.content' v-if="message.contentType === 'html'")
                //- 发送的图片消息
                .image(v-else-if="message.contentType === 'image'")
                  img.chat-message-image(:src="message.content.fileUrlSM" :data-src="message.content.fileUrl")
                //- 发送的文件消息
                .file(v-else-if="message.contentType === 'file'")
                  a(:href="message.content.fileUrl" target='_blank') {{message.content.filename}}
                    button 下载 {{getSize(message.content.fileSize)}}
                //- 发送的视频消息
                .video(v-else-if="message.contentType === 'video'")
                  video(preload='none' controls='controls' :src="message.content.fileUrl" type="video/mp4" :poster="message.content.fileCover")
                    | 你的浏览器不支持video标签，请升级。
                //- 发送的音频消息
                .audio(v-else-if="message.contentType === 'audio'")
                  .filename {{message.content.filename}}
                  audio(controls='controls' :src="message.content.fileUrl")
                //- 发送的音频消息
                .audio(v-else-if="message.contentType === 'voice'" @click="playVoice(message)")
                  //- 接收到的音频消息
                  div.left(v-if='message.position === "left"')
                    //- 音频图标 静态
                    img(src=`/default/stopRight.png` v-if="playAudioFileId !== message.content.fileId")
                    //- 音频图标 动态
                    img(v-else src=`/default/playRight.gif`)
                    //- 音频时间长度
                    .time {{message.content.fileDuration}}''
                  //- 自己发出的音频消息
                  div.right(v-else)
                    .time {{message.content.fileDuration}}''
                    img(src=`/default/stopLeft.png` v-if="playAudioFileId !== message.content.fileId")
                    img(v-else src=`/default/playLeft.gif`)
              //- 发送进度
              .sending-progress(v-if="message.status === 'sending'")
                .fa.fa-circle-o-notch.fa-spin
                span(v-if="message.progress !== 100") 发送中...{{message.progress}}%
                span(v-else) 发送成功，处理中...
    //- 输入面板 仅在与用户对话时显示
    .chat-form(v-if="showForm")
      // 警告信息展示面板
      .warning-info-panel(v-if="warningContent")
        .warning-content {{warningContent}}
        .warning-button(v-if="canSendMessage")
          button(@click="clearWarningContent") 关闭
      // 表情面板
      .chat-twemoji(ref="twemojiContainer" v-if="showTwemoji")
        .icon(v-for="e in twemoji" @click="selectIcon(e.code)")
          img(:src="e.url")
      //- 输入框容器
      .textarea-container
        //- 输入框
        textarea(ref="input" placeholder="请输入内容..." @keyup.ctrl.enter="sendTextMessage" v-model="content")
      //- 按钮容器
      .button-container
        .button(@click="toShowTwemoji" title="表情")
          .fa.fa-smile-o
        .button(@click="selectFile" title="文件")
          input.hidden(ref="fileInput" type="file" @change="selectedFile" multiple="multiple")
          .fa.fa-file-o
        .button.tip Ctrl + Enter 快捷发送
        .button.send(@click="sendTextMessage")
          span 发送
</template>

<style scoped lang="less">
  @import "../message.2.0.less";
  @textareaContainerHeight: 6rem;
  @buttonContainerHeight: 3rem;
  @bgColor: #eee;
  @bubbleBgColor: #fff;
  @bubbleBgColorRight: @primary;
  .chat-message-info{
    height: 2rem;
    line-height: 2rem;
    text-align: center;
    font-size: 1rem;
    color: #555;
  }
  .chat-container{
    width: 100%;
    background-color: @bgColor;
    position: absolute;
    top: @headerHeight;
    bottom: 0;
    left: 0;
    overflow-y: auto;
    &[data-type='UTU']{
      bottom: @textareaContainerHeight + @buttonContainerHeight;
    }
  }
  .chat{
    position: relative;
  }
  .chat-form{
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    height: @textareaContainerHeight + @buttonContainerHeight;
    background-color: #fff;
    &>div{
      height: 100%;
    }
    .textarea-container{
      height: @textareaContainerHeight;
      box-sizing: border-box;
      border: 1px solid #e7e7e7;
      width: 100%;
    }
    .button-container{
      height: @buttonContainerHeight;
      width: 100%;
      padding-left: 1rem;
      .button{
        cursor: pointer;
        display: inline-block;
        height: @buttonContainerHeight;
        line-height: @buttonContainerHeight;
        font-size: 1.6rem;
        margin-right: 1rem;
        user-select: none;
        &.send{
          float: right;
          margin-right: 0;
          font-size: 1.25rem;
          color: #444;
          cursor: pointer;
          padding: 0 1rem;
          &:hover, &:active{
            color: @primary;
          }
        }
        &.tip{
          font-size: 1rem;
          color: #777;
        }
      }
    }
    textarea{
      overflow-x: hidden;
      overflow-y: auto;
      width: 100%;
      resize: none;
      height: 100%;
      padding: 0.5rem 1rem;
      border: none;
      &:focus{
        outline: none;
      }
    }
    //box-shadow: 1px 1px 15px -7px rgba(0, 0, 0, 0.66);
  }
  .message-time, .message-withdrawn{
    text-align: center;
    & span{
      @height: 1.8rem;
      margin: auto;
      height: @height;
      line-height: @height;
      display: inline-block;
      padding: 0 0.5rem;
      background-color: #e7e7e7;
      color: #555;
      font-size: 1rem;
      text-align: center;
      border-radius: 3px;
      border: 1px solid #e2e2e2;
    }
  }
  .chat-message-item>div{
    margin: 1rem 0;
  }
  .message{
    @iconHeight: 3rem;
    position: relative;
    padding: 0 @iconHeight + 2rem;
    .icon{
      height: @iconHeight;
      width: @iconHeight;
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0.8rem;
      img{
        height: 100%;
        width: 100%;
        border-radius: 50%;
      }
    }
    &.right{
      .icon{
        right: 0.8rem;
        left: auto;
      }
    }
    .timestamp{
      height: 1px;
      width: 1px;
      overflow: hidden;
      color: #fff;
      position: absolute;
      top: 0;
      left: -10rem;
    }
    .message-body{
      background-color: @bubbleBgColor;
      color: #333;
      min-height: 3rem;
      padding: 0.7rem 0.7rem;
      font-size: 1.17rem;
      position: relative;
      border-radius: 5px;
      display: inline-block;
      max-width: 30rem;
      .sending-progress{
        margin-top: 0.2rem;
        height: 1.8rem;
        width: 100%;
        padding: 0 0.5rem;
        text-align: center;
        line-height: 1.8rem;
        font-size: 1rem;
        background-color: #f4f4f4;
        border-radius: 3px;
        border: 1px solid #e2e2e2;
        color: #888;
        .fa{
          margin-right: 0.2rem;
        }
      }
      &.nkc-media{
        padding: 0;
        .smart{
          display: none;
        }
        .image{
          cursor: pointer;
          img{
            max-width: 100%;
            max-height: 20rem;
          }
        }
        .video{
          font-size: 0;
          video{
            max-width: 100%;
            max-height: 20rem;
          }
        }
      }
      .audio{
        audio{
          max-width: 100%;
        }
        .filename{
          font-size: 1.2rem;
        }
        .left, .right{
          &>*{
            display: inline-block;
          }
          img{
            height: 2rem;
            width: 2rem;
          }
        }
        .left img{
          margin-right: 2rem;
        }
        .right img{
          margin-left: 2rem;
        }
      }
      .smart{
        position: absolute;
        top: 0;
        left: -8px;
        height: 20px;
        width: 8px;
        border-radius: 0 0 0 15px;
        background-color: @bubbleBgColor;
        &:after {
          content: '';
          display: block;
          height: 18px;
          width: 16px;
          position: absolute;
          top: -5px;
          left: -8px;
          border-radius: 0 0 0 20px;
          background-color: @bgColor;
        }
      }
      .status{
        position: absolute;
        top: 0;
        font-size: 1.6rem;
        width: 2rem;
        left: -2rem;
        text-align: center;
        &.error{
          color: @accent;
        }
        &.sending{
          color: #ccc;
          font-size: 1.5rem;
        }
        &.withdrawn{
          color: #ccc;
          font-size: 1.4rem;
          cursor: pointer;
        }
      }
      .message-content{
        text-align: left;
        word-break: break-all;
        font-size: 1.2rem;
        .html{
          & /deep/ a{
            //text-decoration: none;
          }
          & /deep/ .message-emoji{
              width: 2rem;
          }
        }
        .file{
          a{
            color: #333;
            text-decoration: none;
            &:hover, &:active{
              text-decoration: none;
            }
            button{
              margin-top: 0.5rem;
              color: #fff;
              border-radius: 3px;
              height: 2rem;
              display: block;
              line-height: 2rem;
              background-color: @primary;
              text-align: center;
              font-size: 1rem;
              outline: none;
              border: none;
              &:hover, &:active{
                opacity: 0.7;
              }
            }
          }
        }
      }
    }
    &.right{
      text-align: right;
      .message-body{
        text-align: left;
        background-color: @bubbleBgColorRight;
        color: #fff;
        .smart{
          right: -8px;
          left: auto;
          border-radius: 0 0 15px 0;
          background-color: @bubbleBgColorRight;
          &:after {
            height: 17px;
            width: 18px;
            left: auto;
            right: -10px;
            border-radius: 0 0 20px 0;
          }
        }
      }
    }
  }
  .chat{
    position: relative;
  }
  .chat-twemoji{
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 0.5rem 0;
    z-index: 500;
    .icon{
      cursor: pointer;
      height: 2rem;
      width: 2rem;
      display: inline-block;
      margin: 0.2rem;
      img{
        height: 100%;
        width: 100%;
      }
    }
  }
  .warning-info-panel{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    overflow-y: auto;
    padding: 0.5rem;
    z-index: 600;
    background-color: rgba(200, 200, 200, 0.94);
    color: #000;
    .warning-button{
      text-align: center;
      padding-top: 0.5rem;
      button{

      }
    }
  }
</style>

<script>
  const CHAT_CONTENT_ID = `NKC_CHAT_CONTENT`;
  import ModuleHeader from './ModuleHeader.vue';
  import {saveToLocalStorage, getFromLocalStorage} from "../../lib/js/localStorage";
  import {
    closePage,
    openUserPage,
  } from '../message.2.0.js';
  import {withdrawn, onWithdrawn} from '../message.2.0.js';
  export default {
    data: () => ({
      type: '',
      uid: '',

      timeout: 60000,

      tUser: null,
      mUser: null,

      originMessages: [],

      loading: false,

      loadFinished: false,
      buttonContainerHeight: 20,
      textareaHeight: 100,
      page: 0,

      originTwemoji: [],

      showTwemoji: false,

      content: '',

      audio: null,

      playAudioFileId: '',

      canSendMessage: true,
      warningContent: '',

      listContentBottom: 0,

    }),
    watch: {
      content() {
        const {content, type, uid} = this;
        if(type !== 'UTU') return;
        const chatContent = getFromLocalStorage(CHAT_CONTENT_ID);
        chatContent[uid] = content;
        saveToLocalStorage(CHAT_CONTENT_ID, chatContent);
      },
      messages() {
        setTimeout(() => {
          NKC.methods.initImageViewer('.chat-message-image');
        }, 200);
      }
    },
    mounted() {
      const app = this;
      const listContent = app.$refs.listContent;
      // 滚动到顶部加载历史记录
      listContent.onscroll = function() {
        const scrollTop = this.scrollTop;
        if(scrollTop > 20 || app.loadFinished || app.loading) return;
        listContent.scrollTo = listContent.scrollTop;
        listContent.height = listContent.scrollHeight;
        app.getMessage()
          .then(function() {
            const height = listContent.scrollHeight;
            listContent.scrollTop = height - listContent.height;
          })
          .catch(function(err){
            sweetError(err);
          })
      };
      // 点击后收起表情面板
      listContent.addEventListener('click', () => {
        app.toHideTwemoji();
      });
      this.initAudio();
    },
    computed: {
      leftIcon() {
        return 'fa fa-angle-left';
      },
      rightIcon() {
        const {type} = this;
        if(type === 'UTU') {
          return 'fa fa-user-circle-o';
        }
        return '';
      },
      formHeight() {
        return this.textareaHeight + this.buttonContainerHeight;
      },
      firstMessageId() {
        const {messages} = this;
        for(const m of messages) {
          if(m.contentType !== 'time') {
            return m._id;
          }
        }
        return null;
      },
      showForm() {
        const {type} = this;
        return type === 'UTU';
      },
      twemoji() {
        const {originTwemoji, getUrl} = this;
        const arr = [];
        for(const e of originTwemoji) {
          arr.push({
            code: e,
            url: getUrl('twemoji', e)
          });
        }
        return arr;
      },
      messages() {
        const {originMessages, mUser, tUser, timeout} = this;
        const now = new Date().getTime();
        let messagesId = [];
        const messagesObj = {};
        const messages = [];
        for(const m of originMessages) {
          const {_id, s, time} = m;
          const ownMessage = s === mUser.uid;
          messagesId.push(_id);
          m.position = ownMessage? 'right': 'left';
          m.sUser = ownMessage? mUser: tUser;
          m.canWithdrawn = m.status === 'sent' && ownMessage && (now - new Date(m.time) < timeout);

          messagesObj[_id] = m;

          m.timeString = NKC.methods.tools.timeFormat(m.time);
        }
        messagesId = [...new Set(messagesId)];
        messagesId = messagesId.sort((a, b) => a - b);
        for(const id of messagesId) {
          messages.push(messagesObj[id]);
        }
        const arr = [];
        for(let i = 0; i < messages.length; i++) {
          const message = messages[i]
          const {time} = message;
          if(i === 0) {
            arr.push({
              contentType: 'time',
              content: time,
            });
          } else {
            const lastMessage = messages[i - 1];
            if(new Date(time).getTime() - new Date(lastMessage.time).getTime() > timeout) {
              arr.push({
                contentType: 'time',
                content: time,
              });
            }
          }
          arr.push(message);
        }
        return arr;
      }
    },
    components: {
      ModuleHeader
    },
    methods: {
      getUrl: NKC.methods.tools.getUrl,
      getSize: NKC.methods.tools.getSize,
      timeFormat: NKC.methods.tools.timeFormat,
      clearWarningContent() {
        this.warningContent = ''
      },
      initAudio() {
        const app = this;
        this.audio = new Audio();
        this.audio.onended = function() {
          app.playAudioFileId = '';
        };
        this.audio.onload = function() {
          app.audio.play();
        };
      },
      closePage() {
        this.reset();
        closePage(this);
      },
      setTargetInfo(type, uid) {
        this.type = type;
        this.uid = uid;
      },
      getMessage(page) {
        const app = this;
        return Promise.resolve()
          .then(() => {
            // if(app.loadFinished) throw new Error(`所有消息加载完成`);
            // if(app.loading) throw new Error(`上次加载尚未完成，请稍后重试`);
            const {type, uid, firstMessageId} = app;
            if(page === undefined) page = this.page;
            const url = `/message/data?type=${type}&uid=${uid}${firstMessageId? `&firstMessageId=${firstMessageId}`: ''}`;
            app.loading = true;
            // app.saveListContentBottom();
            return nkcAPI(url, 'GET')
          })
          .then(data => {
            app.tUser = data.tUser;
            app.mUser = data.mUser;
            app.originMessages = data.messages.concat(app.originMessages);
            app.loading = false;
            app.originTwemoji = data.twemoji;
            if(data.messages.length === 0) {
              app.loadFinished = true;
            }
            if(data.statusOfSendingMessage && data.setStatusOfSendingMessage) {
              const {canSendMessage, warningContent} = data.statusOfSendingMessage;
              app.canSendMessage = canSendMessage;
              app.warningContent = warningContent;
            }
            // 兼容旧浏览器
            // app.setListContentBottom();
          })
          .catch(err => {
            console.error(err);
            app.loading = false;
          })
      },
      reset() {
        this.loadFinished = false;
        this.loading = true;
        this.originMessages = [];
        this.tUser = null;
        this.mUser = null;
      },
      setContentFromLocalStorage() {
        const {type, uid} = this;
        if(type !== 'UTU') return;
        const chatContent = getFromLocalStorage(CHAT_CONTENT_ID);
        this.content = chatContent[uid] || '';
      },
      init({type, uid}) {
        const app = this;
        this.reset();
        this.setTargetInfo(type, uid);
        this.setContentFromLocalStorage();
        this.getMessage(0)
        .then(() => {
          app.scrollToBottom();
        })
      },
      // 遨游浏览器加载历史信息后会自动跳转到滚动容器顶部
      // 暂未启用
      saveListContentBottom() {
        this.listContentBottom = this.getListContentBottom();
      },
      setListContentBottom() {
        const app = this;
        setTimeout(() => {
          const {listContentBottom} = app;
          const listContent = app.$refs.listContent;
          listContent.scrollTop = listContent.scrollHeight - listContentBottom - $(listContent).height();
        });
      },
      scrollToBottom() {
        setTimeout(() => {
          const listContent = this.$refs.listContent;
          listContent.scrollTop = (listContent.scrollHeight + $(listContent).height());
        }, 100)
      },
      getListContentBottom() {
        const listContent = this.$refs.listContent;
        return listContent.scrollHeight - (listContent.scrollTop + $(listContent).height());
      },
      checkScrollTopAndScrollToBottom() {
        const app = this;
        setTimeout(() => {
          const listContentBottom = app.getListContentBottom();
          if(listContentBottom > 1000) return;
          app.scrollToBottom();
        }, 100);
      },
      autoResize(init) {
        const textArea = this.$refs.input;
        let num = 2.8 * 12;
        if(!init && num < textArea.scrollHeight) {
          num = textArea.scrollHeight;
        }
        this.textareaHeight = num;
      },
      openUserHome(position = 'left') {
        if(position === 'left') {
          openUserPage(this, this.type, this.uid);
        } else {
          NKC.methods.visitUrl(this.mUser.home, true);
        }
      },
      withdrawn(messageId) {
        withdrawn(messageId)
          .catch(sweetError);
      },
      onWithdrawn(messageId) {
        onWithdrawn(this.originMessages, messageId);
      },
      onReceiveMessage(localId, message) {
        const {r, messageType, s} = message;
        const {mUser, tUser, type, originMessages} = this;
        if(messageType !== type) return;
        if(!mUser || (type === 'UTU' && !tUser)) return;
        if(
          type === 'UTU' &&
          (r !== mUser.uid || s !== tUser.uid) &&
          (s !== mUser.uid || r !== tUser.uid)
        ) return
        let hasMessage = false;
        for(let i = 0; i < originMessages.length; i++) {
          const originMessage = originMessages[i];
          if(originMessage._id === localId) {
            originMessages.splice(i, 1, message);
            hasMessage = true;
            break;
          }
        }
        if(hasMessage === false) {
          this.originMessages.unshift(message);
        }
        this.checkScrollTopAndScrollToBottom();
        if(r === mUser.uid) {
          this.markAsRead();
        }
      },
      markAsRead() {
        const {type, uid} = this;
        nkcAPI(`/message/mark`, 'PUT', {
          type, uid
        })
        .catch(console.error);
      },
      selectIcon(code) {
        let content = this.content;
        const e = this.$refs.input;
        let index;
        if (e.selectionStart) {
          index = e.selectionStart;
        } else if (document.selection) {
          e.focus();
          const r = document.selection.createRange();
          const sr = r.duplicate();
          sr.moveToElementText(e);
          sr.setEndPoint('EndToEnd', r);
          index = sr.text.length - r.text.length;
        }
        const emoji = `[f/${code}]`;

        if(index > 1) {
          const str = content.substring(0, index);
          const str2 = str + emoji;
          content = content.replace(str, str2);
        } else {
          content = emoji + (content || '');
        }
        this.content = content;
        this.toHideTwemoji();
      },
      toHideTwemoji() {
        this.showTwemoji = false;
      },
      toShowTwemoji() {
        this.showTwemoji = true;
        setTimeout(() => {
          const container = this.$refs.twemojiContainer;
          container.scrollTop = 0;
        });
      },
      switchTwemoji() {
        if(this.showTwemoji) {
          this.toHideTwemoji();
        } else {
          this.toShowTwemoji();
        }
      },
      selectFile() {
        this.$refs.fileInput.click();
      },
      selectedFile() {
        const files = this.$refs.fileInput.files;
        for(const file of files) {
          this.sendFileMessage(file);
        }
        this.$refs.fileInput.value = '';
      },
      sendMessage(message, resend = false) {
        const app = this;
        const {tUser} = this;
        const {formData} = message;
        // 延迟显示发送状态（发送中...），提升用户体验
        clearTimeout(message.timeout);
        message.timeout = setTimeout(() => {
          message.status = 'sending';
        }, 2000);
        return Promise.resolve()
          .then(() => {
            if(!resend) {
              app.originMessages.push(message);
              app.checkScrollTopAndScrollToBottom();
              if(message.clearContent) app.content = '';
            }
            return nkcUploadFile(`/message/user/${tUser.uid}`, 'POST', formData, (e, num) => {
              message.progress = num;
            })
          })
          .then(() => {
            clearTimeout(message.timeout);
            message.status = 'sent';
          })
          .catch(err => {
            clearTimeout(message.timeout);
            message.status = 'error';
            sweetError(err);
          });
      },
      getLocalMessage(content) {
        const {mUser, tUser} = this;
        const localId = `local_id_${Date.now()}`;
        return {
          canWithdrawn: false,
          content,
          contentType: 'html',
          messageType: 'UTU',
          position: 'right',
          r: tUser.uid,
          s: mUser.uid,
          sUser: mUser,
          status: 'notSend',
          time: new Date(),
          _id: localId,
          progress: 0,
        };
      },
      sendFileMessage(file) {
        const {name} = file;
        const message = this.getLocalMessage(name);
        const formData = new FormData();
        formData.append('localId', message._id);
        formData.append('file', file);
        message.formData = formData;
        message.isFile = true;
        this.sendMessage(message);
      },
      sendTextMessage() {
        const {content} = this;
        if(content.length === 0) return;
        const message = this.getLocalMessage(content);
        const formData = new FormData();
        formData.append('content', content);
        formData.append('localId', message._id);
        message.formData = formData;
        message.clearContent = true;
        this.sendMessage(message);
      },
      stopPlayVoice() {
        this.playAudioFileId = null;
        this.audio.src = '';
      },
      playVoice(message) {
        const {fileUrl, fileId} = message.content;
        if(this.playAudioFileId === fileId) {
          this.stopPlayVoice();
        } else {
          this.playAudioFileId = fileId;
          this.audio.src = fileUrl;
          this.audio.play();
        }
      },
      reconnect() {
        const {type, uid} = this;
        this.init({type, uid});
      }
    }
  }
</script>