<template lang="pug">
  .modal.fade.module-login(tabindex="-1" role="dialog" aria-labelledby="myModalLabel" data-name="loginModule")
    verifications(ref="verifications")
    .modal-dialog(role="document").module-login-app
      .modal-content
        .modal-header
          button.close(@click="close" v-if="!isApp")
            span(aria-hidden="true") &times;
          .rn-close(@click="close" v-else) 关闭
        .modal-body.p-t-0.p-b-0
          .row
            .col-xs-12.col-md-12
              div.site-name {{websiteName}}
              p.site-description {{websiteBrief}}
            .col-xs-12.col-md-12(v-if="type === 'login'")
              .login-types
                .login-type(:class="{'active':category==='username'}" @click="selectCategory('username')")
                  .login-type-icon
                    .fa.fa-user
                  .login-type-info 用户名+密码
                .login-type(:class="{'active':category==='mobile'}" @click="selectCategory('mobile')")
                  .login-type-icon
                    .fa.fa-mobile
                  .login-type-info 手机号+密码
                .login-type(:class="{'active':category==='mobileCode'}" @click="selectCategory('mobileCode')")
                  .login-type-icon
                    .fa.fa-commenting
                  .login-type-info 手机号+验证码
            .login-form.col-xs-12.col-md-12
              .form
                div(v-if="type === 'login'")
                  div(v-if="category === 'username'")
                    .form-group
                      input.form-control.input(type="text" name="username" placeholder="用户名" v-model.trim="username" @input="throwError('')" @keyup.enter="submit" autocomplete="username")
                    .form-group
                      input.form-control.input(type="password" name="password" placeholder="密码" v-model.trim="password" @input="throwError('')" @keyup.enter="submit" autocomplete="current-password")
                  div(v-else-if="category === 'mobile'")
                    .form-group
                      select.form-control.input(v-model="nationCode" @input="throwError('')" @keyup.enter="submit")
                        option(v-for="code in nationCodes" :value="code.code") +{{code.code}} {{code.chineseName}}
                    .form-group
                      <input type="password" name="txtPassword" style="display:none">
                      input.form-control.input(name="txtPassword" type="text" placeholder="手机号" v-model.trim="mobile" @input="throwError('')" @keyup.enter="submit" autocomplete="tel")
                    .form-group
                      input.form-control.input(type="password" placeholder="密码" v-model.trim="password" @input="throwError('')" @keyup.enter="submit" autocomplete="current-password")
                  div(v-else-if="category === 'mobileCode'")
                    .form-group
                      select.form-control.input(v-model="nationCode" @input="throwError('')" @keyup.enter="submit")
                        option(v-for="code in nationCodes" :value="code.code") +{{code.code}} {{code.chineseName}}
                    .form-group
                      input.form-control.input(type="text" placeholder="手机号" v-model.trim="mobile" @input="throwError('')" @keyup.enter="submit" autocomplete="tel")
                    .row
                      .col-xs-6
                        .form-group
                          input.form-control.input(type="text" placeholder="短信验证码" v-model.trim="code" @input="throwError('')" @keyup.enter="submit")
                      .col-xs-6.text-right
                        .send-mobile-code(v-if="waiting === 0" @click="sendMobileCode") 发送验证码
                        .send-mobile-code.disabled(v-else) 发送验证码({{waiting}})
                //- 有关注册
                div(v-else)
                  div(v-if='registerStep === 2')
                    .form-group
                      select.form-control.input(v-model="nationCode" @input="throwError('')" @keyup.enter="submit")
                        option(v-for="code in nationCodes" :value="code.code") +{{code.code}} {{code.chineseName}}
                      h5.text-danger(v-if="nationCode !== '86' && nationCode !== 86" style="font-size: 1rem")
                        | 【海外用户】请注册后立即绑定邮箱，否则无密保功能。
                        div(style="margin-top: 0.5rem;") 【海外用户】发表的内容可能需要经过人工审核才显示。
                    .form-group
                      input.form-control.input(type="text" placeholder="手机号" v-model.trim="mobile" @input="throwError('')" @keyup.enter="submit")
                    .row
                      .col-xs-6
                        .form-group
                          input.form-control.input(type="text" placeholder="短信验证码" v-model.trim="code" @input="throwError('')" @keyup.enter="submit")
                      .col-xs-6.text-right
                        .send-mobile-code(v-if="waiting === 0" @click="sendMobileCode('register')") 发送验证码
                        .send-mobile-code.disabled(v-else) 发送验证码({{waiting}})
                  div(v-else)
                    .form-group
                      input.form-control.input(type="text" placeholder="用户名" v-model.trim="username" @input="throwError('')" @keyup.enter="submit")
                    .form-group
                      input.form-control.input(type='password' placeholder='密码' v-model.trim='password' @input='throwError("")' @keyup.enter='submit')
                    .form-group
                      input.form-control.input(type='password' placeholder='重复密码' v-model.trim='repeatPassword' @input='throwError("")' @keyup.enter='submit')
                .form-group
                  .text-left.m-b-1
                    .text-danger(v-if="error")
                      .fa.fa-exclamation-circle
                      span {{error}}
                  .text-left.m-b-1(style="font-size:1rem" v-if="type === 'register'") 注册即代表同意
                    a(href=`/protocol?type=register` target="_blank") 《{{websiteName}}统一服务协议（注册协议）》
                  .text-right
                    .pull-left.link(v-if="type === 'login'")
                      a(@click="selectType('register')") 注册
                      | &nbsp;·&nbsp;
                      a(href="/forgotPassword/mobile") 忘记密码
                    .pull-left.link(v-else)
                      a(@click="selectType('login')") 登录
                    div(v-if="succeed")
                      button.btn.post-button.button-icon.succeed 跳转中..
                        //.fa.fa-check
                    div(v-else-if='type === "login"')
                      button.btn.post-button(@click="submit" v-if="!submitting") 登录
                      button.btn.post-button(v-else)
                        .fa.fa-spinner.fa-spin.fa-3x.fa-fw.button-icon
                    div(v-else)

                      button.btn.post-button.register-step.m-r-05(v-if='registerStep === 2' @click='changeStep(1)') 上一步
                      button.btn.post-button.register-step.m-l-05(v-if='registerStep === 1' @click='changeStep(2)') 下一步

                      button.btn.post-button(@click="submit" v-if="!submitting && registerStep === 2 && !submitting") 注册
                      button.btn.post-button(v-if='submitting')
                        .fa.fa-spinner.fa-spin.fa-3x.fa-fw.button-icon
