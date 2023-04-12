<template>
  <div></div>
</template>
<script lang="ts">
import { getSocket } from '../../js/socket.js'

export default {
  data: () =>({
    socket: null,
  }),
  mounted() {
    this.socket = getSocket();
    this.initSocket();
  },
  methods:{
    initSocket(){
      this.socket.on('newMessageCountAndRedEnvelopeStatus', (data) => {
        console.log(data, 'data')
        const {redEnvelopeStatus , newMessageCount} = data;
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
