<template lang="pug">
  .post-panel.b-s-10
    to-column(ref="toColumn")
    .paging-button
      a.radius-left.button(@click="getUserCardInfo()" :class="!t?'active':''") 动态
      a.button(@click="getUserCardInfo('post')" :class="t === 'post'?'active':''") 回复
      a.button(@click="getUserCardInfo('thread')" :class="t === 'thread'?'active':''") 文章
      a.button(@click="getUserCardInfo('follow')" :class="t === 'follow' ? 'active' : ''") 关注
      a.radius-right.button(@click="getUserCardInfo('fans')" :class="t === 'fans' ? 'active' : ''") 粉丝
    .paging-button(v-if="['thread'].includes(t)" )
      a.pointer.button.radius-left.radius-right(@click="managementPosts()") 管理
      span.post-management-button
        a.pointer.button(@click="selectAll()") 全选
        a.pointer.button.radius-right(@click="toColumn()") 推送到专栏
    paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
    .user-list-item(v-if="!t" )
      .user-list-awrning(v-if="!t && (!momentsData || momentsData.length === 0)") 空空如也~
      .p-t-1(v-else)
        moments(
          ref="moments"
          :moments="momentsData"
          @complaint="complaint"
          @violation-record="violationRecord"
          )
        complaint(ref="complaint")
        violation-record(ref="violationRecord")
    .user-list-item(v-else-if="['thread', 'post'].includes(t)")
      .user-list-warning(v-if="!posts || posts.length === 0") 用户貌似未发表过任何内容
      .user-post-list
        .post-item(v-for="(post, index) in posts")
          hr(v-if="index")
          review(ref="review" :post="post" v-if="!post.reviewed")
          .thread-draft-info(v-else-if="post.draft") 退修中，仅自己可见，修改后对所有人可见
          .thread-disabled-info(v-else-if="post.disabled" ) 已屏蔽，仅自己可见
          .checkbox(v-if="managementBtn" )
            label
              input(type="checkbox" :value="post.pid" v-model="checkboxPosts")
          single-post(ref="singlePost" :post="post")
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.checkbox {
  display: inline-block;
  min-width: 15px;
  min-height: 15px;
}
.checkbox label{
  min-height: 15px;
}
</style>
<script>
import {nkcAPI} from "../../../js/netAPI";
import Moments from "../../zone/Moments";
import Complaint from "../../Complaint";
import ViolationRecord from "../../ViolationRecord";
import Review from "../postReview/Review";
import SinglePost from "../postModel/SinglePost";
import Paging from "../../Paging";
import ToColumn from "../toColumn/ToColumn";
export default {
  data:() => ({
    uid: '',
    t: null,
    momentsData: null,
    posts: null,
    paging: null,
    managementBtn: false,
    checkboxPosts: [],
  }),
  components: {
    "moments": Moments,
    "complaint": Complaint,
    "violation-record": ViolationRecord,
    "review": Review,
    "single-post": SinglePost,
    "paging": Paging,
    "to-column": ToColumn
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  mounted() {
    const {uid} = this.$route.params;
    this.uid = uid;
    this.getUserCardInfo();
  },
  methods: {
    //获取用户卡片信息
    getUserCardInfo(type, page) {
      const {uid} = this;
      const self= this;
      let url = `/u/${uid}/userHomeCard`;
      if(type) {
        url = url + `?t=${type}`
      }
      if(page) {
        const index = url .indexOf('?');
        if(index === -1) {
          url = url + `?page=${page}`;
        } else {
          url = url + `&page=${page}`;
        }
      }
      nkcAPI(url, "GET")
      .then(res => {
        self.t = res.t;
        self.paging = res.paging;
        self.momentsData = res.momentsData;
        self.posts = res.posts;
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //投诉或举报
    complaint(mid) {
      this.$refs.complaint.open('moment', mid);
    },
    //查看违规记录
    violationRecord(uid) {
      this.$refs.violationRecord.open({uid});
    },
    //post管理开关
    managementPosts() {
      this.managementBtn = !this.managementBtn;
    },
    //全选
    selectAll() {
      const {posts, checkboxPosts} = this;
      const postIds = [];
      for(const post of posts) {
        postIds.push(post.pid);
      }
      if(checkboxPosts.length === postIds.length) {
        this.checkboxPosts = [];
      } else {
        this.checkboxPosts = postIds;
      }
    },
    //推送到专栏
    toColumn() {
      const self = this;
      this.$refs.toColumn.open(function (data){
        const categoriesId = data.categoriesId;
        const columnId = data.columnId;
        nkcAPI('/m/' + columnId + '/post', 'POST', {
          categoriesId,
          type: 'addToColumnsId',
          postsId: self.checkboxPosts,
        })
        .then(() => {
          sweetSuccess("操作成功");
          self.checkboxPosts = [];
          self.$refs.toColumn.close();
        })
        .catch(err => {
          sweetError(err);
        })
      }, {
        selectMul :true,
      } );
    },
    //点击分页
    clickButton(num) {
      this.getUserCardInfo(this.t, num);
    }
  }
}
</script>