</template>

<style lang="less" scoped>
  .module-login{
    z-index: 2000;
  }
  @media (min-width: 768px){
    .module-login .modal-dialog{
      width: 370px;
    }
  }
  .module-login-app{
    position: relative;
  }
  .module-login .modal-content{
    border-radius: 3px;
    box-shadow: none;
  }
  .module-login .modal-header{
    border-bottom: none;
  }
  .module-login .login-types{
    text-align: center;
  }
  .module-login .login-type{
    cursor: pointer;
    width: 7rem;
    padding: 0.5rem 0;
    text-align: center;
    display: inline-block;
  }
  .module-login .login-type.active{
    background-color: #f6f6f6;
    border-radius: 10px;
  }
  .module-login .login-type-info{
    font-size: 1rem;
    margin-top: 0.5rem;
    color: #888;
  }
  .module-login .login-type-icon{
    margin: auto;
    height: 4rem;
    width: 4rem;
    line-height: 4rem;
    text-align: center;
    font-size: 2rem;
    border-radius: 50%;
    background-color: #fb5c62;
    color: #fff;
  }
  .module-login .login-form .form{
    margin: 2rem auto 4rem auto;
    width: 25rem;
    max-width: 100%;
  }
  .module-login .login-form{
    /*background-color: #f6f6f6;*/
    border-radius: 5px;
  }
  .module-login .login-form .input{
    border-radius: 1.6rem;
    padding: 6px 20px;
    height: 3.2rem;
  }
  .module-login .login-form .post-button{
    height: 3rem;
    border: 1px solid #fb5c62;
    color: #fff;
    background-color: #fb5c62;
    width: 8rem;
    border-radius: 1.5rem;
  }

  .module-login .login-form .pull-left.link{
    height: 3rem;
    line-height: 3rem;
    font-size: 1.25rem;
    font-weight: 700;
    cursor: pointer;
    color: #555;
  }
  .module-login .login-form .pull-left.link a{
    color: #555;
  }
  .module-login .login-form .pull-left.link a:hover, .module-login .login-form .pull-left.link a:focus{
    text-decoration: none;
  }
  .module-login .svg-data{
    height: 3.2rem;
    cursor: pointer;
  }
  .module-login .svg-data svg{
    height: 100%;
  }
  .module-login .send-mobile-code{
    height: 3.2rem;
    line-height: 3.2rem;
    display: inline-block;
    padding: 0 1rem;
    border: 1px solid #eee;
    border-radius: 5px;
    cursor: pointer;
  }
  .module-login .send-mobile-code.disabled{
    color: #aaa;
  }
  .module-login .text-danger .fa{
    font-size: 1.3rem;
    color: #fb5c62;
    margin-right: 0.3rem;
  }
  .module-login .text-danger span{
    color: #fb5c62;
  }
  .module-login .button-icon{
    font-size: 1.4rem;
  }
  .module-login .button-icon.succeed{
    font-size: 1.2rem;
  }
  .module-login .rn-close{
    text-align: right;
    font-size: 1.3rem;
    height: 2rem;
    color: #555;
  }
  .module-login .register-step.register-step{
    background-color: #fff;
    color: #555;
    border: 1px solid #555;
  }

