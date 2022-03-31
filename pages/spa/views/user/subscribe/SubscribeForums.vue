<template lang="pug">
  .home-subscribe-forum
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
    .account-followers.account-forums
      .null(v-if="!subscribes.length") 空空如也~
      .account-follower(v-for="subscribe in subscribes" v-else)
        .account-follower-avatar
          img.img(:src="getUrl('forumLogo', subscribe.forum.logo)" v-if="subscribe.forum.logo")
          .img(:style="`background-color: ${subscribe.forum.color};`" v-else)
        .account-follower-content
          .account-follower-name
            .account-follower-buttons(:data-forum="subscribe.forum.fid" :class="subForumsId.includes(subscribe.forum.fid)?'active':''" @click="subForum(subscribe.forum.fid, 'forum')")
              button.subscribe
            a(:href="`/f/${subscribe.forum.fid}`") {{subscribe.forum.displayName}}
          .account-follower-info
            | 文章：
            span {{subscribe.forum.countThreads}}
            | 回复：
            span {{subscribe.forum.countPosts}}
          .account-follower-description {{subscribe.forum.description || "暂无简介"}}
</template>
<style lang="less">
@import "../../../../publicModules/base";
.home-subscribe-forum {
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
        content: "关注";
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
          content: "取关";
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
import Paging from "../../../../lib/vue/Paging";
import {getUrl} from "../../../../lib/js/tools";
import {subForum} from "../../../../lib/js/subscribe";
export default {
  data: () => ({
    uid: '',
    forumCategories: [],
    t: null,
    targetUser: null,
    paging: null,
    subscribes: [],
    subForumsId: [],
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
    this.initData();
    this.getForums();
  },
  methods: {
    getUrl: getUrl,
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取用户关注的专业列表
    getForums(page) {
      const self = this;
      let url = `/u/${self.uid}/p/s/forum`;
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
    },
    //点击分页按钮
    clickBtn(num) {
      this.getForums(num);
    },
    //取关和关注
    subForum(fid) {
      const sub = !this.subForumsId.includes(fid);
    },
    //点击专业分类时
    clickType(id) {
      this.t = id;
      this.getForums();
    }

  }
}
</script>
