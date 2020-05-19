const data = NKC.methods.getDataById('data');
window.app = new Vue({
  el: '#container',
  data: {
    socketId: Date.now() + '' + Math.round(Math.random()*1000),
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
    content: ''
  },
  methods: {
    // 格式化时间
    timeFormat: NKC.methods.timeFormat,
    // 获取链接
    getUrl: NKC.methods.tools.getUrl,
    toast(c) {
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
        if(m.contentType === 'img') {
          urls.push({
            name: m.content.filename,
            url: m.content.fileUrl
          });
        }
      }
      urls.reverse();
      const index = urls.map(u => u.url).indexOf(url);
      urls.map(u => u.url = location.origin + u.url);
      NKC.methods.rn.emit('viewImage', {
        index,
        urls
      })
    },
    // 访问用户主页
    openUserHome(uid) {
      NKC.methods.rn.emit('openNewPage', {
        href: location.origin + this.getUrl('userHome', uid)
      });
    },
    // 发送消息
    sendMessage(message) {
      const self = this;
      const type = message? 'resend': 'send';
      const focus = $(this.$refs.input).is(':focus');
      if(!message) {
        // 发送一条信息
        const {content} = self;
        const localMessageId = Date.now();
        message = {
          _id: localMessageId,
          contentType: 'html',
          content,
          s: self.mUser.uid,
          r: self.tUser.uid,
          messageType: 'UTU',
        }
      } else {
        // 重发一条消息

      }
      message.status = 'sending'; // sent已发送、sending正在发送、error出错
      message.time = Date.now();

      Promise.resolve()
        .then(() => {
          if(!message.content) throw '请输入聊天内容';
          self.originMessages.push(message);
          self.content = "";
          self.autoResize(true);
          self.scrollToBottom();
          self.keepFocus(true);
          return nkcAPI(`/message/user/${message.r}`, 'POST', {
            content: message.content,
            socketId: self.socketId,
          });
        })
        .then((data) => {
          const index = self.originMessages.indexOf(message);
          message.status = 'sent';
          if(index >= 0) {
            Vue.set(self.originMessages, index, data.message2);
            self.scrollToBottom();
          }
        })
        .catch(data => {
          message.status = 'error';
          self.toast(data.error || data.message || data);
        })
    },
    insertMessage(message) {
      if(![this.tUser.uid, this.mUser.uid].includes(message.r)) return;
      this.originMessages.push(message);
      this.scrollToBottom();
    }
  },
  computed: {
    messages() {
      const {originMessages, mUser, tUser} = this;
      let messagesId = [];
      const messagesObj = {};
      const messages = [];
      for(const m of originMessages) {
        const {_id, s} = m;
        const ownMessage = s === mUser.uid;
        messagesId.push(_id);
        m.position = ownMessage? 'right': 'left';
        m.sUser = ownMessage? mUser: tUser;
        messagesObj[_id] = m;
      }
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
    window.addEventListener('click', () => {
      if(self.showStickerPanel) {
        self.switchStickerPanel(false);
      }
    });
    self.scrollToBottom()
  }
});
