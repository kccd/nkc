<template lang="pug">
  .zone-bubble-container(@click="scroll" :style="{'width':`${getBubbleWidth}`}")
    //span.bubble-up.fa.fa-arrow-up
    .bubble-body
      .bubble-avatars
        img(v-for='url,index in displayAvatars' :src='url' :style="{'z-index':-index}")
      span.bubble-text 有更新
</template>

<style lang="less" scoped>
@height: 3rem;
.zone-bubble-container{
  position: fixed;
  // top: 50%;
  left: 50%;
  // margin: auto;
  transform: translate3d(-50%, 0%,0);
  top: 5rem;
  background-color: rgba(43,144,217,0.73);
  border-radius: 2.5rem;
  z-index: 1000;
  color: #fff;
  cursor: pointer;
  transition: width 300ms;
  .bubble-body{
    @textWidth: 5rem;
    padding-left: 0.5rem;
    height: @height;
    line-height: @height;
    position: relative;
    padding-right: @textWidth;
    .bubble-avatars{
    // width: 7rem;
    display: inline-block;
    overflow: hidden;
    height: @height;
    img{
      vertical-align: middle;
      width: 2.5rem;
      height: 2.5rem;
      border: #fff solid 1px;
      display: inline-block;
      border-radius: 50%;
      position: relative;
      &:not(:first-child) {
        margin-left: -1rem;
      }
    }
  }
    .bubble-text{
      position: absolute;
      top: 0;
      right: 0;
      width: @textWidth;
    }
  }
  /*.bubble-up{
    cursor: pointer;
    // display: none;
    overflow: hidden;
  }*/
}
</style>

<script>
import {objToStr } from '../../js/dataConversion';
import { nkcAPI } from '../../js/netAPI';
import { visitUrl } from '../../js/pageSwitch';
import { sweetError, sweetQuestion,} from '../../js/sweetAlert';
export default {
  props: ['avatars'],
  components: {
  },
  data: () => ({
    shorted:true,
    lock:false
  }),
  mounted() {
  },
  computed:{
    displayAvatars(){
      return this.avatars.slice(0,3);
    },
    getBubbleWidth(){
      switch (this.displayAvatars.length) {
        case 1:
          return '9rem';
        case 2:
          return '10.5rem';
        case 3:
          return '12rem';
        default:
          return '12rem';
      }
    }
  },
  methods: {
    scroll(){
      this.$emit("scroll");
    },
  }
}
</script>
