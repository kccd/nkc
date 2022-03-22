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
import {throttle} from "../../../js/execution";
export default {
  data:() => ({
    show: false,
    loading: true,
    anvState: null
  }),
  components: {
    "user-nav": userNav,
  },
  mounted() {
  },
  methods: {
    updateNewMessageCount(count) {
      this.anvState.newMessageCount = count;
    },
    //获取用户导航数据
    getUserNavData: throttle(function (){
      if(this.anvState) return;
      const _this = this;
      nkcAPI(`/draw/userNav`, 'GET', {})
        .then(res => {
          _this.anvState = res.anvState;
          _this.loading = false;
        })
        .catch(err => {
          sweetError(err);
        })
    }, 100),
    showDraw(){
      if(!this.anvState) {
        this.getUserNavData()
      }
      this.show = true;
    }
  }
}
</script>
