<template>
  <div></div>
</template>
<script lang="ts">
import { getSocket } from '../../js/socket.js'
import { getUrl } from '../../js/tools.js'
export default {
  data: () =>({
    socket: null,
    audio: null,
    unreadMessageCount:0,
  }),
  mounted() {
    this.initAudio();
    this.socket = getSocket();
    this.initSocket();
  },
  methods:{
    // 初始化 数据来源于本地或默认数据
    initSocket(){
      //获取未读消息
      this.socket.on('unreadMessageCount', (data) => {
        const {newMessageCount} = data;
        this.unreadMessageCount = newMessageCount;
        if(this.unreadMessageCount>0){
          this.updateNavUnreadMessageCountToDom();
        }
      });
      //接受到新消息
      this.socket.on('receiveMessage', (data) => {
        if (data.localId && data.chat.type === 'UTU') return;
        if (data.beep) {
          this.playAudio(data.beep); // 播放音频
        }
        if (data.isUser) {
          this.unreadMessageCount -= 1;
        } else {
          this.unreadMessageCount += 1;
        }
        this.updateNavUnreadMessageCountToDom();
      });
      //读取未读消息
      this.socket.on('markAsRead',(data) =>{
        const { unread } = data;
        this.unreadMessageCount = unread;
        this.updateNavUnreadMessageCountToDom();
      })
    },
    //初始化音频
    initAudio() {
      this.audio = new Audio();
      this.audio.src = getUrl('messageTone');
    },
    //播放音频
    playAudio(url) {
      const app = this;
      this.audio.onload = function() {
        app.play();
      };
      this.audio.src = url;
      setTimeout(()=>{
        this.audio.play();
      },1)
    },
    //更新导航栏未读消息
    updateNavUnreadMessageCountToDom(){
      const { unreadMessageCount } = this;
      const documents = $('.message-count');
      const containers = $('.message-count-container');
      if(unreadMessageCount === 0) {
        containers.addClass('hidden');
        documents.addClass('hidden').text('');
      }
      else {
        containers.removeClass('hidden');
        documents.removeClass('hidden').text(unreadMessageCount);
      }
    },
  },
  watch:{
    unreadMessageCount(newValue){
      this.$emit('unread-message-count',newValue)
    }
  },

}
</script>
<style scoped lang="less"></style>
