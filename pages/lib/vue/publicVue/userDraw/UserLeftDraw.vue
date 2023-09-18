<template lang="pug">
  .nkc-drawer-left(:class="{'active': show}")
    .nkc-drawer-left-mask(@click="showDraw" :class="{'active': show}")
    .nkc-drawer-left-body(:class="{'active': show}")
      .left-draw-container(v-if="show && !loading")
        .m-a-1
        .navbar-link
          .col-xs-3
            a(href='/n') 最新
          .col-xs-3
            a(href='/g/moment' v-if="logged" ) 关注
            a(onclick="RootApp.openLoginPanel()" v-else) 关注
          .col-xs-3
            a(href=`/m`) 专栏
          .col-xs-3
            a(href=`/c`) 论坛
          .col-xs-3
            a(href=`/z`) 电波
        .m-a-1#navbar_custom_dom
        .m-a-1
          Management(:management="management")
          Apps(:permission="permission")
          Forums(:forums="categoryForums")
      .left-draw-loading(v-else)
        .loading
          .fa.fa-spinner.fa-spin.fa-fw
          .loading-text 加载中
</template>
<style lang="less">
@import '../../../../publicModules/base';
.nkc-drawer-left{
  position: fixed;
  top: 0;
  height: 0;
  width: 100%;
  z-index: 500;
  left: 0;
  background-color: rgba(0,0,0,0.2);
}
.nkc-drawer-left-body {
  width: 70%;
  position: fixed;
  top: 0;
  right: -70%;
  /*z-index: 10003;*/
  padding-top: 50px;
  z-index: 500;
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
  transition: right 300ms, left 300ms;
}
.nkc-drawer-left.active{
  height: 100%;
}
.nkc-drawer-left-body.active{
  left: 0;
}
</style>
<script>
import ManagementVue from "./ManagementVue";
import AppsVue from "./AppsVue";
import ForumTreeVue from "./ForumTreeVue";
import {nkcAPI} from "../../../js/netAPI";
import {getState} from "../../../js/state";
const {uid} = getState();
export default {
  data: () => ({
    logged: !!uid,
    loading: true,
    show: false,
    permission: {
      nkcManagement: false,
      visitExperimentalStatus: false,
      review: false,
      complaintGet: false,
      visitProblemList: false,
      getLibraryLogs: false,
      enableFund: false,
    },
    categoryForums: [],
    management: [],
  }),
  components: {
    Management: ManagementVue,
    Apps: AppsVue,
    Forums: ForumTreeVue
  },
  mounted() {
  },
  watch: {
    show(oldValue, newValue) {
      let bodyEl = document.body;
      let nkcDrawerBodyTop;
      if(this.show === true) {
        nkcDrawerBodyTop = window.scrollY;
        bodyEl.style.position = 'fixed';
        bodyEl.style.top = -nkcDrawerBodyTop + 'px';
      } else {
        bodyEl.style.position = '';
        bodyEl.style.top = '';
        window.scrollTo(0, nkcDrawerBodyTop) // 回到原先的top
      }
    }
  },
  methods: {
    getState: getState,
    getLeftDrawData(){
      const _this = this;
      nkcAPI('/draw/leftDraw', 'GET' , {})
        .then(res => {
          _this.categoryForums = res.categoryForums;
          _this.permission = res.permission;
          _this.management = res.managementData;
          _this.loading = false;
        })
        .catch(err => {
          sweetError(err);
        })
    },
    showDraw(){
      if(this.loading) {
        this.getLeftDrawData();
      }
      this.show = !this.show;
    },
    closeDraw() {
      this.show = false;
    },
  }
}
</script>

