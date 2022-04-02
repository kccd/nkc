<template lang="pug">
  footer.footer
    .container-fluid.max-width
      .col-xs-12.col-md-12
        .row
          .col-xs-6.col-md-2.footer-li-div
            .footer-header 关于
            ul.footer-link
              li(v-for="(l, i) in about" :key="i")
                a(:href="l.url" target="_blank") {{l.name}}
          .col-xs-6.col-md-2.footer-li-div
            .footer-header 应用
            ul.footer-link
              li(v-for = "(l, i) in app" :key="i")
                a(:href="l.url" target="_blank") {{l.name}}
          .col-xs-6.col-md-2.footer-li-div
            .footer-header 友情链接
            ul.footer-link
              li(v-for="(l, i) in links" :key="i")
                a( :href="l.url" target="_blank") {{l.name}}
          .col-xs-6.col-md-2.footer-li-div
            .footer-header 其他
            ul.footer-link
              li
                a(href="/problem/add")
                  span(style="font-size: 1.4rem;").fa.fa-bug
                  span(style="font-size: 1.2rem;") &nbsp;报告问题 / 投诉
              li
                a
                  span(style="font-size: 1.5rem;").fa.fa-phone-square
                  span(style="font-size: 1.2rem;") &nbsp;{{telephone}}
              li
                a(:href="gitHub" target="_blank")
                  span(style="font-size: 1.5rem;").fa.fa-github
                  span(style="font-size: 1.2rem;") &nbsp;GitHub

          .col-xs-6.col-md-2.footer-li-div
            .footer-header.text-center 手机访问
            ul.footer-link
              li.text-center
                canvas.qrcode-canvas(data-path="/")
          .col-xs-6.col-md-2.footer-li-div(v-if="appStableVersion")
            .footer-header.text-center 安卓客户端
            ul.footer-link
              li.text-center
                a(href='/app')
                  canvas.qrcode-canvas(data-path="/app")
                  span(style='display: block;font-size: 1rem;color: #555555;margin-top: 0.3rem;') 点击下载
      .col-xs-12.col-md-12
        .website-name
          h5 {{statement}}
          h5
            .display-i-b.m-b-05 {{copyright}}
            .display-i-b.m-b-05 {{record}}
</template>
<style lang="less" scoped>
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
      appStableVersion: ""
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
      appStableVersion
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
      appStableVersion
    }
    for (let key in data) {
      data.hasOwnProperty(key) && (this[key] = data[key]);
    }
  }
};
</script>
