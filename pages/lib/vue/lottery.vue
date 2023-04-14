<template lang="pug">
.lottery.text-right(ref="lottery", v-if="lotteryClose")
  .lottery-close(v-if="!open")
    .lottery-body.text-left
      .lottery-header
      .lottery-button(@click="lottery()") 开
      .lottery-info 恭喜您获得了一次拆红包的机会！
  .lottery-open(v-if="open")
    .lottery-header
    .lottery-body
      .lottery-info-header {{ data.result.name }}
      .lottery-info {{ data.result ? '获得' + data.score.name + numToFloatTwo(data.score.num) + data.score.unit : '哈哈没中' }}
      .lottery-info(style="color: #ddd") 每天第一次发表可能获得拆红包机会
  .close-lottery.fa.fa-remove(@click="closeLottery()")
</template>
<script>
import { nkcAPI } from "../js/netAPI";
import { screenTopWarning } from "../js/topAlert";
import { getSocket } from '../js/socket';
const socket = getSocket();
export default {
  name: "lottery",
  data: () => ({
    open: false,
    data: {},
    lotteryClose: false,
  }),
  mounted() {
    socket.on('redEnvelopeStatus', (data) => {
      const {redEnvelopeStatus} = data;
      if(redEnvelopeStatus){
        this.lotteryClose = true
      }
    });
  },
  methods: {
    lottery() {
      nkcAPI("/lottery", "POST", {})
        .then((data) => {
          this.data = data;
          this.open = true;
        })
        .catch(function (data) {
          screenTopWarning(data.error || data);
        });
    },
    numToFloatTwo(str) {
      str = (str / 100).toFixed(2);
      return str;
    },
    closeLottery() {
      if (this.data.result && this.open) {
        return (this.lotteryClose = false);
      }
      nkcAPI("/lottery", "DELETE", {})
        .then(() => {
          this.lotteryClose = false;
        })
        .catch(function (data) {
          screenTopWarning(data.error || data);
        });
    },
  },
};
</script>

<style lang="less" scoped>
.lottery {
  position: fixed;
  right: 1rem;
  bottom: 5rem;
  width: 13rem;
  height: 18rem;
  max-width: 100%;
  z-index: 20000;
}
.lottery .lottery-close {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.lottery .lottery-close .lottery-header {
  width: 100%;
  height: 10rem;
  border-radius: 50%;
  margin-top: -5rem;
  z-index: 30;
  background-color: #ee0d0d;
  box-shadow: rgba(0, 0, 0, 0.14) 3px 0 10px;
}
.lottery .lottery-button {
  height: 4rem;
  cursor: pointer;
  width: 4rem;
  margin: auto;
  text-align: center;
  line-height: 4rem;
  background-color: #f0a607;
  border-radius: 50%;
  margin-top: -2rem;
  color: #eee;
  user-select: none;
  font-size: 2rem;
}
.lottery .lottery-body {
  height: 100%;
  width: 100%;
  position: absolute;
  overflow: hidden;
  z-index: 20;
  background-color: #cf1717;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.14) 3px 3px 10px;
}
.lottery-button:active {
  background-color: #de9b09;
}

.lottery .lottery-open {
  height: 100%;
  width: 100%;
}
.lottery .lottery-open .lottery-header {
  width: 100%;
  height: 10rem;
  position: absolute;
  top: -5rem;
  border-radius: 50%;
  z-index: 10;
  background-color: #ee0d0d;
  box-shadow: rgba(0, 0, 0, 0.14) 3px 0 10px;
}
.lottery .lottery-open .lottery-button {
  height: 4rem;
  cursor: pointer;
  width: 4rem;
  margin: auto;
  text-align: center;
  line-height: 4rem;
  background-color: #f0a607;
  border-radius: 50%;
  margin-top: -2rem;
  color: #eee;
  user-select: none;
  font-size: 2rem;
}
.close-lottery {
  position: absolute;
  font-size: 1.4rem;
  top: -2.6rem;
  line-height: 2.3rem;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  height: 2.3rem;
  text-align: center;
  width: 2.3rem;
  right: 0;
  cursor: pointer;
  z-index: 40;
}
.lottery-info {
  padding: 1.5rem 0.5rem 0 0.5rem;
  color: #fff;
  text-align: center;
}
.lottery-info-header {
  color: #ffad00;
  font-size: 2rem;
  text-align: center;
  margin-top: 3rem;
}
</style>
