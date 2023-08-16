<template lang="pug">
  .modal.fade.module-login(tabindex="-1" role="dialog" aria-labelledby="myModalLabel" data-name="loginModule")
    .modal-dialog(role="document").module-login-app
      .modal-content
        .login-header
          .web-close(@click="close" v-if="!isApp")
            close-small-icon
          .rn-close(@click="close" v-else) 关闭
        login-core(ref="loginCore" @logged="onLogged" @registered="onRegistered")
</template>

<style lang="less" scoped>
  .module-login{
    z-index: 2000;
  }
  @media (min-width: 768px){
    .modal-dialog{
      width: 370px;
    }
  }
  .module-login-app{
    position: relative;
  }
  .modal-content{
    border-radius: 3px;
    box-shadow: none;
  }
  .login-header{
    @headerHeight: 4rem;
    height: @headerHeight;
    .web-close{
      position: absolute;
      height: @headerHeight;
      width: @headerHeight;
      right: 0;
      top: 0;
      padding-top: 0.5rem;
      text-align: center;
      line-height: @headerHeight;
      color: #999;
      cursor: pointer;
      font-size: 2rem;
      &:hover{
        color: #333;
      }
    }
    .rn-close{
      text-align: right;
      font-size: 1.3rem;
      height: @headerHeight;
      color: #555;
    }
  }
</style>

<script>
  import {getState} from '../js/state';
  import {
    RNCloseWebview, RNLogin
  } from "../js/reactNative";
  import {nkcAPI} from "../js/netAPI";
  import LoginCore, {LoginType} from './LoginCore.vue'
  import {CloseSmall} from '@icon-park/vue'
  const {
    isApp,
  } = getState();

  let timeout;

  export default {
    components: {
      'login-core': LoginCore,
      'close-small-icon': CloseSmall,
    },
    data: () => ({
      isApp,
    }),
    mounted() {
      this.initModal();
    },
    methods: {
      initModal() {
        $(this.$el).modal({
          show: false,
          backdrop: "static"
        });
      },
      close: function() {
        if(isApp) {
          RNCloseWebview();
        } else {
          $(this.$el).modal("hide");
        }
      },
      open: function(type = LoginType.SignIn) {
        this.$refs.loginCore.selectType(type);
        nkcAPI("/api/v1/exam/public/register","GET").then((res)=>{
          if (res && res.data.registerExamination && type === 'register') {
            window.location.href = "/exam/public"
          } else {
            $(this.$el).modal("show");
          }
        }).catch((err)=>{
          sweetError(err)
        })
      },
      onLogged() {
        if(this.isApp) {
          RNLogin();
        } else {
          window.location.reload();
        }
      },
      onRegistered() {
        if(this.isApp) {
          RNLogin();
        } else {
          window.location.href = "/register/subscribe";
        }
      }
    }
  };

  export {LoginType};

</script>
