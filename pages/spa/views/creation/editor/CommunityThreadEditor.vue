<template lang="pug">
.standard-fluid-max-container
  //- v-if="!err",
  editor( @noPermission="noPermission")
  .errInfo(v-if="err")
    .error-icon= `403 Forbidden`
    .error-list.b-s-10
      .error-header 因为缺少必要的账户信息，无法完成该操作。请完善以下信息：
      ul
        li(v-for="(err, i) in errInfo")
          .status.fa(:class="[{ 'fa-check-circle': err.status}, {'status-true' : err.status} , {'status-false': !err.status}, {'fa-exclamation-circle': !err.status}]")
          span {{ err.val }}
      .error-info 请前往
        a(:href="'/u/' + err.user.uid + '/settings/info'") 资料设置
        | 页面完善相关信息。
</template>

<script>
import Editor from "../../../../editor/vueComponents/Editor";
const map = {
  username: "设置用户名",
  avatar: "上传头像",
  banner: "上传背景",
  mobile: "绑定手机号",
  description: "填写个人简介",
  email: "绑定邮箱",
  password: "设置密码",
};
export default {
  data: () => ({
    err: "",
    errInfo: [],
    user: "",
  }),
  components: {
    editor: Editor,
  },
  methods: {
    noPermission(err) {
      this.err = err;
      const error = err.error;
      for (let key in error) {
        if (error.hasOwnProperty(key)) {
          if (key !== "status") {
            this.errInfo.push({val:map[key],status: error[key]});
          }
        }
      }
    },
  },
};
</script>
<style scoped>
.error-content {
  min-height: 38rem;
  padding-top: 6rem;
}
.error-icon {
  color: #e85a71;
  text-align: center;
  font-size: 2rem;
}
.error-code {
  padding: 0.5rem 0;
  font-size: 1.2rem;
}
.error-list {
  padding: 1.2rem 1rem;
  margin: auto;
  margin-top: 2rem;
  border-radius: 0 0 3px 3px;
  max-width: 100%;
  width: 40rem;
  background-color: #fff;
  border-top: 2px solid #2b90d9;
}
.error-list ul {
  padding: 0;
  margin: 0;
}
.error-header {
  color: #282c37;
  font-size: 1.3rem;
  line-height: 2.4rem;
}
.error-list ul li {
  list-style: none;
  margin: 1rem 0;
  font-size: 1.2rem;
}
.error-list ul li .num {
  display: inline-block;
  height: 20px;
  border-radius: 50%;
  line-height: 20px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  margin-right: 0.5rem;
  width: 20px;
  font-size: 1.2rem;
  background-color: #9baec8;
}
.error-info {
  color: #282c37;
  font-size: 1.2rem;
}
.error-info a {
  color: #2b90d9;
  margin: 0 0.3rem;
  font-weight: 700;
}
.error-info a:hover {
  text-decoration: none;
  color: #282c37;
}
.error-button {
  text-align: center;
  font-size: 1.4rem;
  margin-top: 1rem;
}
.error-button a {
  color: #2b90d9;
  text-decoration: none;
}
.error-button a:hover,
.error-button a:focus {
  text-decoration: none;
}
.error-list .status {
  color: #e85a71;
  margin-right: 0.5rem;
  vertical-align: text-bottom;
  font-size: 17px;
}
.error-list .status-true {
  color: green;
}
</style>
