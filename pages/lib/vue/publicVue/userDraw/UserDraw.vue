<template lang="pug">
  //- 侧滑抽屉
  .user-draw
    //左侧
    user-left-draw(ref="userLeftDraw")
    //右侧
    user-right-draw(ref="userRightDraw")
</template>

<style lang="less">
@import '../../../../publicModules/base';
</style>

<script>
import UserLeftDraw from "./UserLeftDraw";
import UserRightDraw from "./UserRightDraw";
export default {
  data:() => ({
  }),
  components: {
    "user-left-draw": UserLeftDraw,
    "user-right-draw": UserRightDraw
  },
  mounted() {
  },
  methods: {
    //打开抽屉
    openDraw(type) {
      if(type === 'left') {
        //打开左侧抽屉
        this.$refs.userLeftDraw.showDraw();
      } else if(type === 'right'){
        //打开右侧抽屉
        this.$refs.userRightDraw.showDraw();
      }
    },
    closeDraw(type) {
      if(type === 'left') {
        //关闭左侧抽屉
      } else if(type === 'right') {
        //关闭右侧抽屉
      }
    },
  }
}
</script>
