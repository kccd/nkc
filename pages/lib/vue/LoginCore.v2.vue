<template lang="pug">
  div(:class='$style.container')
    verifications(ref="verifications")
    a(href='/' :class="$style.websiteName") {{websiteName}}
    div(:class="$style.websiteBrief") {{websiteBrief}}
    div(:class='$style.loginTypes' v-if="isLogin")
      div(v-if='!isApp' :class='$style.loginType' :data-active="loginType === loginTypes.qr" @click="selectLoginType(loginTypes.qr)")
        div
          <scan-code theme="outline" size="24" />
        div APP扫码
      div(:class='$style.loginType' :data-active="loginType === loginTypes.sms" @click="selectLoginType(loginTypes.sms)")
        div
          <mail theme="outline" size="24" />
        div 短信验证码
      div(:class='$style.loginType' :data-active="loginType === loginTypes.passwd" @click="selectLoginType(loginTypes.passwd)")
        div
          <avatar theme="outline" size="24" />
        div 用户名密码
    //登录
    div(:class="$style.formContainer" v-if="isLogin")
      login-by-qr(v-if="loginType === loginTypes.qr" @logged="onLogged")
      div(:class="$style.smsContainer" v-if="loginType === loginTypes.sms")
        .form-group
          select.form-control(v-model="nationCode" @input="throwError('')" @keyup.enter="submit")
            option(v-for="code in nationCodes" :value="code.code") +{{code.code}} {{code.chineseName}}
        .form-group
          input.form-control(type="text" placeholder="手机号" v-model.trim="mobile" @input="throwError('')" @keyup.enter="submit")
        .row.form-group
          .col-xs-6
            input.form-control(type="text" placeholder="短信验证码" v-model.trim="code" @input="throwError('')" @keyup.enter="submit")
          .col-xs-6.text-right.p-l-0
            div(:class="$style.smsButton" v-if="waiting === 0" @click="sendMobileCode('login')") 发送验证码
            div(data-disabled="true" :class="$style.smsButton" v-else) 发送验证码({{waiting}})
      div(:class="$style.passwdContainer" v-if="loginType === loginTypes.passwd")
        .form-group
          input.form-control(type="text" name="username" placeholder="用户名" v-model.trim="username" @input="throwError('')" @keyup.enter="submit" autocomplete="username")
        .form-group
          input.form-control(type="password" name="password" placeholder="密码" v-model.trim="password" @input="throwError('')" @keyup.enter="submit" autocomplete="current-password")
    // 注册
    div(:class="$style.formContainer" v-else)
      div(:class="$style.smsContainer")
        .form-group
          select.form-control(v-model="nationCode" @input="throwError('')" @keyup.enter="submit")
            option(v-for="code in nationCodes" :value="code.code") +{{code.code}} {{code.chineseName}}
        .form-group
          input.form-control(type="text" placeholder="手机号" v-model.trim="mobile" @input="throwError('')" @keyup.enter="submit")
        .row
          .col-xs-6
            .form-group
              input.form-control(type="text" placeholder="短信验证码" v-model.trim="code" @input="throwError('')" @keyup.enter="submit")
          .col-xs-6.text-right.p-l-0
            div(:class="$style.smsButton" v-if="waiting === 0" @click="sendMobileCode('register')") 发送验证码
            div(data-disabled="true" :class="$style.smsButton" v-else) 发送验证码({{waiting}})
    // 按钮
    .form-group(:class="$style.buttonContainer")
      .text-left.m-b-1
        div(:class="$style.errorInfo" v-if="error")
          .fa.fa-exclamation-circle
          span {{error}}
      .text-left.m-b-1(style="font-size:1rem" v-if="isRegister") 注册即代表同意
        a(:href=`getUrl('protocol', 'register')` target="_blank") 《{{websiteName}}统一服务协议（注册协议）》
      .text-right
        .pull-left(:class="$style.link" v-if="isLogin")
          a(@click="selectMode(modes.register)") 注册
          | &nbsp;·&nbsp;
          a(href="/forgotPassword/mobile") 忘记密码
        .pull-left(:class="$style.link" v-else)
          a(@click="selectMode(modes.login)") 登录
        div(v-if="succeed")
          button.btn.button-icon.succeed(:class="$style.postButton") 跳转中..
            //.fa.fa-check
        div(v-else-if='isLogin')
          a.btn(:href='getUrl("appHome")' target="_blank" :class="$style.postButton" v-if="loginType===loginTypes.qr") 下载APP
          button.btn(@click="submit" :class="$style.postButton" v-else-if="!submitting") 登录
          button.btn(v-else :class="$style.postButton")
            .fa.fa-spinner.fa-spin.fa-fw.button-icon
        div(v-else)
          button.btn(@click="submit" v-if="!submitting" :class="$style.postButton") 注册
          button.btn(v-else :class="$style.postButton")
            .fa.fa-spinner.fa-spin.fa-fw.button-icon
</template>

