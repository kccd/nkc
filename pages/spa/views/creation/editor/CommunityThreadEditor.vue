<template lang="pug">
.standard-fluid-max-container
  //- v-if="!err",
  .article-box(v-if="drafts.length > 0")
    .article-box-header 草稿
    .article-box-text {{drafts[0].t || '未命名'}}
    .article-box-option
      button.btn.btn-xs.btn-primary.m-r-05(@click="editArticle(drafts[0]._id)") 继续编辑
      button.btn.btn-xs.btn-default(@click="more") 查看更多
      .fa.fa-remove(@click="close")
  editor(ref="editor" @noPermission="noPermission" :req-url="reqUrl")
  .errInfo(v-if="err")
    .error-icon= `403 Forbidden`
    .error-list.b-s-10
      .error-header 因为缺少必要的账户信息，无法完成该操作。请完善以下信息：
      ul
        li(v-for="(err, i) in errInfo")
          .status.fa(:class="[{ 'fa-check-circle': err.status}, {'status-true' : err.status} , {'status-false': !err.status}, {'fa-exclamation-circle': !err.status}]")
          span {{ err.val }}
      .error-info 请前往
        a(:href="'/u/' + user.uid + '/settings/info'") 资料设置
        | 页面完善相关信息。
</template>

<script>
import Editor from "../../../../editor/vueComponents/Editor";
// import {getState} from "../../../../lib/js/state";
// import {getRequest, timeFormat, addUrlParam} from "../../../../lib/js/tools";

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
    reqUrl: NKC.methods.getDataById("data"),
    drafts: [],
    err: "",
    errInfo: [],
    user: "",
  }),
  components: {
    editor: Editor,
  },
  methods: {
    noPermission(err) {
      this.user = err.user;
      this.err = err.status === 403;
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
<style scoped lang='less'>
@import "../../../../publicModules/base";

.article-box {
  @height: 3rem;
  @padding: 1rem;
  @boxHeaderWidth: 4rem;
  @boxOptionWidth: 14rem;
  height: @height;
  line-height: @height;
  padding-left: @boxHeaderWidth;
  padding-right: @boxOptionWidth + 0.5rem;
  width: 100%;
  background-color: #d9edf7;
  position: relative;
  border: 1px solid #c6e5ff;
  .article-box-header{
    color: @primary;
    font-size: 1.2rem;
    font-weight: 700;
    position: absolute;
    top: 0;
    left: 0;
    height: @height;
    line-height: @height;
    width: @boxHeaderWidth;
    text-align: center;
  }
  .article-box-text{
    font-size: 1.3rem;
    .hideText(@line: 1);
  }
  .article-box-option{
    position: absolute;
    top: 0;
    right: 0;
    height: @height;
    line-height: @height;
    width: @boxOptionWidth;
    text-align: right;
    .fa{
      height: @height;
      cursor: pointer;
      line-height: @height;
      width: @height;
      text-align: center;
    }
  }
}
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
