<template>
  <div></div>
</template>
<script lang="ts">
import { getSocket } from '../../js/socket.js'
import { getUrl } from '../../js/tools.js'
import { initEventToGetUnreadMessageCount } from '../../js/socket.js'
export default {
  data: () =>({
    socket: null,
    audio: null,
    unreadMessageCount:0,
  }),
  mounted() {
    // this.initAudio();
    // this.socket = getSocket();
    //初始化拿到未读的数据
    initEventToGetUnreadMessageCount((unreadMessageCount) => {
      this.updateUnreadMessageToDom(unreadMessageCount);
    });
  },
  methods:{
    // 初始化 数据来源于本地或默认数据
    // initSocket(){
    //   //获取未读消息
    //   // this.socket.on('unreadMessageCount', (data) => {
    //   //   const {newMessageCount} = data;
    //   //   this.unreadMessageCount = newMessageCount;
    //   //   this.updateNavUnreadMessageCountToDom();
    //   // });
    //   //接受到新消息
    //   // this.socket.on('receiveMessage', (data) => {
    //   //   if (data.localId && data.chat.type === 'UTU') return;
    //   //   if (data.beep) {
    //   //     this.playAudio(data.beep); // 播放音频
    //   //   }
    //   //   if (data.selfDefine) {
    //   //     this.unreadMessageCount -= 1;
    //   //   } else {
    //   //     this.unreadMessageCount += 1;
    //   //   }
    //   //   this.updateNavUnreadMessageCountToDom();
    //   // });
    //   //读取未读消息
    //   // this.socket.on('markAsRead',(data) =>{
    //   //   const { unread } = data;
    //   //   this.unreadMessageCount = unread;
    //   //   this.updateNavUnreadMessageCountToDom();
    //   // })
    // },
    // //初始化音频
    // initAudio() {
    //   this.audio = new Audio();
    //   this.audio.src = getUrl('messageTone');
    // },
    //播放音频
    // playAudio(url) {
    //   this.audio.onload = function() {
    //     this.audio.play();
    //   };
    //   this.audio.src = url;
    // },
    //更新导航栏未读消息
    updateUnreadMessageToDom(unreadMessageCount){
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

}
</script>
<style scoped lang="less"></style>
