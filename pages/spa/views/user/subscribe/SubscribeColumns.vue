<template lang="pug">
  div
    paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")
    .subscribe-columns
      .null(v-if="!subscribes" ) 空空如也~~
      .account-follower(v-for="item in subscribes")
        .account-follower-avatar
          img.img(:src="getUrl('columnAvatar',item.column._id, 'sm')")
        .account-follower-content
          .account-follower-name
            .account-follower-buttons
              button.subscribe(:class="subColumnsId.indexOf(item.column._id)+1 && visitorSubColumnsId.indexOf(item.column._id)+1 ?'cancel':'focus'" @click="columnFollowType(item.column._id)") {{subColumnsId.indexOf(item.column._id)+1 && visitorSubColumnsId.indexOf(item.column._id)+1 ? '取关':'关注'}}
            a(:href="getUrl('columnHome', item.column._id)") {{item.column.name}}
          .account-follower-description {{item.column.description || "暂无简介"}}
</template>
<style lang="less" scoped>
.subscribe-columns{
  .account-follower{
    margin-bottom: 1.5rem;
    &:last-child{
      margin-bottom: 0;
    }
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
        .account-follower-buttons{
          position: absolute;
          top: 0;
          right: 0;
          font-size: 1rem;

          .cancel{
            background-color: #e85a71;
            border: 1px solid #e85a71;
            color: #fff;
            margin-left: 3px;
            &:hover{
              background-color: #cb4c61;
            }
          }
          .focus{
            background-color: #2b90d9;
            border: 1px solid #2b90d9;
            color: #fff;
            &:hover{
              background-color: #2777b1;
            }
          }
        }
        a{
          font-size: 1.4rem;
          color: #2b90d9;
          transition: border-bottom-color 200ms;
          border-bottom: 1px solid rgba(0, 0, 0, 0);
        }
      }
      .account-follower-description{
        margin-top: 0.5rem;
        height: 1.5rem;
        word-break: break-word;
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        color: #777;
        font-size: 1.15rem;
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
import {getUrl} from "../../../../lib/js/tools";
import {subColumn} from "../../../../lib/js/subscribe";
import Paging from "../../../../lib/vue/Paging";
export default {
  data: () => ({
    uid: null,
    subscribes: null,
    subColumnsId:null,
    paging: null,
    visitorSubColumnsId:null,
    user:null,
  }),
  components: {
    'paging': Paging
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  mounted() {
    this.initData();
    this.getColumns();
  },
  methods: {
    getUrl: getUrl,
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取用户关注的专栏列表
    getColumns(page) {
      const self = this;
      let url = `/u/${self.uid}/p/s/column`;
      if(page) {
        if(url.indexOf('?') === -1) {
          url = url + `?page=${page}`;
        } else {
          url = url + `page=${page}`;
        }
      }
      nkcAPI(url, 'GET')
      .then(res => {
        self.subscribes = res.subscribes;
        self.subColumnsId = res.subscribes.map((res)=> res.column._id);
        self.paging = res.paging;
        self.visitorSubColumnsId = res.subColumnsId;
        self.user = res.user;
      })
      .catch(err => {
        sweetError(err);
      })

    },
    //点击分页按钮
    clickBtn(num) {
      this.getColumns(num);
    },
    //取消关注和关注
    columnFollowType(uid) {
      const self = this;
      let subIdType = uid !== self.user.uid ? self.visitorSubColumnsId : self.subColumnsId;
      const sub = !subIdType.includes(uid);
      const index = subIdType.indexOf(uid);
      subColumn(uid,sub)
          .then((res)=>{
            if(sub) {
              sweetSuccess('关注成功');
              if(index === -1) subIdType.push(uid);
            } else {
              sweetSuccess('取消关注');
              if(index !== -1) subIdType.splice(index, 1);
            }
          })
    },
  }
}
</script>
