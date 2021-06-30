const data = NKC.methods.getDataById('data');
const audio = new Audio();

const {canSendMessage, warningContent} = data.statusOfSendingMessage;

window.audio = audio;

import {onWithdrawn, withdrawn} from '../message.2.0.js';

window.app = new Vue({
  el: '#app',
  data: {
    // socketID
    socketId: Date.now() + '' + Math.round(Math.random()*1000),
    // 消息类型，UTU, STU, STE
    type: data.type,
    // 消息内容列表
    originMessages: data.messages,
    // 是否显示表情列表
    showStickerPanel: false,
    // 表情数据
    twemoji: data.twemoji,
    // 对方
    tUser: data.tUser,
    // 自己
    mUser: data.mUser,
    // 输入框输入的内容
    content: '',
    // 获取消息内容 锁
    getMessageStatus: 'canLoad', // canLoad, loading, cantLoad
    // 语音播放器实例
    audio: new Audio(),

    // 能否发送消息
    canSendMessage,
    warningContent,

    // 正在播放的声音ID
    playVoiceId: null,
  },
  methods: {
    // 格式化时间
    timeFormat: NKC.methods.timeFormat,
    // 获取链接
    getUrl: NKC.methods.tools.getUrl,
    clearWarningContent() {
      this.warningContent = ''
    },
    toast(c) {
      c = c.error || c.message || c;
      NKC.methods.rn.emit('toast', {
        content: c
      });
    },
    // 滚动内容到底部
    scrollToBottom() {
      setTimeout(() => {
        const listContent = this.$refs.listContent;
        listContent.scrollTop = listContent.scrollHeight + 10000;
      }, 200)
    },
    // 切换表情面板状态
    switchStickerPanel(f) {
      this.showStickerPanel = f === undefined? !this.showStickerPanel: !!f;
    },
    // 选择表情
    selectSticker(tmj) {
      const inputText = this.content;
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
      const emoji = '[f/' + tmj + ']';

      if(index > 1) {
        const str = inputText.substring(0, index);
        const str2 = str + emoji;
        this.content = inputText.replace(str, str2);
      } else {
        this.content = emoji + (this.content || '');
      }
      setTimeout(() => {
        this.autoResize();
      }, 200);

    },
    // 输入框自动调整高度
    autoResize(init) {
      const textArea = this.$refs.input;
      const num = 2.8 * 12;
      textArea.style.height = num + 'px';
      if(!init && num < textArea.scrollHeight) {
        textArea.style.height = textArea.scrollHeight + 'px';
      }
    },
    // 输入框保持聚焦
    keepFocus(focus) {
      if(focus) {
        this.$refs.input.focus();
      }
    },
    // 浏览聊天内容中的图片
    visitImages(url) {
      let urls = [];
      for(const m of this.messages) {
        if(m.contentType === 'image') {
          urls.push({
            name: m.content.filename,
            url: m.content.fileUrl
          });
        }
      }
      // urls.reverse();
      const index = urls.map(u => u.url).indexOf(url);
      urls.map(u => u.url = location.origin + u.url);
      NKC.methods.rn.emit('viewImage', {
        index,
        urls
      })
    },
    // 访问用户主页
    openUserHome(message) {
      if(message.messageType !== 'UTU') return;
      if(NKC.configs.uid === message.s) {
        NKC.methods.visitUrl(NKC.methods.tools.getUrl('userHome', message.s), true);
      } else {
        NKC.methods.visitUrl(NKC.methods.tools.getUrl('messageUserDetail', message.s), true);
      }
    },
    // 选择本地附件
    selectLocalFiles() {
      const fileDom = this.$refs.file;
      fileDom.value = null;
      fileDom.click();
    },
    // 选择完本地附件
    selectedLocalFiles() {
      const fileDom = this.$refs.file;
      for(const file of fileDom.files) {
        this.sendMessage('sendFile', file);
      }
    },
    // 发送消息
    sendMessage(type, c) {
      const self = this;
      NKC.methods.rn.emit('getKeyboardStatus', {}, function(data) {
        self.keepFocus(data.keyboardStatus === 'show');
      })
      let message

      if(['sendText', 'sendFile'].includes(type)) {
        // 发送一条信息
        const localMessageId = `local_id_${Date.now()}`;
        message = {
          _id: localMessageId,
          contentType: 'html',
          s: self.mUser.uid,
          r: self.tUser.uid,
          messageType: 'UTU',
        }
        const formData = new FormData();
        if(type === 'sendText') {
          message.content = c;
        } else {
          message.content = c.name;
          formData.append('file', c);
        }
        formData.append('localId', message._id);
        formData.append('content', message.content);
        formData.append('socketId', self.socketId);
        message.formData = formData;
      } else {
        // 重发一条消息
        message = c;
      }
      message.status = 'sending'; // sent已发送、sending正在发送、error出错
      message.time = Date.now();

      Promise.resolve()
        .then(() => {
          if(!message.content) throw '请输入聊天内容';
          if(type !== 'resend') {
            self.originMessages.push(message);
          }
          self.content = "";
          self.autoResize(true);
          self.scrollToBottom();
          // self.keepFocus(true);

          return nkcUploadFile(`/message/user/${message.r}`, 'POST', message.formData);
        })
        .then((data) => {
          const index = self.originMessages.indexOf(message);
          message.status = 'sent';
          if(index >= 0) {
            // Vue.set(self.originMessages, index, data.message2);
            self.scrollToBottom();
          }
        })
        .catch(data => {
          message.status = 'error';
          self.toast(data.error || data.message || data);
        })
    },
    // 获取消息
    getMessage() {
      const {firstMessageId, tUser, type} = self = this;
      let url = `/message/data?type=${type}`;
      if(firstMessageId) {
        url += `&firstMessageId=${firstMessageId}`;
      }
      if(tUser.uid) {
        url += `&uid=${tUser.uid}`;
      }
      if(self.getMessageStatus !== 'canLoad') return;
      self.getMessageStatus = 'loading';
      return nkcAPI(url, 'GET')
        .then(data => {
          self.originMessages = self.originMessages.concat(data.messages);
          if(data.messages.length) {
            self.getMessageStatus = 'canLoad';
          } else {
            self.getMessageStatus = 'cantLoad';
          }
          if(data.statusOfSendingMessage) {
            const {canSendMessage, warningContent} = data.statusOfSendingMessage;
            self.canSendMessage = canSendMessage;
            self.warningContent = warningContent;
          }
        })
        .catch(data => {
          self.toast(data);
          self.getMessageStatus = 'canLoad';
        });
    },
    getOriginMessageById(id) {
      for(const m of this.originMessages) {
        if(m._id === id) return m;
      }
    },
    // rn接收到新消息通知web
    insertMessage(message, localId) {
      const {messageType, r, s} = message;
      const {tUser, mUser, type, originMessages} = this;

      if(messageType !== type) return;
      if(!mUser || (type === 'UTU' && !tUser)) return;
      if(
        type === 'UTU' &&
        (r !== mUser.uid || s !== tUser.uid) &&
        (s !== mUser.uid || r !== tUser.uid)
      ) return;
      let hasMessage = false;
      for(let i = 0; i < originMessages.length; i++) {
        const originMessage = originMessages[i];
        let _localId = typeof originMessage._id === 'number'? Number(localId): localId;
        if(originMessage._id === _localId) {
          originMessages.splice(i, 1, message);
          hasMessage = true;
          break;
        }
      }
      if(hasMessage === false) {
        this.originMessages.unshift(message);
      }

      if(r === mUser.uid) {
        this.markAsRead();
      }

      this.scrollToBottom();
    },
    onWithdrawn(messageId) {
      onWithdrawn(this.originMessages, messageId);
    },
    // 撤回
    withdrawn(messageId) {
      withdrawn(messageId)
        .catch(self.toast);
    },
    // 标记为已读
    markAsRead() {
      const {type, tUser} = self = this;
      setTimeout(() => {
        nkcAPI('/message/mark', 'PUT', {
          type,
          uid: tUser.uid
        })
          .catch(self.toast)
      }, 1000);

    },
    // 调用原生拍照、录像和录音
    useCamera(type) {
      let name = 'takePictureAndSendToUser';
      if(type === 'video') {
        name = 'takeVideoAndSendToUser';
      } else if(type === 'audio') {
        name = 'recordAudioAndSendToUser';
      }
      NKC.methods.rn.emit(name, {
        uid: this.tUser.uid,
        socketId: null
      });
    },
    // 处理好友添加申请
    newFriendOperation(id, agree) {
      const self = this;
      const message = self.getOriginMessageById(id);
      nkcAPI('/u/' + message.s + '/friends/agree', 'POST', {
        agree,
      })
        .then(function(data) {
          message.content = data.message.content;
        })
        .catch(self.toast)
    },
    // 播放语音
    playVoice(message) {
      const {audio, stopPlayVoice, getOriginMessageById, playVoiceId} = this;
      if(message.content.fileId === playVoiceId) {
        return stopPlayVoice();
      }
      stopPlayVoice();
      audio.src = message.content.fileUrl + `?t=${Date.now()}`;
      const self = this;
      setTimeout(() => {
        audio.play();
        self.playVoiceId = message.content.fileId;
      }, 200);
    },
    // 停止播放语音
    stopPlayVoice() {
      const {audio} = this;
      try{
        audio.pause();
        this.playVoiceId = null;
      } catch(err) {}
    },
  },
  computed: {
    // 第一条消息的ID，用户加载消息内容列表
    firstMessageId() {
      const {messages} = this;
      for(const m of messages) {
        if(m.contentType !== 'time') {
          return m._id;
        }
      }
    },
    // 处理过的消息内容列表
    messages() {
      const {originMessages, mUser, tUser} = this;
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
        m.canWithdrawn = m.status === 'sent' && ownMessage && (now - new Date(m.time) < 60000);

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
          if(new Date(time).getTime() - new Date(lastMessage.time).getTime() > 60000) {
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
  mounted() {
    const self = this;
    const listContent = self.$refs.listContent;
    window.addEventListener('click', () => {
      if(self.showStickerPanel) {
        self.switchStickerPanel(false);
      }
    });
    self.scrollToBottom();
    listContent.onscroll = function() {
      const scrollTop = this.scrollTop;
      if(scrollTop > 20) return;
      listContent.scrollTo = listContent.scrollTop;
      listContent.height = listContent.scrollHeight;
      self.getMessage()
        .then(function() {
          const height = listContent.scrollHeight;
          listContent.scrollTop = height - listContent.height;
        })
        .catch(function(data){
          self.toast(data.error || data.message || data);
        })

    }

    self.audio.addEventListener('ended', () => {
      self.stopPlayVoice();
    });
  }
});

window._messageFriendApplication = (uid, type) => {
  nkcAPI(`/message/friend`, 'POST', {
    uid,
    type
  })
    .catch(sweetError);
};