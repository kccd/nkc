<template lang="pug">
  .page-header
    .page-header-left
      div(@click="clickLeftButton" v-if="leftIcon")
        div(:class="leftIcon")
    .page-header-center {{title}}
    .page-header-right
      div(@click="clickRightButton" v-if="rightIcon")
        div(:class="rightIcon")
</template>

<style scoped lang="less">
  @import "../message.2.0.less";
  .page-header{
    margin: 0;
    height: @headerHeight;
    box-shadow: 1px 1px 13px -7px rgba(0,0,0,0.66);
    border-bottom: 1px solid #ddd;
    position: relative;
    padding: 0 @headerHeight;
    .page-header-center{
      line-height: @headerHeight;
      text-align: center;
      font-size: 1.3rem;
    }
    .page-header-left, .page-header-right{
      position: absolute;
      top: 0;
      left: 0;
      height: @headerHeight;
      width: @headerHeight;
      line-height: @headerHeight;
      text-align: center;
      font-size: 1.6rem;
      &>div{
        height: 100%;
        width: 100%;
        cursor: pointer;
        &:hover, &:active{
          background-color: rgba(0, 0, 0, 0.05);
        }
      }

    }
    .page-header-right{
      left: auto;
      right: 0;
    }
  }
</style>

<script>
  export default {
    props: ['title', 'leftIcon', 'rightIcon'],
    data: () => ({

    }),
    methods: {
      clickLeftButton() {
        this.$emit('onClickLeftButton');
      },
      clickRightButton() {
        this.$emit('onClickRightButton');
      },
    }
  }
</script>