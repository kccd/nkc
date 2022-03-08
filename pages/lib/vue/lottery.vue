<template lang="pug">
.lottery.text-right
  .lottery-close
    .lottery-body.text-left
      .lottery-header
      .lottery-button(onclick="lottery()") 开
      .lottery-info 恭喜您获得了一次拆红包的机会！
  .lottery-open
    .lottery-header
    .lottery-body
      .lottery-info-header
      .lottery-info
      .lottery-info(style="color: #ddd") 每天第一次发表可能获得拆红包机会
  .close-lottery.fa.fa-remove(onclick="closeLottery()")
</template>
<script>
export default {
  name: "lottery",
  data: () => ({
    // socketApp:null,
    // show:false
  }),
  mounted() {
    // this.initSocket(this.socket);
  },
  methods: {
    // initSocket(socketApp) {
    //       const app = this;
    //       if(this.socketApp === socketApp) return;
    //       this.socketApp = socketApp;
    //       // 接收消息lotteryMessage
    //       socketApp.on('updateNewMessageCount', (status)=>{
    //         console.log(status)
    //       });
    //       socketApp.on('connect', () => {
    //         console.log('红包页连接上socket')
    //       });
    //       addSocketStatusChangedEvent(socketApp, this.setSocketStatus)
    //     },
  },
};
</script>

<style>
</style>