<style lang="less" scoped module>
.container {
}
.errorInfo {
  color: #fb5c62;
  span {
    margin-left: 0.5rem;
  }
}
.websiteName {
  color: #fb5c62;
  font-size: 3rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
  display: block;
  text-decoration: none;
}
.websiteBrief {
  color: #555;
  text-align: center;
  margin-bottom: 1rem;
}
.loginTypes {
  display: flex;
  justify-content: center;
  margin: auto auto 1rem auto;
  width: 25rem;
  padding: 0 0.5rem;
  max-width: 100%;
  .loginType {
    padding: 0.5rem;
    width: 7rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: 0.1s all;
    border-radius: 0.5rem;
    &[data-active='true'] {
      background-color: #f4f4f4;
    }
    div:first-child {
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 4rem;
      width: 4rem;
      font-size: 2rem;
      border-radius: 50%;
      background-color: #fb5c62;
      padding-top: 0.6rem;
      color: #fff;
    }
    div:last-child {
      user-select: none;
      font-size: 1rem;
      color: #333;
    }
  }
}
.formContainer {
  margin: 1.5rem auto 0 auto;
  width: 25rem;
  padding: 0 0.5rem;
  max-width: 100%;
  input,
  select {
    border-radius: 1.6rem;
    padding: 6px 20px;
    height: 3.2rem;
  }
}
.smsContainer {
  //
}
.passwdContainer {
  //
}
.buttonContainer {
  width: 25rem;
  padding: 0 0.5rem;
  max-width: 100%;
  margin: 1.5rem auto 2rem auto;
}
.smsButton {
  height: 3.2rem;
  line-height: 3.2rem;
  display: inline-block;
  padding: 0 1rem;
  border: 1px solid #eee;
  border-radius: 5px;
  cursor: pointer;
  &[data-disabled='true'] {
    color: #aaa;
    cursor: not-allowed;
  }
}
.link {
  user-select: none;
  height: 3rem;
  line-height: 3rem;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  color: #555;
  a {
    color: #555;
    &:hover,
    &:focus {
      text-decoration: none;
    }
  }
}
.postButton {
  height: 3rem;
  border: 1px solid #fb5c62;
  color: #fff;
  background-color: #fb5c62;
  width: 8rem;
  border-radius: 1.5rem;
}
</style>
<script>
import { getState } from '../js/state';
import LoginByQR from './login/LoginByQR.vue';
const state = getState();
import { getNationCodes } from '../js/nationCodes';
import { ScanCode, Avatar, Mail } from '@icon-park/vue';
import { getUrl } from '../js/tools';
import { nkcAPI } from '../js/netAPI';
import Verifications from './Verifications.vue';
export const modes = {
  login: 'login',
  register: 'register',
};
const loginTypes = {
  qr: 'qr',
  sms: 'sms',
  passwd: 'passwd',
};
export default {
  components: {
    'scan-code': ScanCode,
    avatar: Avatar,
    mail: Mail,
    'login-by-qr': LoginByQR,
    verifications: Verifications,
  },
  data: () => ({
    isApp: state.isApp,
    websiteName: state.websiteName,
    websiteBrief: state.websiteBrief,
    modes: modes,
    mode: modes.login,
    loginTypes: loginTypes,
    loginType: loginTypes.sms,
    nationCodes: getNationCodes(),
    nationCode: '86',
    code: '',
    mobile: '',
    error: '',
    waiting: 0,
    succeed: false,
    submitting: false,
    username: '',
    password: '',
    timeout: 0,
  }),
  computed: {
    isLogin() {
      return this.mode === this.modes.login;
    },
    isRegister() {
      return this.mode === this.modes.register;
    },
  },
  methods: {
    getUrl: getUrl,
    selectType(type) {
      this.mode = type;
    },
    selectLoginType(type) {
      this.loginType = type;
    },
    selectMode(mode) {
      this.mode = mode;
    },
    throwError(error) {
      this.error = error.error || error.message || error;
    },
    submit() {
      switch (this.loginType) {
        case this.loginTypes.passwd: {
          return this.submitByPasswd();
        }
        case this.loginTypes.sms: {
          return this.submitBySMS();
        }
      }
    },
    onLogged() {
      this.succeed = true;
      this.$emit('logged');
    },
    submitByPasswd() {
      const self = this;
      const { username, password } = this;
      if (!username) return this.throwError('请输入用户名');
      if (!password) return this.throwError('请输入密码');
      nkcAPI('/login', 'POST', {
        username: username,
        password: password,
      })
        .then(function () {
          self.onLogged();
        })
        .catch(function (data) {
          self.throwError(data);
          self.submitting = false;
        });
    },
    submitBySMS() {
      const { nationCode, mobile, code, throwError } = this;
      if (!nationCode) return throwError('请选择国际区号');
      if (!mobile) return throwError('请输入手机号');
      if (!code) return throwError('请输入短信验证码');
      this.submitting = true;
      const this_ = this;
      nkcAPI('/login', 'POST', {
        loginType: 'code',
        nationCode: nationCode,
        mobile: mobile,
        code: code,
      })
        .then(function () {
          this_.onLogged();
        })
        .catch(function (data) {
          throwError(data);
          this_.submitting = false;
        });
    },
    sendMobileCode(t) {
      const throwError = this.throwError;
      throwError('');
      const this_ = this;
      const nationCode = this.nationCode;
      const mobile = this.mobile;
      if (!nationCode) return throwError('请选择国际区号');
      if (!mobile) return throwError('请输入手机号码');
      const body = {
        nationCode: nationCode,
        mobile: mobile,
      };
      const isRegister = t === 'register';
      const url = isRegister ? '/sendMessage/register' : '/sendMessage/login';

      return Promise.resolve()
        .then(() => {
          if (isRegister) {
            return this.$refs.verifications.open('register').then((res) => {
              body.verifySecret = res.secret;
            });
          } else {
            return this.$refs.verifications.open('login').then((res) => {
              body.verifySecret = res.secret;
            });
          }
        })
        .then(() => {
          return nkcAPI(url, 'POST', body);
        })
        .then(function () {
          clearTimeout(this_.timeout);
          this_.waiting = 120;
          this_.timeout = setInterval(function () {
            if (this_.waiting !== 0) {
              this_.waiting--;
            } else {
              clearTimeout(this_.timeout);
            }
          }, 1000);
        })
        .catch(function (data) {
          throwError(data);
        });
    },
  },
};
</script>
