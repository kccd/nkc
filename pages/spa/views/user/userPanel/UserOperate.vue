<template lang="pug">
  .account-user-links.m-b-1(v-if="targetUser")
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
    a(@click="toRoute('finance')").col-xs-6.account-user-link
      .fa.fa-file-text-o
      | 我的账单
    a(href=`/creation` target="_blank").col-xs-6.account-user-link
      .fa.fa-lightbulb-o
      | 创作中心
</template>
<style lang="less" scoped>
  .account-user-links {
    overflow: hidden;
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
</style>
<script>
import {getColumnInfo} from "../../../../lib/js/column";
export default {
  props: ['targetUser'],
  data: () => ({
    targetColumn: '',
  }),
  mounted() {
    getColumnInfo()
      .then(res => {
        this.targetColumn = res.userColumn;
      })
  },
  methods: {
    toRoute(name){
      this.$router.push({name});
    }
  }
}
</script>
