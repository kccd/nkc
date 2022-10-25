<template lang="pug">
  .user-admin-manage(v-if="panelPermission && (panelPermission.unBannedUser || panelPermission.bannedUser ||panelPermission.clearUserInfo)" )
    .btn-ban(v-show="showBanBox" @click="clickBanContext(!showBanContext)")
      .fa.fa-ban( title="用户违规？点我！")
      ul(v-show="showBanContext" )
        li(v-if="targetUser && (targetUser.certs.includes('banned') && panelPermission.unBannedUser)")
          a(@click.stop="bannedUser(targetUser.uid, false)") 解除封禁
        li(v-if="targetUser && (!targetUser.certs.includes('banned') && panelPermission.bannedUser)")
          a(@click.stop="bannedUser(targetUser.uid, true)") 封禁用户
        li(v-if="panelPermission.hideUserHome && targetUser && targetUser.hidden")
          a(@click.stop="hideUserHome(false,targetUser.uid)")  取消屏蔽用户名片
        li(v-if="panelPermission.hideUserHome && targetUser && !targetUser.hidden")
          a(@click.stop="hideUserHome(true,targetUser.uid)")  屏蔽用户名片
        li.divider
        li(v-if="panelPermission.clearUserInfo")
          a(@click.stop="clearUserInfo(targetUser.uid, 'avatar')") 删除头像
        li(v-if="panelPermission.clearUserInfo")
          a(@click.stop="clearUserInfo(targetUser.uid, 'banner')") 删除背景
        li(v-if="panelPermission.clearUserInfo")
          a(@click.stop="clearUserInfo(targetUser.uid, 'username')") 删除用户名
        li(v-if="panelPermission.clearUserInfo")
          a(@click.stop="clearUserInfo(targetUser.uid, 'description')") 删除简介
</template>
<style lang="less" scoped>
.btn-ban{
  user-select: none;
  //background: #fff;
  position: absolute;
  top:0;
  z-index: 1;
  .fa-ban{
    color: red;
    background: #fff;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    margin-bottom: 2px;
  }
  ul{
    background: #fff;
    list-style-type: none;
    padding-left: 0;
    margin-left: 2px;
    border-radius: 2px;
    box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    li{
      padding: 5px 25px 5px 15px;
      a{
        color: #0e0e0e;
        &:hover{
          cursor: pointer;
        }
      }
    }
    .divider{
      height: 1px;
      width: 100%;
      background: #DCDCDC;
      padding: 0;
      margin: 3px 0;
    }
  }
}
</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
import {screenTopWarning} from "../../../../lib/js/topAlert";
import {getState} from "../../../../lib/js/state";
import {clearUserPublicProfile} from "../../../../lib/js/user";

export default {
  props: ['targetUser', 'panelPermission'],
  data: () => ({
    showBanBox: false,
    showBanContext: false,
  }),
  created() {
    //移动段才能永久显示封禁框
    if(getState() && getState().isApp){
      this.showBanBox = true;
    }
  },
  methods: {
    //点击显示禁止内容
    clickBanContext(type){
      this.showBanContext = type;
    },
    // 封禁用户,banned:false 解封，true 封禁
    bannedUser(uid, banned) {
      let method = 'PUT';
      if(banned) method = 'DELETE';
      nkcAPI('/u/' + uid + '/banned', method, {})
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data.error||data);
        });
    },
    // 取消屏蔽用户名片，isHidden是否隐藏用户主页
    hideUserHome(isHidden, uid) {
      nkcAPI("/u/" + uid + "/hide", "POST", {setHidden: isHidden})
        .catch(sweetError)
        .then(function() {location.reload()});
    },
    //清楚用户信息，type 类型， 可选：avatar、banner、description、username
    clearUserInfo: clearUserPublicProfile,
    //用户信息管理显示控制
    changeShowBanBox(type) {

      this.showBanBox = type;
    }
  }
}
</script>
