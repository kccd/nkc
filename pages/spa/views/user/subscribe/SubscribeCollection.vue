<template lang="pug">
  .subscribe-thread(v-if="targetUser")
    subscribe-types(ref="subscribeTypes")
    nav-types(ref="navTypes" :target-user="targetUser" :parent-type="parentType" :child-type="childType" :subscribe-types="subscribeTypes" @click-type="clickType")
    paging(ref="paging" :pages="pageButtons" @click-button="clickPage")
    .account-threads.subscribe-thread
      .null(v-if="!subscribes.length") 空空如也~
      .subscribe-thread-list(v-else)
        collection-list(ref="collectionList" :subscribes="subscribes" :threads-id="collectionThreadsId" type='collection')
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
@media (max-width: 768px) {
  .account-thread-avatar{
    &>div{
      width: 9rem!important;
      height: 6rem!important;
    }
  }
}

.null {
  text-align: center;
  margin: 5rem 0;
}

.account-threads, .account-followers{
  .account-thread:last-child{
    margin-bottom: 0;
  }
}

.subscribe-thread {
  .account-thread{
    margin-bottom: 1.5rem;
    //padding-bottom: 1rem;
    &.draft-list{
      .checkbox{
        display: inline;
        cursor: pointer;
        label{
          padding: 4px 0 0 20px;
        }
      }
      .draft-button{
        .dropdown-menu{
          a{
            color: #333;
            .fa{
              color: #444;
            }

          }
        }
        a{
          color: @primary;
        }
        button{
          background-color: rgba(0, 0, 0, 0);
          color: @accent;
          margin-right: 0.3rem;
          border: none;
          &:focus{
            outline: none;
          }
        }
      }
    }
    .account-post-thread-user{
      .time{
        color: @accent;
        display: inline;
        margin-right: 0.3rem;
      }
      img{
        height: 1.5rem;
        width: 1.5rem;
        border-radius: 50%;
        margin-left: 0.3rem;
        margin-top: -2px;
        margin-right: 0.2rem;
      }
      a{
        color: @primary;
      }
    }
    .account-post-thread{
      padding: 1rem;
      background-color: #f6f2ee;
      border-radius: 3px;
      .account-post-thread-warning{
        text-align: center;
        color: #bbab9c;
        //font-weight: 700;
        .fa{
          margin-right: 0.3rem;
        }
      }
    }
    .account-post-content{
      margin: 0.4rem 0 0.6rem 0;
      text-decoration: none;
      color: @dark;
      max-height: 5rem;
      .hideText(@line: 3)
    }
    &.draft{
      @warningColor: rgba(255, 255, 0, 0.2);
      background-color: @warningColor;
      .account-reason{
        text-align: center;
        color: @accent;
        padding: 0.5rem;
        font-weight: 700;
        //background-color: @warningColor;
      }
    }
    &.disabled{
      @disabledColor: rgba(0, 0, 0, 0.07);
      background-color: @disabledColor;
      .account-reason{
        text-align: center;
        color: @accent;
        padding: 0.5rem;
        font-weight: 700;
        //background-color: @warningColor;
      }
    }
    &.review{
      @disabledColor: rgba(255, 0, 0, 0.07);
      background-color: @disabledColor;
      .account-reason{
        text-align: center;
        color: @accent;
        padding: 0.5rem;
        font-weight: 700;
        //background-color: @warningColor;
      }
    }
    .account-thread-avatar{
      display: table-cell;
      vertical-align: top;
      &>div{
        width: 12rem;
        height: 8rem;
        margin-right: 1rem;
        overflow: hidden;
        border-radius: 3px;
        background-size: cover;
      }
    }
    .account-thread-content{
      display: table-cell;
      vertical-align: top;
      overflow: hidden;
      width: 100%;
      .account-thread-title{
        font-size: 1.3rem;
        display: -webkit-box;
        font-weight: 700;
        height: 1.8rem;
        color: @dark;
        .hideText(@line: 1);
        &.digest a{
          color: @accent;
          &:hover, &:focus{
            color: @accent;
          }
          &:hover{
            border-color: @accent;
          }
        }
        a{
          color: @dark;
          transition: border-bottom-color 200ms;
          border-bottom: 1px solid rgba(0, 0, 0, 0);
          padding-bottom: 0.1rem;
          &:hover, &:focus{
            text-decoration: none;
            color: @dark;
          }
          &:hover{
            border-color: @dark;
          }
        }
      }
      .account-thread-abstract{
        margin: 0.6rem 0;
        max-height: 3.5rem;
        .hideText(@line: 2);
      }
      .account-thread-info{
        position: relative;
        height: 1.8rem;
        display: block;
        width: 100%;
        padding-right: 7rem;
        .hideText(@line: 1);
        &>div{
          display: inline;
          margin-right: 0.3rem;
        }
        .thread-forum-link{
          margin-right: 0.5rem;
          color: #888;
        }
        .thread-time{
          position: absolute;
          right: 0;
          top: 0;
        }
        .thread-user{
          margin-right: 0.3rem;
          &:hover, &:focus{
            color: #555;
            text-decoration: none;
          }
          img{
            height: 1.4rem;
            width: 1.4rem;
            margin-top: -2px;
            margin-right: 0.3rem;
            border-radius: 50%;
          }
          span{

          }
        }
        .fa{
          color: #aaa;
          margin-right: 0.3rem;
        }
        span{
          color: #888;
        }
      }
    }
  }
}
.subscribe-thread{
  .account-thread-title{
    padding-right: 9rem;
    position: relative;
    padding-top: 0.1rem;
    height: 2.1rem!important;
    box-sizing: border-box;
  }
}
</style>
<script>
import NavTypes from "./NavTypes";
import Paging from "../../../../lib/vue/Paging";
import SubscribeTypes from "../../../../lib/vue/SubscribeTypes";
import CollectionList from "../../../../lib/vue/ThreadList";
import {nkcAPI} from "../../../../lib/js/netAPI";
import {getUrl, fromNow} from "../../../../lib/js/tools";
import {collectionThread, collectionArticle} from "../../../../lib/js/subscribe";
import {objToStr} from "../../../../lib/js/tools";
import {getState} from "../../../../lib/js/state";
import {setPageTitle} from "../../../../lib/js/pageSwitch";
export default {
  data: () => ({
    uid: null,
    targetUser: null,
    subscribes: [],
    paging: null,
    t: 'null',
    parentType: null,
    childType: null,
    collectionThreadsId: [],
    subscribeTypes: [],
  }),
  components: {
    "subscribe-types": SubscribeTypes,
    'nav-types': NavTypes,
    'paging': Paging,
    'collection-list': CollectionList
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  mounted() {
    setPageTitle('收藏的文章');
    this.initData();
    this.getThreads();
  },
  methods: {
    objToStr: objToStr,
    getUrl: getUrl,
    fromNow: fromNow,
    threadType(thread) {
      const {disabled, recycleMark, reviewed} = thread;
      let klass = '';
      if(disabled) {
        klass = 'disabled'
      } else if(recycleMark) {
        klass = 'draft';
      } else if(!reviewed) {
        klass = 'review'
      }
      return klass;
    },
    initData() {
      const {uid} = this.$route.params;
      const {uid: stateUid} = getState();
      this.uid = uid || stateUid;
    },
    //获取用户收藏的文章
    getThreads(page = 0) {
      const self = this;
      let url = `/u/${self.uid}/profile/subscribe/collectionData?page=${page}`;
      if(self.t) url = url + `&t=${self.t}`;
      nkcAPI(url, 'GET')
      .then(res => {
        self.targetUser = res.targetUser;
        self.subscribes = res.subscribes;
        self.paging = res.paging;
        self.parentType = res.parentType;
        self.childType = res.childType;
        self.t = res.t;
        self.collectionThreadsId = res.collectionThreadsId;
        self.subscribeTypes = res.subscribeTypes;
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //点击文章分类时
    clickType(t){
      this.t = t;
      this.getThreads();
    },
    //点击分页
    clickPage(num) {
      // if(!num) return;
      this.getThreads(num);
    }
  }
}
</script>
