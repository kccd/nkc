<template lang="pug">
  .chat
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
        .chat-message-info(v-if="loading") 加载中...
        //- 没有消息可加载时的显示
        .chat-message-info(v-else-if="loadFinished")
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
            //- 发信人头像
            .icon(@click='openUserHome(message)')
              img(:src="message.sUser.icon")
            //- 消息内容 .nkc-media 代表媒体内容 可用于单独控制背景
            .message-container(:class="['img', 'video'].includes(message.contentType)?'nkc-media':''")
              //- 头像旁的箭头 同于标识谁发的消息
              .smart
              //- 图标 表示消息正在发送中
              .status.sending(v-if='message.status === "sending"')
                .fa.fa-circle-o-notch.fa-spin
              //- 图标 表示消息发送失败 点击可重发
              .status.error(v-else-if='message.status === "error"' @click="sendMessage('resend', message)")
                .fa.fa-exclamation-circle
              //- 图标 表示消息发送成功并可以撤回 点击后消息将被撤回
              .status.withdrawn(v-if='message.canWithdrawn' @click="withdrawn(message._id)")
                .fa.fa-trash
              //- 具体的消息内容 如果是
              .message-content
                //- 富文本内容 包含普通消息、添加好友、应用通知以及系统提醒
                .html(v-html='message.content' v-if="message.contentType === 'html'")
                //- 发送的图片消息
                .image(v-if="message.contentType === 'img'" @click="visitImages(message.content.fileUrl)")
                  img(:src="message.content.fileUrl")
                //- 发送的文件消息
                .file(v-if="message.contentType === 'file'")
                  a(:href="message.content.fileUrl" target='_blank') {{message.content.filename}}
                //- 发送的视频消息
                .video(v-if="message.contentType === 'video'")
                  video(preload='none' controls='controls' :src="message.content.fileUrl" type="video/mp4" :poster="message.content.fileCover")
                    | 你的浏览器不支持video标签，请升级。
                //- 发送的音频消息
                .audio(v-if="message.contentType === 'voice'" @click="playVoice(message)")
                  //- 接收到的音频消息
                  div.left(v-if='message.position === "left"')
                    //- 音频图标 静态
                    img(src=`/default/stopRight.png` v-if="message.content.playStatus === 'unPlay'")
                    //- 音频图标 动态
                    img(v-else src=`/default/playRight.gif`)
                    //- 音频时间长度
                    .time {{message.content.fileTimer}}''
                  //- 自己发出的音频消息
                  div.right(v-else)
                    .time {{message.content.fileTimer}}''
                    img(src=`/default/stopLeft.png` v-if="message.content.playStatus === 'unPlay'")
                    img(v-else src=`/default/playLeft.gif`)
    //- 输入面板 仅在与用户对话时显示
    .chat-form(v-if="showForm")
      //- 输入框容器
      .textarea-container
        //- 输入框
        textarea(ref="input" placeholder="请输入内容...")
      //- 按钮容器
      .button-container
        .button
          .fa.fa-smile-o
        .button
          .fa.fa-file-o
        .button.tip Ctrl + Enter 快捷发送
        .button.send
          span 发送
</template>

<style scoped lang="less">
  @import "../message.2.0.less";
  @textareaContainerHeight: 5rem;
  @buttonContainerHeight: 3rem;
  .chat-message-info{
    height: 2rem;
    line-height: 2rem;
    text-align: center;
    font-size: 1rem;
    color: #555;
  }
  .chat-container{
    height: @containerHeight;
    overflow-y: auto;
    position: relative;
    &[data-type='UTU']{
      height: @containerHeight - @textareaContainerHeight - @buttonContainerHeight;
    }
  }
  .chat{
    position: relative;
  }
  .chat-form{
    width: 100%;
    height: @textareaContainerHeight + @buttonContainerHeight;
    background-color: #fff;
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
    box-shadow: 1px 1px 15px -7px rgba(0, 0, 0, 0.66);
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
      background-color: @gray;
      color: #555;
      font-size: 1rem;
      text-align: center;
      border-radius: 3px;
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
    .message-container{
      background-color: @primary;
      color: #fff;
      padding: 0.6rem 0.5rem;
      font-size: 1.17rem;
      position: relative;
      border-radius: 5px;
      display: inline-block;
      max-width: 100%;
      &.nkc-media{
        //padding: 0;
        .image{
          img{
            max-width: 100%;
            max-height: 20rem;
          }
        }
        .video{
          video{
            max-width: 100%;
            max-height: 20rem;
          }
        }
      }
      .audio{
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
        background-color: @primary;
        &:after {
          content: '';
          display: block;
          height: 18px;
          width: 16px;
          position: absolute;
          top: -5px;
          left: -8px;
          border-radius: 0 0 0 20px;
          background-color: #fff;
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
          font-size: 1.8rem;
        }
      }
      .message-content{
        text-align: left;
        word-break: break-all;
        .html{
          & /deep/ a{
            color: #fff;
            border-bottom: 1px solid #fff;
            text-decoration: none;
          }
          & /deep/ .message-emoji{
              width: 2rem;
          }
        }
      }
    }
    &.right{
      text-align: right;
      .message-container{
        text-align: left;
        .smart{
          right: -8px;
          left: auto;
          border-radius: 0 0 15px 0;
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
</style>

<script>
  import ModuleHeader from './ModuleHeader.vue';
  import {
    closePage,
    openUserPage,
  } from '../message.2.0.js';
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


    }),
    mounted() {
      const app = this;
      const listContent = app.$refs.listContent;
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

      }
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
      },
      showForm() {
        const {type} = this;
        return type === 'UTU';
      },
      messages() {
        const {originMessages, mUser, tUser, timeout} = this;
        const now = new Date().getTime();
        let messagesId = [];
        const messagesObj = {};
        const messages = [];
        for(const m of originMessages) {
          const {_id, s} = m;
          const ownMessage = s === mUser.uid;
          messagesId.push(_id);
          m.position = ownMessage? 'right': 'left';
          m.sUser = ownMessage? mUser: tUser;
          m.canWithdrawn = m.status === 'sent' && ownMessage && (now - new Date(m.time) < timeout);

          messagesObj[_id] = m;
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
      timeFormat: NKC.methods.tools.timeFormat,
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
            const {type, uid, firstMessageId = ''} = app;
            if(page === undefined) page = this.page;
            const url = `/message/data?type=${type}&uid=${uid}&firstMessageId=${firstMessageId}`;
            this.loading = true;
            return nkcAPI(url, 'GET')
          })
          .then(data => {
            app.tUser = data.tUser;
            app.mUser = data.mUser;
            app.originMessages = data.messages2.concat(app.originMessages);
            app.loading = false;
            if(data.messages2.length === 0) {
              app.loadFinished = true;
            }
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
      init({type, uid}) {
        const app = this;
        this.reset();
        this.setTargetInfo(type, uid);
        this.getMessage(0)
        .then(() => {
          app.scrollToBottom();
        })
      },
      scrollToBottom() {
        setTimeout(() => {
          const listContent = this.$refs.listContent;
          listContent.scrollTop = listContent.scrollHeight + 10000;
        }, 100)
      },
      autoResize(init) {
        const textArea = this.$refs.input;
        let num = 2.8 * 12;
        if(!init && num < textArea.scrollHeight) {
          num = textArea.scrollHeight;
        }
        this.textareaHeight = num;
      },
      openUserHome() {
        openUserPage(this, this.type, this.uid);
      },
      sendMessage() {

      },
      withdrawn() {}

    }
  }
</script>