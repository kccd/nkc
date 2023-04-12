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
      this.socket.on('unreadMessageCount', (data) => {
        const {newMessageCount} = data;
        this.unreadMessageCount = newMessageCount;
        if(this.unreadMessageCount>0){

        }
        // if(redEnvelopeStatus){
        //   this.showLottery = true
        // }
      });
      this.socket.on('receiveMessage', (data) => {
        if(data.localId) return;
        this.unreadMessageCount += 1;
      })
    },
    initAudio() {
      this.audio = new Audio();
      this.audio.src = getUrl('messageTone');
    },
    playAudio(url) {
      const app = this;
      this.audio.onload = function() {
        app.play();
      };
      this.audio.src = url;
      this.audio.play();
    },
  },

}
</script>
<style scoped lang="less"></style>
