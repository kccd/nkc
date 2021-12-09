<template lang="pug">
  .m-b-1
    .panel-header 管理
    .module-managements
      a.module-management(v-if="permission.nkcManagement" href="/nkc" target='_blank')
        .fa.fa-cogs
        span &nbsp;前台管理
      a.module-management(v-if="permission.visitExperimentalStatus" href="/e" target='_blank')
        .fa.fa-cogs
          span &nbsp;后台管理
      a.module-management(v-if="permission.review" href="/review" target='_blank')
        .fa.fa-shield
        span &nbsp;审核内容
        //-if data.unReviewedCount
          .management-count=data.unReviewedCount
      a.module-management(v-if="permission.complaintGet" href="/complaint" target='_blank')
        .fa.fa-minus-circle
        span &nbsp;投诉列表
        //-if data.unResolvedComplaintCount
          .management-count=data.unResolvedComplaintCount
      a.module-management(v-if="permission.visitProblemList" href="/problem/list" target='_blank')
        .fa.fa-exclamation-circle
        span &nbsp;问题列表
        //-if data.unResolvedProblemCount
          .management-count=data.unResolvedProblemCount
      a.module-management(v-if="permission.getLibraryLogs" href="/libraries/logs" target='_blank')
        .fa.fa-book
        span &nbsp;文库记录
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
.module-management{
  display: inline-block;
  margin-right: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #7e8da0;
  position: relative;
}
.module-management:hover, .module-management:focus{
  text-decoration: none;
  color: #282c37;
}
.module-management .management-count{
  display: inline-block;
  position: absolute;
  top: -0.5rem;
  right: -1rem;
  height: 1.3rem;
  line-height: 1.4rem;
  padding: 0 0.4rem;
  font-size: 1rem;
  border-radius: 0.65rem;
  background-color: rgba(255, 0, 0, 0.6);
  color: #fff;
}
</style>
