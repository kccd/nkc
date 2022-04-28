<template lang="pug">
  .module-apps.m-b-1
    .panel-header 网站应用
    a.module-app(v-if="permission.enableFund" href="/fund")
      img(src=`/statics/apps/fund.png`)
      span {{permission.fundName || "基金"}}
    a.module-app(v-if="permission.hasUser" href="/exam")
      img(src=`/statics/apps/exam.png`)
      span 考试系统
    a.module-app(v-if="permission.showActivityEnter" href="/activity")
      img(src=`/statics/apps/activity.png`)
      span 活动
    a.module-app(v-if="permission.siteToolEnabled" href="/tools" target="_blank")
      img(src=`/statics/apps/tools.png`)
      span 计算工具

</template>

<script>
export default {
  props: ['permission'],
  data: () => ({
  }),
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.module-apps{
  /*background-color: #eee;*/
}
.module-app{
  overflow: hidden;
  width: 4rem;
  margin-right: 0.7rem;
  text-decoration: none;
  display: inline-block;
  color: #282c37;
  font-weight: 700;
  text-align: center;
}
.module-app:hover, .module-app:focus{
  text-decoration: none;
  color: #282c37;
}
.module-app img{
  height: 3rem;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
  width: 3rem;
  border-radius: 3px;
  display: block;
}
.module-app span{
  font-size: 1rem;
}
</style>
