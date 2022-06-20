<template lang="pug">
  .user-manage.m-b-1(v-if="targetUser && (permissions.visitUserTransaction || permissions.violationRecord || permissions.getUserOtherAccount || permissions.viewUserCode)")
    violation-record(ref="violationRecord")
    .panel-header 管理
    .m-b-2
      .user-card-sub-div
        a(:href="`/u/${targetUser.uid}/transaction`" target="_blank" v-if="permissions.visitUserTransaction").m-r-05.btn.btn-default.btn-sm.m-b-05 查看地址
        button.m-b-05.btn.btn-default.btn-sm.m-r-05(@click="violationRecord(targetUser.uid)" v-if="permissions.violationRecord") 违规信息
        a(:href="`/u/${targetUser.uid}/alt`" target="_blank" v-if="permissions.getUserOtherAccount").m-r-05.btn.btn-default.btn-sm.m-b-05 查马甲
        button.m-b-05.btn.btn-default.btn-sm.m-r-05(@click="checkUserCode()" v-if="permissions.viewUserCode") 验证动态码
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
import {EventBus} from "../../../eventBus";
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
      nkcAPI(`/u/${self.uid}/profile/manageData`, 'GET')
      .then(res => {
        self.targetUser = res.targetUser;
        self.permissions = res.permissions;
        EventBus.$emit('permissions', res.permissions);
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //验证动态码
    checkUserCode() {
      if(this.targetUser) {
        return sweetPrompt('请输入动态码')
          .then(code => {
            if(code && code.length > 0){
              return nkcAPI(`/u/${this.targetUser.uid}/code`, 'POST', {code})
            }else {
              return new Promise((resolve,reject)=>{
                reject('动态码不能为空')
              })
            }
          })
          .then(() => {
            sweetSuccess('验证通过');
          })
          .catch(err => {
            sweetError(err);
          });
      }
    },
    //查看违规信息
    violationRecord(uid) {
      this.$refs.violationRecord.open({uid});
    }
  }
}
</script>
