<template lang="pug">
  .visitor-operate
    button.m-b-05.m-r-05.btn-sm.btn-default.btn(@click="blackListOperation") {{usersBlUidList.indexOf(targetUser.uid,1) === -1 ? '加入黑名单' : '移出黑名单'}}
    button.m-b-05.m-r-05.btn-sm.btn-default.btn 举报
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";

export default {
  props: ["usersBlUid", "targetUser"],
  data: () => ({
    usersBlUidList: []
  }),
  created() {
    this.usersBlUidList = this.usersBlUid
  },
  methods: {
    blackListOperation(){
      const bool = this.usersBlUidList.indexOf(this.targetUser.uid,1) === -1
      if(bool) this.addUserToBlackList(this.targetUser.uid,"userHome")
      else this.removeUserToBlackList(this.targetUser.uid)
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
          this.getPanelData()

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
          self.getPanelData()
          self.subscribeBtnType = false;
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
