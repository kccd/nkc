<template lang="pug">
  .zone-bubble-container(@click="scroll" :style="{'width':`${getBubbleWidth}`}")
    span.bubble-up.fa.fa-arrow-up
    .bubble-avatars
      img(v-for='url,index in displayAvatars' :src='url' :style="{'z-index':-index}") 
    span.bubble-text 已发布
</template>

<style lang="less" scoped>
.zone-bubble-container{
  
  position: fixed;
  // top: 50%;
  left: 50%;
  // margin: auto;
  transform: translate3d(-50%, 0%,0);
  top: 4rem;
  display:flex;
  height: 3.5rem;
  line-height: 3rem;
  background-color: rgba(43,144,217,0.73);
  border-radius: 2.5rem;
  z-index: 1000;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0.5rem;
  // gap: 1rem;
  color: #fff;
  transition: width 0.3s ease;
  // &:hover{
  //   width: 16rem !important;
  //   .bubble-up,.bubble-text{
  //     display: inline;
  //   }
  // }
  cursor: pointer;
  .bubble-up{
    cursor: pointer;
    // display: none;
    overflow: hidden;
  }
  .bubble-avatars{
    // width: 7rem;
    overflow: hidden;
    height: 3rem;
    img{
      vertical-align: middle;
      width: 2.5rem;
      height: 2.5rem;
      border: #fff solid 1px;
      border-radius: 50%;
      position: relative; 
      &:not(:first-child) {
      margin-left: -1rem;
      }
    }
  }
  .bubble-text{
    overflow: hidden;
    height:3rem;
    // display: none;
  }
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
