<template>
  <div></div>
</template>
<script lang="ts">
import { getSocket } from '../../js/socket.js'

export default {
  data: () =>({
    socket: null,
    unreadMessageCount:0,
  }),
  mounted() {
    this.socket = getSocket();
    this.initSocket();
  },
  methods:{
    initSocket(){
      this.socket.on('unreadMessageCount', (data) => {
        const {newMessageCount} = data;
        this.unreadMessageCount = newMessageCount;
        // if(redEnvelopeStatus){
        //   this.showLottery = true
        // }
      });
      this.socket.on('receiveMessage', (data) => {
        console.log(data, 'data');
      })
    },
  },

}
</script>
<style scoped lang="less"></style>
