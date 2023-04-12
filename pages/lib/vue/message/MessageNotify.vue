<template>
  <div></div>
</template>
<script lang="ts">
import { getSocket } from '../../js/socket.js'

export default {
  data: () =>({
    socket: null,
    newMessageCount:0,
  }),
  mounted() {
    this.socket = getSocket();
    this.initSocket();
  },
  methods:{
    initSocket(){
      this.socket.on('newMessageCountAndRedEnvelopeStatus', (data) => {
        const {redEnvelopeStatus , newMessageCount} = data;
        this.newMessageCount = newMessageCount;
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
