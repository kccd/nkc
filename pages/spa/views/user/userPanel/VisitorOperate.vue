<template lang="pug">
  .visitor-operate
    complaint(ref="complaint")
    button.m-b-05.m-r-05.btn-sm.btn-default.btn(@click="blackListOperation") {{usersBlUidList.includes(targetUser.uid)? '移出黑名单' : '加入黑名单'}}
    button.m-b-05.m-r-05.btn-sm.btn-default.btn(@click="userComplaint") 举报
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
import {EventBus} from "../../../eventBus";
import Complaint from "../../../../lib/vue/Complaint";
import {getState} from "../../../../lib/js/state";
export default {
  props: ["usersBlUid", "targetUser"],
  data: () => ({
    usersBlUidList: [],
  }),
  components:{
    "complaint":Complaint
  },
  created() {
    this.usersBlUidList = this.usersBlUid
    EventBus.$on('removeToBl',(uid)=>{
      this.usersBlUidList.splice(this.usersBlUidList.findIndex(item => item === uid),1)
    })
  },
  mounted() {
  },
  methods: {
    //举报
    userComplaint(){
      if(!getState().uid) return window.RootApp.openLoginPanel('login');
      this.$refs.complaint.open('user',this.targetUser.uid)
    },
    //拉黑按钮操作
    blackListOperation(){
      if(!getState().uid) return window.RootApp.openLoginPanel('login');
      const bool = this.usersBlUidList.includes(this.targetUser.uid);
      if(bool) this.removeUserToBlackList(this.targetUser.uid)
      else this.addUserToBlackList(this.targetUser.uid,"userHome")
    },
    //用户移除黑名单 tUid 被拉黑的用户
    removeUserToBlackList(uid) {
      nkcAPI('/blacklist?tUid=' + uid, 'GET')
        .then(data => {
          if(!data.bl) throw "对方未在黑名单中";
          return nkcAPI('/blacklist?tUid=' + uid, 'DELETE');
        })
        .then(data => {
          sweetSuccess('操作成功！');
          this.usersBlUidList.splice(this.usersBlUidList.findIndex(item => item === uid),1);
          return data;
        })
        .catch(sweetError);
    },
    //用户添加到黑名单 tUid 被拉黑的用户 form 拉黑来源 mid 被拉黑的moment
    addUserToBlackList(tUid, from, mid) {
      const self = this;
      var isFriend = false, subscribed = false;
      return Promise.resolve()
        .then(function() {
          return nkcAPI('/blacklist?tUid=' + tUid,  'GET')
        })
        .then(function(data) {
          isFriend = data.isFriend;
          subscribed = data.subscribed;
          var bl = data.bl;
          if(bl) throw '对方已在黑名单中';
          var info;
          if(isFriend) {
            info = '该会员在你的好友列表中，确定放入黑名单吗？';
          } else if(subscribed) {
            info = '该会员在你的关注列表中，确定放入黑名单吗？';
          }
          if(info) return sweetQuestion(info);
        })
        .then(function() {
          if(isFriend) {
            return nkcAPI(`/message/friend?uid=` + tUid, 'DELETE', {})
          }
        })
        .then(function() {
          if(subscribed) {
            return self.subscribeUserPromise(tUid, false);
          }
        })
        .then(function() {
          return nkcAPI('/blacklist', 'POST', {
            tUid: tUid,
            from: from,
            mid
          })
        })
        .then(function(data) {
          sweetSuccess('操作成功');
          self.usersBlUidList.push(tUid)
          EventBus.$emit('addToBl')
          return data;
        })
        .catch(sweetError);
    },
    subscribeUserPromise(id, sub, cid) {
      const method = sub? "POST": "DELETE";
      return nkcAPI("/u/" + id + "/subscribe", method, {cid: cid || []});
    },
  }
}
</script>
