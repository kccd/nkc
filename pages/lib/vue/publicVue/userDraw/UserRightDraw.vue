<template lang="pug">
  .nkc-drawer-right(:class="{'active': show}")
    .nkc-drawer-right-mask(:class="{'active': show}" @click="showDraw")
      .nkc-drawer-right-body(:class="{'active': show}")
        .right-draw-container(v-if="show && !loading")
          .right-draw-content(v-if="drawState.uid")
            user-vue(:remote="drawState")
            user-draw-count(:user="user")
            user-list(
              :user="user"
              :column="drawState.userInfo.userColumn"
              :permission="drawState.columnPermission"
              :count="unreadMessageCount"
            )
            a(onclick="NKC.methods.logout()").nkc-drawer-exit 退出登录
        .left-draw-loading(v-else)
          .loading
            .fa.fa-spinner.fa-spin.fa-fw
            .loading-text 加载中
</template>

<style lang="less">
@import '../../../../publicModules/base';
.nkc-drawer-right{
  position: fixed;
  top: 0;
  height: 0;
  width: 100%;
  z-index: 500;
  left: 0;
  background-color: rgba(0,0,0,0.2);
}
.nkc-drawer-right.active {
  height: 100%;
}
.nkc-drawer-right-body {
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
.nkc-drawer-right-body.active{
  right: 0;
}
</style>

<script>
import UserVue from "./UserVue";
import userDrawCount from "./UserDrawCount";
import userLogin from "./UserLogin";
import userList from "./UserList";
import {nkcAPI} from "../../../js/netAPI";
import { initEventToGetUnreadMessageCount } from "../../../js/socket";
import {getState} from '../../../js/state'
const state = getState();
export default {
  data:() => ({
    user: {},
    show: false,
    loading: true,
    drawState: {},
    logged: !!state.uid,
    unreadMessageCount: 0,
  }),
  components: {
    "user-vue": UserVue,
    "user-draw-count": userDrawCount,
    "user-login": userLogin,
    "user-list": userList,
  },
  mounted() {
    if(this.logged) {
      initEventToGetUnreadMessageCount((unreadMessageCount)=>{ this.getUnreadMessageCount(unreadMessageCount)});
    }
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
    updateNewMessageCount(count) {
      this.drawState.newMessageCount = count;
    },
    //获取socket的未读消息
    getUnreadMessageCount(unreadMessageCount){
      this.unreadMessageCount = unreadMessageCount;
    },
    //获取用户数据面板
    getRightDrawData(){
      const _this = this;
      nkcAPI('/draw/userDraw', 'GET', {})
        .then(res => {
          _this.drawState = res.drawState;
          _this.user = res.user;
          _this.loading = false;
        })
        .catch(err => {
          sweetError(err);
        })
    },
    showDraw(){
      if(this.loading) {
        this.getRightDrawData()
      }
      this.show = !this.show;
    },
    closeDraw() {
      this.show = false;
    }
  }
}
</script>
