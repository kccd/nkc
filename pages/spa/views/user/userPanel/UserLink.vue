<template lang="pug">
  .account-user-links
    .account-user-links(v-if="targetUser")
      a(:href="`/u/${targetUser.uid}`" target='_blank').col-xs-6.account-user-link
        .fa.fa-user-circle-o
        | 访客视角
      a(href="/message" target='_blank').col-xs-6.account-user-link
        .fa.fa-comments
        | 消息中心
      a(href="/sticker" target='_blank').col-xs-6.account-user-link
        .fa.fa-smile-o
        | 我的表情
      a(:href="`/u/${targetUser.uid}/settings`" target='_blank').col-xs-6.account-user-link
        .fa.fa-cog
        | 资料设置
      a(:href="`/m/${targetColumn._id}`" target='_blank' v-if="targetColumn" ).col-xs-6.account-user-link
        .fa.fa-columns
        | 我的专栏
      a(href=`/column` target='_blank' v-else).col-xs-6.account-user-link
        .fa.fa-columns
        | 开设专栏
      a(:href="`/u/${targetUser.uid}/profile/finance?t=all`").col-xs-6.account-user-link
        .fa.fa-file-text-o
        | 我的账单
      a(href=`/creation` target="_blank").col-xs-6.account-user-link
        .fa.fa-lightbulb-o
        | 创作中心
    .account-url(v-if="navLink" v-for="navLink in navLinks")
      .account-name(v-if="navLink.name") {{navLink.name}}
      .account-lis
        a.acocunt-li(v-for="link in navLink.links" :href="link.url" :class="{'active': link.type===type}")
          .name {{link.name}}
            span {{link.count || ''}}
          .fa.fa-angle-right
</template>
<style lang="less">
@import "../../../../publicModules/base";
.account-user-links {
  overflow: hidden;
  .account-user-links {
    .account-user-link {
      text-decoration: none;
      color: #282c37;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
      padding: 0;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 100ms;
    }

    .account-user-link:hover {
      background-color: #f4f4f4;
      /*box-shadow: 1px 1px 5px rgba(0,  0, 0, 0.2);*/
    }

    .account-user-link .fa {
      margin-right: 0.3rem;
      color: #555;
    }

    .account-user-link:hover, .account-user-link:focus {
      color: #282c37;
      text-decoration: none;
    }
  }
}
</style>
<script>
export default {
  props: ['target-user', 'nav-links'],
  data: () => ({
    targetColumn: null,
  }),
  methods: {

  }
}
</script>
