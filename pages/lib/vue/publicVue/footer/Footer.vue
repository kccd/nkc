<template lang="pug">
footer.footer
  .container-fluid.max-width
    .col-xs-12.col-md-12
      .row
        .col-xs-6.col-md-2.footer-li-div
          .footer-header 关于
          ul.footer-link
            li(v-for="(l, i) in about", :key="i")
              a(:href="l.url", target="_blank") {{ l.name }}
        .col-xs-6.col-md-2.footer-li-div
          .footer-header 应用
          ul.footer-link
            li(v-for="(l, i) in app", :key="i")
              a(:href="l.url", target="_blank") {{ l.name }}
        .col-xs-6.col-md-2.footer-li-div
          .footer-header 友情链接
          ul.footer-link
            li(v-for="(l, i) in links", :key="i")
              a(:href="l.url", target="_blank") {{ l.name }}
        .col-xs-6.col-md-2.footer-li-div
          .footer-header 其他
          ul.footer-link
            li
              a(href="/problem/add")
                span.fa.fa-bug(style="font-size: 1.4rem")
                span(style="font-size: 1.2rem") &nbsp;报告问题 / 投诉
            li
              a
                span.fa.fa-phone-square(style="font-size: 1.5rem")
                span(style="font-size: 1.2rem") &nbsp;{{ telephone }}
            li
              a(:href="gitHub", target="_blank")
                span.fa.fa-github(style="font-size: 1.5rem")
                span(style="font-size: 1.2rem") &nbsp;GitHub

        .col-xs-6.col-md-2.footer-li-div
          .footer-header.text-center 手机访问
          ul.footer-link
            li.text-center
              canvas.qrcode-canvas(data-path="/")
        .col-xs-6.col-md-2.footer-li-div(v-if="appStableVersion")
          .footer-header.text-center 安卓客户端
          ul.footer-link
            li.text-center
              a(href="/app")
                canvas.qrcode-canvas(data-path="/app")
                span(
                  style="display: block; font-size: 1rem; color: #555555; margin-top: 0.3rem"
                ) 点击下载
    .col-xs-12.col-md-12
      .website-name
        h5 {{ statement }}
        h5
          .display-i-b.m-b-05 {{ copyright }}
          .display-i-b.m-b-05 {{ record }}
</template>
<style lang="less">
@import "../../../../publicModules/base";
</style>
<script>
import { getState } from "../../../js/state";
export default {
  data() {
    return {
      record: "",
      copyright: "",
      statement: "",
      gitHub: "",
      telephone: "",
      links: "",
      app: "",
      about: "",
      appStableVersion: "",
    };
  },
  created() {
    const {
      record,
      copyright,
      statement,
      gitHub,
      telephone,
      links,
      app,
      about,
      appStableVersion,
    } = getState();
    const data = {
      record,
      copyright,
      statement,
      gitHub,
      telephone,
      links,
      app,
      about,
      appStableVersion,
    };
    for (let key in data) {
      data.hasOwnProperty(key) && (this[key] = data[key]);
    }
  },
};
</script>

<style scoped>
@media (min-width: 992px){
.col-md-2 {
    width: 16.66666667%;
}
}
.container-fluid{
  padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
}
canvas{
  display: inline-block;
    vertical-align: baseline;
}
.container-fluid.max-width {
  max-width: 1300px;
}
.row {
  width: 100%;
  margin-right: -15px;
  margin-left: -15px;
}
@media all and (max-width: 992px){
  .col-xs-6 {
  position: relative;
  min-height: 1px;
  padding-right: 15px;
  padding-left: 15px;
  width: 50%;
  float: left;
}
}
.col-xs-12 {
  float: left;
  width: 100%;
  position: relative;
  min-height: 1px;
  padding-right: 15px;
  padding-left: 15px;
}
.m-b-05 {
  margin-bottom: 0.5rem !important;
}
.display-i-b {
  display: inline-block;
}
footer.footer {
  margin-top: 1rem;
  background-color: #fff;
  border-top: 1px solid #eee;
  padding: 3rem 0 2rem 0;
  min-height: 28rem;
}
footer.footer ul {
  padding: 0;
  margin: 0;
  padding-bottom: 2rem;
}
footer.footer ul li {
  list-style: none;
}
.footer-header {
  font-size: 1.2rem;
  font-weight: 700;
  padding-bottom: 1rem;
}
.footer-link a {
  color: #9baec8;
  font-size: 1.2rem;
  padding-bottom: 0.3rem;
  display: inline-block;
  cursor: pointer;
}
.footer-link a:hover {
  color: #282c37;
}
.footer-link a:hover,
.footer-link a:link,
.footer-link a:active,
.footer-link a:visited {
  text-decoration: none;
}
.footer .website-name {
  text-align: center;
  margin-top: 2rem;
  font-size: 1.4rem;
  color: #9baec8;
}
.footer-li-div {
  min-height: 17.5rem;
}
</style>