</style>

<script>
  import Verifications from './Verifications';
  import {getState} from '../js/state';
  import {
    RNCloseWebview,
    RNLogin,
  } from '../js/reactNative';
  import {nkcAPI} from "../js/netAPI";
  import {getNationCodes} from "../js/nationCodes";
  const {
    isApp,
    websiteBrief,
    websiteName
  } = getState();

  let timeout, loginBehavior = [];

  export default {
    components: {
      'verifications': Verifications
    },
    data: () => ({
      isApp,
      websiteBrief,
      websiteName,
      nationCodes: getNationCodes(),
      type: LoginType.SignIn,
      registerStep: 1,
      category: "username", // username, mobile, mobileCode
      username: "",
      password: "",
      repeatPassword: '',
      nationCode: "86",
      code: "",
      mobile: "",
      waiting: 0,
      svgData: "",
      error: "",
      info : "",
      submitting: false,
      succeed: false
    }),
    mounted() {
      this.initModal();
    },
    methods: {
      changeStep: function(number) {
        if(number === 1) {
          return this.registerStep = number;
        }
        var _this = this;
        var throwError = this.throwError;
        return Promise.resolve()
          .then(function() {
            var username = _this.username;
            var password = _this.password;
            var repeatPassword = _this.repeatPassword;
            if(!username) throw '请输入用户名';
            if(!password) throw '请输入密码';
            if(!repeatPassword) throw '请输入密码';
            if(password !== repeatPassword) throw '两次输入的密码不相同';
            return nkcAPI('/register/check', 'POST', {
              username: username,
              password: password
            });
          })
          .then(function() {
            _this.registerStep = number;
          })
          .catch(function(error) {
            throwError(error.error || error.message || error);
          });
      },
      selectCategory: function(category) {
        this.category = category;
        this.throwError("");
      },
      selectType: function(type) {
        this.type = type;
      },
      throwError: function(error) {
        this.error = error.error || error.message || error;
      },
      submit: function() {
        var throwError = this.throwError;
        throwError("");
        var this_ = this;
        var type = this.type;
        var category = this.category;

        var body = {};
        var username = this.username;
        var password = this.password;
        var mobile = this.mobile;
        var nationCode = this.nationCode;
        var code = this.code;
        if(type === "login") {
          if(category === "username") {
            if(!username) return throwError("请输入用户名");
            if(!password) return throwError("请输入密码");
            body = {
              username: username,
              password: password,
              // behavior: loginBehavior
            };
          } else if(category === "mobile") {
            if(!nationCode) return throwError("请选择国际区号");
            if(!mobile) return throwError("请输入手机号");
            if(!password) return throwError("请输入密码");
            body = {
              nationCode: nationCode,
              mobile: mobile,
              password: password,
              loginType: "mobile"
            };
          } else {
            if(!nationCode) return throwError("请选择国际区号");
            if(!mobile) return throwError("请输入手机号");
            if(!code) return throwError("请输入短信验证码");
            body = {
              loginType: "code",
              nationCode: nationCode,
              mobile: mobile,
              code: code,
            }
          }
          this.submitting = true;
          nkcAPI("/login", "POST", body)
            .then(function() {
              this_.succeed = true;
              if(isApp) {
                RNLogin();
              } else {
                window.location.reload();
              }
            })
            .catch(function(data) {
              throwError(data);
              this_.submitting = false;
            })
        } else {
          if(!username) return throwError('请输入用户名');
          if(!password) return throwError('请输入密码');
          if(!nationCode) return throwError("请选择国际区号");
          if(!mobile) return throwError("请输入手机号");
          if(!code) return throwError("请输入短信验证码");
          this.submitting = true;
          nkcAPI("/register", "POST", {
            nationCode: nationCode,
            mobile: mobile,
            code: code,
            username: username,
            password: password,
          })
            .then(function() {
              // window.location.reload();
              this_.succeed = true;
              if(isApp) {
                RNLogin();
              } else {
                window.location.href = "/register/subscribe";
              }
            })
            .catch(function(data) {
              throwError(data);
              this_.submitting = false;
            })
        }
      },
      sendMobileCode: function(t) {
        var throwError = this.throwError;
        throwError("");
        var this_ = this;
        var nationCode = this.nationCode;
        var mobile = this.mobile;
        if(!nationCode) return throwError("请选择国际区号");
        if(!mobile) return throwError("请输入手机号码");
        var body = {
          nationCode: nationCode,
          mobile: mobile,
        };
        var url;
        if(t === "register") {
          url = "/sendMessage/register";
        } else {
          url = "/sendMessage/login";

        }
        this.$refs.verifications
          .open()
          .then(function(data) {
            body.verifySecret = data.secret;
            return nkcAPI(url, "POST", body);
          })
          .then(function() {
            clearTimeout(timeout);
            this_.waiting = 120;
            timeout = setInterval(function() {
              if(this_.waiting !== 0) {
                this_.waiting --;
              } else {
                clearTimeout(timeout);
              }
            }, 1000);
          })
          .catch(function(data) {
            throwError(data);
          });
      },
      getSvgData: function() {
        var this_ = this;
        nkcAPI("/register/code?t=" + Date.now(), "GET")
          .then(function(data) {
            this_.svgData = data.svgData;
          })
          .catch(function(data) {
            sweetError(data);
          })
      },
      initModal() {
        $(this.$el).modal({
          show: false,
          backdrop: "static"
        });
      },
      close: function() {
        loginBehavior.length = 0;
        if(isApp) {
          RNCloseWebview();
        } else {
          $(this.$el).modal("hide");
        }
      },
      open: function(type) {
        $(this.$el).modal("show");
        this.type = type || LoginType.SignIn;
        // this.getSvgData();
      }
    }
  };


  export const LoginType = {
    SignIn: 'login',
    SignUp: 'register'
  }

</script>
