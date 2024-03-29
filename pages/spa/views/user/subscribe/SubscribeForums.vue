<template lang="pug">
  .home-subscribe-forum(v-if="!loading")
    .account-forum-categories.paging-button(v-if="targetUser")
      a.button.radius-left(
        :class="!t?'active':''"
        @click="clickType('')"
        data-type="reload"
      ) 全部
      a.button(
        v-for="(c,index) in forumCategories"
        :class="{'active': t === c._id?'active':'', 'radius-right': index + 1 === forumCategories.length}"
        @click="clickType(c._id)"
        data-type="reload"
      ) {{c.name}}
    //- 分页显示
    paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")
    //关注的专业列表
    .account-followers.account-forums(v-if="!subscribes.length && targetUser")
      .null 空空如也~
    .account-followers.account-forums(v-else)
      .account-follower(v-for="subscribe in subscribes")
        .account-follower-avatar
          img.img(
            :src="getUrl('forumLogo', subscribe.forum.logo)"
            v-if="subscribe.forum.logo"
            data-global-mouseover="showForumPanel"
            data-global-mouseout="hideForumPanel"
            :data-global-data="objToStr({fid: subscribe.forum.fid})"
            )
          .img(
            :style="`background-color: ${subscribe.forum.color};`" v-else
            data-global-mouseover="showForumPanel"
            data-global-mouseout="hideForumPanel"
            :data-global-data="objToStr({fid: subscribe.forum.fid})"
            )
        .account-follower-content
          .account-follower-name
            .account-follower-buttons(:data-forum="subscribe.forum.fid" :class="subForumsId.includes(subscribe.forum.fid)?'active':''" @click="subForum(subscribe.forum.fid, 'forum')")
              button.subscribe
            a(
              :href="`/f/${subscribe.forum.fid}`"
              data-global-mouseover="showForumPanel"
              data-global-mouseout="hideForumPanel"
              :data-global-data="objToStr({fid: subscribe.forum.fid})"
              ) {{subscribe.forum.displayName}}
          .account-follower-info
            | 文章：
            span {{subscribe.forum.countThreads}}
            | 回复：
            span {{subscribe.forum.countPosts}}
          .account-follower-description {{subscribe.forum.description || "暂无简介"}}
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.home-subscribe-forum {
  .null {
    text-align: center;
    margin-top: 5rem;
    margin-bottom: 5rem;
  }
  .account-followers{
    margin-top: 0.5rem;
    .account-follower:last-child{
      margin-bottom: 0;
    }
  }
  .account-follower{
    margin-bottom: 1.5rem;
    .account-follower-avatar{
      display: table-cell;
      vertical-align: top;
      .img{
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        box-sizing: border-box;
        border: 2px solid #eee;
        margin-right: 1.3rem;
      }
    }
    .account-follower-content{
      display: table-cell;
      vertical-align: top;
      width: 100%;
      position: relative;

      .account-follower-name{
        height: 2.1rem;
        box-sizing: border-box;
        padding-right: 9rem;
        .hideText(@line: 1);
        a{
          font-size: 1.4rem;
          color: @primary;
          //font-weight: 700;
          transition: border-bottom-color 200ms;
          border-bottom: 1px solid rgba(0, 0, 0, 0);
          &:hover, &:focus{
            text-decoration: none;
            color: @primary;
          }
          &:hover{
            border-color: @primary;
          }
        }
      }
      .account-follower-level{
        margin-top: 0.5rem;
        font-size: 1rem;
        &>div{
          display: inline-block;
        }
        .account-follower-grade{
          margin-right: 0.5rem;
        }
        .account-follower-certs{
          color: @accent;
        }
      }
      .account-follower-description{
        margin-top: 0.5rem;
        height: 1.5rem;
        .hideText(@line: 1);
        color: #777;
        font-size: 1.15rem;
      }
    }
  }
  .account-follower-buttons{
    position: absolute;
    top: 0;
    right: 0;
    font-size: 1rem;

    @buttonHeight: 2rem;
    @buttonWidth: 4rem;

    button{
      &:focus{
        outline: none;
      }
      height: @buttonHeight;
      width: @buttonWidth;
      //line-height: @buttonHeight;
      border-radius: 2px;
      box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.2);
    }
    .category{
      background-color: #fff;
      display: none;
      color: @dark;
      border: 1px solid #ccc;
      &:hover{
        background-color: #eee;
      }
    }
    .subscribe{
      background-color: @primary;
      border: 1px solid @primary;
      color: #fff;
      &:after{
        content: "订阅";
      }
      &.collection-button:after{
        content: "收藏";
      }
      &:hover{
        background-color: #2777b1;
      }
    }
    &.active{
      .subscribe{
        background-color: @accent;
        border: 1px solid @accent;
        &:hover{
          background-color: #cb4c61;
        }
        &:after{
          content: "退订";
        }
        &.collection-button:after{
          content: "取藏"
        }
      }
      .category{
        display: inline-block;
      }
    }
  }
}
</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
import {getUrl} from "../../../../lib/js/tools";
import {subForum} from "../../../../lib/js/subscribe";
import {objToStr} from "../../../../lib/js/tools";
import {getState} from "../../../../lib/js/state";
import Paging from "../../../../lib/vue/Paging";
import {setPageTitle} from "../../../../lib/js/pageSwitch";
export default {
  data: () => ({
    uid: '',
    forumCategories: [],
    t: null,
    targetUser: null,
    paging: null,
    subscribes: [],
    subForumsId: [],
    loading: false,
  }),
  components: {
    "paging": Paging
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  mounted() {
    setPageTitle('关注的专业');
    this.initData();
    this.getForums();
  },
  methods: {
    objToStr: objToStr,
    getUrl: getUrl,
    initData() {
      const {uid} = this.$route.params;
      const {uid: stateUid} = getState();
      this.uid = uid || stateUid;
    },
    //获取用户关注的专业列表
    getForums(page) {
      this.loading = true;
      const self = this;
      let url = `/u/${self.uid}/profile/subscribe/forumData`;
      if(self.t) url = url + `?t=${self.t}`;
      if(page) {
        if(url.indexOf('?') === -1) {
          url = url + `?page=${page}`;
        } else {
          url = url + `page=${page}`;
        }
      }
      nkcAPI(url, 'GET')
      .then(res => {
        self.forumCategories = res.forumCategories;
        self.targetUser = res.targetUser;
        self.subscribes = res.subscribes;
        self.t = res.t;
        self.paging = res.paging;
        self.subForumsId = res.subForumsId;
      })
      .catch(err => {
        sweetError(err);
      })
      self.loading = false;
    },
    //点击分页按钮
    clickBtn(num) {
      this.getForums(num);
    },
    //取关和关注
    subForum(fid) {
      const sub = !this.subForumsId.includes(fid);
      const self = this;
      subForum(fid, sub)
      .then(() => {
        const index = self.subForumsId.indexOf(fid);
        if(sub) {
          sweetSuccess('订阅成功');
          //将关注的id添加到关注的专业id数组中
          if(index === -1) self.subForumsId.push(fid);
        } else {
          sweetSuccess('退订成功');
          //将关注的id从关注专业中去除
          if(index !== -1) self.subForumsId.splice(index, 1);
        }
      }).catch(err => {
          sweetError(err);
      })
    },
    //点击专业分类时
    clickType(id) {
      this.t = id;
      this.getForums();
    }

  }
}
</script>
