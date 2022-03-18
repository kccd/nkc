<template lang="pug">
  .user-panel
    .user-nav-container(v-if="show && !loading")
      user-nav(:user="anvState")
    .left-draw-loading(v-else)
      .loading
        .fa.fa-spinner.fa-spin.fa-fw
        .loading-text 加载中
</template>

<style lang="less">
@import '../../../../publicModules/base';
.user-panel {
  height: 100%;
  background: #fff;
}
</style>

<script>
import userNav from "../../../../publicModules/userNav/userNavBox";
import {nkcAPI} from "../../../js/netAPI";
export default {
  data:() => ({
    show: false,
    loading: true,
    anvState: {}
  }),
  components: {
    "user-nav": userNav,
  },
  mounted() {
    this.getUserNavData();
  },
  methods: {
    updateNewMessageCount(count) {
      this.anvState.newMessageCount = count;
    },
    //获取用户导航数据
    getUserNavData(){
      const _this = this;
      nkcAPI(`/draw/userNav`, 'GET', {})
        .then(res => {
          _this.anvState = res.anvState;
          _this.loading = false;
        })
        .catch(err => {
          sweetError(err);
        })
    },
    showDraw(){
      this.show = true;
    }
  }
}
</script>
