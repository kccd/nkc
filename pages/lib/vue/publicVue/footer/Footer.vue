<template lang="pug">
footer.footer
  .container-fluid.max-width
    .row
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
          .col-xs-6.col-md-2.footer-li-div
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
            span {{ copyright }}
            template(v-for="r in record")
              a(v-if='r.url' :href="r.url" target="_blank" :title="r.title") {{r.title}}
              span(v-else) {{r.title}}
</template>
<script>
import { getState } from "../../../js/state";
export default {
  data() {
    return {
      record: [],
      copyright: "",
      statement: "",
      gitHub: "",
      telephone: "",
      links: "",
      app: "",
      about: "",
    };
  },
  created() {},
  mounted() {
    const {
      record,
      copyright,
      statement,
      gitHub,
      telephone,
      links,
      app,
      about,
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
    };
    for (let key in data) {
      data.hasOwnProperty(key) && (this[key] = data[key]);
    }
  },
};
</script>

<style scoped>
  @import "../../../../publicModules/base.less";
  canvas {
    display: inline-block;
    vertical-align: baseline;
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
    margin: 0;
    padding: 0 0 2rem;
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
    span, a{
      margin-right: 0.5rem;
    }
    a{
      color: #9baec8;
    }
  }
  .footer-li-div {
    min-height: 17.5rem;
  }
</style>
