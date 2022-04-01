<template lang="pug">
  .subscribe-black-list
    .null(v-if="!blackList" ) 空空如也~~
    .col-xs-12.col-md-6
      //.list-body(v-for="item in blackList")
      //  .item-left
      //    img(:src="getUrl('userAvatar', item.user.avatar)")
      //  .item-center
      //    a.username(:href="/u/${item.user.uid}") {{item.user.username}}
      //    .description(:title="${format('YYYY/MM/DD HH:mm:ss', item.toc)}") `${fromNow(item.toc)}`
      //      | &nbsp;&nbsp;来自&nbsp;&nbsp;
      //      span!=item.fromHTML
      //  .item-right
      //    .icon(title="移除" @click="removeBlacklist('${b.user.uid}', ${b._id})")
      //      .fa.fa-trash
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.null {
  padding-top: 5rem;
  padding-bottom: 5rem;
  text-align: center;
}
</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
import {getUrl,fromNow} from "../../../../lib/js/tools";
export default {
  data: () => ({
    uid: NKC.configs.uid,
    blackList: null,
  }),
  components: {

  },
  mounted() {
    this.initData();
    this.getBlackList();
  },
  methods: {
    getUrl: getUrl,
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取用户黑名单
    getBlackList() {
      const self = this;
      nkcAPI(`/u/${this.uid}/p/s/blacklist`, 'GET')
      .then(res => {
        self.blackList = res.blackList;
      })
      .catch(err => {
        sweetError(err);
      })
    },
  }
}
</script>
