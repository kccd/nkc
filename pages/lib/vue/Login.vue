<template lang="pug">
  .modal.fade.module-login(tabindex="-1" role="dialog" aria-labelledby="myModalLabel" data-name="loginModule")
    .modal-dialog(role="document").module-login-app
      .modal-content
        .login-header
          .web-close(@click="close" v-if="!isApp")
            close-small-icon
          .rn-close(@click="close" v-else) 关闭
        login-core(ref="loginCore" @logged="onLogged" @registered="onRegistered" v-if="show" :defaultLoginType="defaultLoginType")
</template>

<style lang="less" scoped>
.module-login {
  z-index: 2000;
}
@media (min-width: 768px) {
  .modal-dialog {
    width: 370px;
  }
}
.module-login-app {
  position: relative;
}
.modal-content {
  border-radius: 3px;
  box-shadow: none;
}
.login-header {
  @headerHeight: 4rem;
  height: @headerHeight;
  .web-close {
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
    &:hover {
      color: #333;
    }
  }
  .rn-close {
    text-align: right;
    font-size: 1.3rem;
    height: @headerHeight;
    color: #555;
  }
}
</style>

<script>
import { getState } from '../js/state';
import { RNCloseWebview, RNLogin } from '../js/reactNative';
import { visitUrl } from '../js/pageSwitch';
import LoginCore, { modes } from './LoginCore.v2.vue';
import CloseSmall from '@icon-park/vue/es/icons/CloseSmall';
const { isApp } = getState();
import { getDefaultLoginType, loginTypes } from '../js/login';
import { logger } from '../js/logger';

let timeout;

export default {
  components: {
    'login-core': LoginCore,
    'close-small-icon': CloseSmall,
  },
  data: () => ({
    isApp,
    show: false,
    defaultLoginType: {
      desktop: loginTypes.sms,
      mobile: loginTypes.sms,
      app: loginTypes.sms,
    },
  }),
  mounted() {
    this.initModal();
  },
  methods: {
    initModal() {
      $(this.$el).modal({
        show: false,
        backdrop: 'static',
      });
      this.show = false;
    },
    close() {
      if (isApp) {
        RNCloseWebview();
      } else {
        $(this.$el).modal('hide');
        this.show = false;
      }
    },
    open(type = modes.login) {
      getDefaultLoginType()
        .then((loginType) => {
          this.show = true;
          setTimeout(() => {
            this.$refs.loginCore.selectMode(type);
            this.$refs.loginCore.selectLoginType(loginType);
            $(this.$el).modal('show');
          }, 100);
        })
        .catch(logger.error);
    },
    login() {
      this.open(modes.login);
    },
    register() {
      this.open(modes.register);
    },
    onLogged() {
      if (this.isApp) {
        RNLogin();
      } else {
        window.location.reload();
      }
    },
    onRegistered() {
      if (this.isApp) {
        RNLogin();
      } else {
        visitUrl('/register/subscribe');
      }
    },
  },
};
</script>
