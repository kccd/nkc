<template lang="pug">
  .user-manage(v-if="targetUser && (permissions.visitUserTransaction || permissions.violationRecord || permissions.getUserOtherAccount || permissions.viewUserCode)")
    violation-record(ref="violationRecord")
    .panel-header 管理
    .m-b-2
      .user-card-sub-div
        a(:href="`/u/${targetUser.uid}/transaction`" target="_blank").m-r-05.btn.btn-default.btn-sm.m-b-05 查看地址
        button.m-b-05.btn.btn-default.btn-sm.m-r-05(@click="violationRecord(targetUser.uid)") 违规信息
        a(:href="`/u/${targetUser.uid}/alt`" target="_blank").m-r-05.btn.btn-default.btn-sm.m-b-05 查马甲
        button.m-b-05.btn.btn-default.btn-sm.m-r-05(@click="checkUserCode()") 验证动态码
</template>
<style lang="less" scoped>
.user-manage {
  transition: box-shadow 300ms;
}
</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
import {checkUserCode} from "../../../../lib/js/checkData";
import ViolationRecord from "../../../../lib/vue/ViolationRecord";
export default {
  data: () => ({
    permissions: {
      visitUserTransaction: null,
      violationRecord: null,
      getUserOtherAccount: null,
      viewUserCode: null,
    },
    targetUser: null,
    uid: null,
  }),
  components: {
    "violation-record": ViolationRecord
  },
  mounted() {
    this.initData();
    this.getManage();
  },
  methods: {
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取用户管理权限
    getManage() {
      const self = this;
      nkcAPI(`/u/${self.uid}/p/manage`, 'GET')
      .then(res => {
        self.targetUser = res.targetUser;
        self.permissions = res.permissions;
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //验证动态码
    checkUserCode() {
      if(this.targetUser) {
        checkUserCode(this.targetUser.uid);
      }
    },
    //查看违规信息
    violationRecord(uid) {
      this.$refs.violationRecord.open({uid});
    }
  }
}
</script>
