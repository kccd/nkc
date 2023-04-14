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
    this.initAudio();
    this.socket = getSocket();
    //初始化拿到未读的数据
    initEventToGetUnreadMessageCount((unreadMessageCount) => {
      this.updateUnreadMessageToDom(unreadMessageCount);
    });
  },
  methods:{
    // 初始化 数据来源于本地或默认数据
    initSocket(){
      // 接受到新消息
      this.socket.on('receiveMessage', (data) => {
        if (data.beep) {
          this.playAudio(data.beep); // 播放音频
        }
      });
    },
    // //初始化音频
    initAudio() {
      this.audio = new Audio();
      this.audio.src = getUrl('messageTone');
    },
    // 播放音频
    playAudio(url) {
      this.audio.onload = function() {
        this.audio.play();
      };
      this.audio.src = url;
    },
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
