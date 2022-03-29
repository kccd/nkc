<template lang="pug">
  .post-panel.b-s-10
    .paging-button
      a.radius-left.button(@click="getUserCardInfo()" :class="!t?'active':''") 动态
      a.button(@click="getUserCardInfo('post')" :class="t === 'post'?'active':''") 回复
      a.button(@click="getUserCardInfo('thread')" :class="t === 'thread'?'active':''") 文章
      a.button(@click="getUserCardInfo('follow')" :class="t === 'follow' ? 'active' : ''") 关注
      a.radius-right.button(@click="getUserCardInfo('fans')" :class="t === 'fans' ? 'active' : ''") 粉丝
    .paging-button
      a.pointer.button.radius-left.radius-right(@click="managementPosts()") 管理
      span.post-management-button
        a.pointer.button(@click="selectAll()") 全选
        a.pointer.button.radius-right(@click="toColumn()") 推送到专栏
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
        .post-item(v-for="(post,index) in posts")
          review(ref="review" :post="post" v-if="!post.reviewed")
          .thread-draft-info(v-else-if="post.draft") 退修中，仅自己可见，修改后对所有人可见
          .thread-disabled-info(v-else-if="post.disabled" ) 已屏蔽，仅自己可见
          single-post(ref="singlePost" :post="post")
</template>
<style lang="less">
@import "../../../../publicModules/base";
</style>
<script>
import {nkcAPI} from "../../../js/netAPI";
import Moments from "../../zone/Moments";
import Complaint from "../../Complaint";
import ViolationRecord from "../../ViolationRecord";
import Review from "../postReview/Review";
import SinglePost from "../postModel/SinglePost";
export default {
  data:() => ({
    uid: '',
    t: null,
    momentsData: null,
    posts: null,
  }),
  components: {
    "moments": Moments,
    "complaint": Complaint,
    "violation-record": ViolationRecord,
    "review": Review,
    "single-post": SinglePost
  },
  mounted() {
    const {uid} = this.$route.params;
    this.uid = uid;
    this.getUserCardInfo();
  },
  methods: {
    //获取用户卡片信息
    getUserCardInfo(type) {
      const {uid} = this;
      const self= this;
      let url = `/u/${uid}/userHomeCard`;
      if(type) {
        url = url + `?t=${type}`
      }
      nkcAPI(url, "GET")
      .then(res => {
        console.log('res', res);
        self.t = res.t;
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
    }

  }
}
</script>
