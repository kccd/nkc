<template lang="pug">
  .subscribe-black-list(v-if="targetUser")
    float-user-panel(ref="floatUserPanel")
    paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")
    .null(v-if="!bl" ) 空空如也~~
    .black-list-box(v-else)
      .col-xs-12.col-md-6(v-for="item in bl")
        .list-body
          .item-left
            img(:src="getUrl('userAvatar', item.user.avatar)"
              data-global-mouseover="showUserPanel"
              data-global-mouseout="hideUserPanel"
              :data-global-data="objToStr({uid: item.user.uid})"
              )
          .item-center
            a.username(
              :href="`/u/${item.user.uid}`"
              data-global-mouseover="showUserPanel"
              data-global-mouseout="hideUserPanel"
              :data-global-data="objToStr({uid: item.user.uid})"
              ) {{item.user.username}}
            //.description(:title="${format('YYYY/MM/DD HH:mm:ss', item.toc)}") {{fromNow(item.toc)}}
            //    | &nbsp;&nbsp;来自&nbsp;&nbsp;
            .description() {{fromNow(item.toc)}}&nbsp;&nbsp;来自&nbsp;&nbsp;
              span(v-html="item.fromHTML")
          .item-right
            .icon(title="移除" @click="removeBlacklist(item.user.uid)")
              .fa.fa-trash

</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.subscribe-black-list{
  width: 100%;
  height: auto;
  .black-list-box{
    width: 100%;
    display: table;
    content: " ";
    height: auto;
    .list-body{
      position: relative;
      height: 3.6rem;
      margin: 1rem 0;
      height: auto;
      .item-left {
        position: absolute;
        left: 0;
        top: 0;
        height: 3.6rem;
        width: 3.6rem;
        img {
          height: 100%;
          width: 100%;
          border-radius: 50%;
        }
      }
      .item-center {
        padding: 0 3rem 0 4.6rem;
        .username {
          display: inline-block;
          font-size: 1.3rem;
          height: 1.8rem;
          word-break: break-word;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .description {
          margin-top: 0.3rem;
          font-size: 1rem;
          font-style: oblique;
        }
      }
      .item-right {
        position: absolute;
        top: 0;
        right: 0;
        height: 3.6rem;
        width: 2rem;
        .icon {
          text-align: center;
          color: #aaa;
          cursor: pointer;
          font-size: 1.3rem;
          &:hover{
            color: #0e0e0e;
          }
        }
      }
    }
  }
}


.null {
  padding-top: 5rem;
  padding-bottom: 5rem;
  text-align: center;
}
</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
import {getUrl,fromNow} from "../../../../lib/js/tools";
import {removeUserFromBlacklist} from "../../../../lib/js/subscribe";
import {objToStr} from "../../../../lib/js/tools";
import floatUserPanel from "../../../../lib/vue/FloatUserPanel";
import Paging from "../../../../lib/vue/Paging";
export default {
  data: () => ({
    uid: null,
    bl: null,
    targetUser: null,
    paging: null,
  }),
  components: {
    "float-user-panel":floatUserPanel,
    'paging': Paging
  },
  mounted() {
    this.initData();
    this.getBlackList();
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  methods: {
    objToStr: objToStr,
    getUrl: getUrl,
    fromNow: fromNow,
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取用户黑名单
    getBlackList() {
      const self = this;
      nkcAPI(`/u/${this.uid}/p/s/blacklist`, 'GET')
      .then(res => {
        if(self.$refs.floatUserPanel) {
          self.$refs.floatUserPanel.initPanel();
        }
        self.bl = res.bl;
        self.targetUser = res.targetUser;
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //删除黑名单
    removeBlacklist(tUid){
      removeUserFromBlacklist(tUid)
      this.getBlackList();
    },
    //点击分页按钮
    clickBtn(num) {
      this.getSubUser(num);
    },
  }
}
</script>
