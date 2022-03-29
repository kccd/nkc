<template lang="pug">
  .post-panel.b-s-10
    .paging-button
<<<<<<< HEAD
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
    .user-list-item(v-else-if="['follow', 'fans'].includes(t)")
      .user-list-warning(v-if="!users || users.length === 0") {{t === 'fans' ? "还没有粉丝" : "还没有关注任何用户"}}
      user-follow-and-fans(ref="userFollowAndFans" :users="users")
=======
      a.radius-left.button(@click="toRoute('moment')" :class="t === 'moment'?'active':''") 动态
      a.button(@click="toRoute('post')" :class="t === 'post'?'active':''") 回复
      a.button(@click="toRoute('thread')" :class="t === 'thread'?'active':''") 文章
      a.button(@click="toRoute('follow')" :class="t === 'follow' ? 'active' : ''") 关注
      a.radius-right.button(@click="toRoute('fans')" :class="t === 'fans' ? 'active' : ''") 粉丝
    .post-panel-item
      router-view
>>>>>>> 8b498f28c89a9575574a8e5d45ba90b92e31e4d1
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
</style>
<script>
import {nkcAPI} from "../../../js/netAPI";
<<<<<<< HEAD
import Moments from "../../zone/Moments";
import Complaint from "../../Complaint";
import ViolationRecord from "../../ViolationRecord";
import Review from "../postReview/Review";
import SinglePost from "../postModel/SinglePost";
import UserFollowAndFans from "../userAttention/UserFollowAndFans"
import Paging from "../../Paging";
import ToColumn from "../toColumn/ToColumn";
import { EventBus } from "../eventBus"

=======
import Paging from "../../Paging";
>>>>>>> 8b498f28c89a9575574a8e5d45ba90b92e31e4d1
export default {
  data:() => ({
    uid: '',
    t: null,
    momentsData: null,
    posts: null,
    users: [],
    paging: null,
  }),
  components: {
<<<<<<< HEAD
    "moments": Moments,
    "complaint": Complaint,
    "violation-record": ViolationRecord,
    "review": Review,
    "single-post": SinglePost,
    // 关注 和 粉丝 
    "user-follow-and-fans": UserFollowAndFans,
=======
>>>>>>> 8b498f28c89a9575574a8e5d45ba90b92e31e4d1
    "paging": Paging,
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  mounted() {
    const {params, name} = this.$route;
    const {uid} = params;
    this.uid = uid;
<<<<<<< HEAD
    this.getUserCardInfo();
    // pageType 显示的页面类型。例如 动态 回复。 num 页码
    EventBus.$on("updateData", ( pageType, num )=>{
      switch( type ){
        case "follow": 
          this.getUserCardInfo( pageType, num );
        default:
          break
      }
    })
=======
    this.t = name;
>>>>>>> 8b498f28c89a9575574a8e5d45ba90b92e31e4d1
  },
  methods: {
    //跳转到指定路由
    toRoute(name) {
      this.t = name;
      this.$router.push({
        name
      });
    },
<<<<<<< HEAD
    //点击分页
    clickButton(num) {
      this.getUserCardInfo(this.t, num);
    }
  },
  destroyed(){
    EventBus.$off();
=======
>>>>>>> 8b498f28c89a9575574a8e5d45ba90b92e31e4d1
  }
}
</script>
