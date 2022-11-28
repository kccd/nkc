<template lang="pug">
.review(v-if="permissions")
  disabled-post(ref="disabledPost")
  .no-review(v-if="permissions.reviewed && permissions.disabled")
    h4 内容未审核
    p 送审理由：{{post.reviewReason}}
    | 通过请点击
    button.btn.btn-xs.btn-default(@click="reviewPost(post.pid)") 通过
    | &nbsp; 按钮，不通过请点击
    button.btn.btn-xs.btn-default(@click="disabled(post.pid)") 退修或删除
    | 按钮。
  .reviewed(v-else)
    | 审核中
    //.reason(v-if="post.reviewReason") 理由: {{post.reviewReason}}
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.review {
  .no-review {
    text-align: center;
    background-color: #ffdcb2;
  }
  .reviewed {
    background-color: #ffdcb2;
    padding: 0.3rem 0 0.3rem 0;
    color: #fff;
    font-size: 1.2rem;
    text-align: center;
  }
}
</style>
<script>
import {reviewPost} from "../../../js/post";
import {nkcAPI} from "../../../js/netAPI";
import DisabledPost from "../../post/DisabledPost";
export default {
  props: ['post', 'permissions'],
  data: () => ({
  }),
  components: {
    "disabled-post": DisabledPost
  },
  mounted() {
  },
  methods: {
    //审核post
    reviewPost(pid) {
      const self = this;
      reviewPost(pid)
      .then(() => {
        //刷新当前页面
        self.$emit('refresh');
      });
    },
    //屏蔽或退修
    disabled(pid) {
      const self = this;
      self.$refs.disabledPost.open(function(data) {
        const body = {
          postsId: pid,
          reason: data.reason,
          remindUser: data.remindUser,
          violation: data.violation
        };
        let url;
        if(data.type) {
          url = "/threads/draft";
        } else {
          url = "/threads/recycle";
        }
        nkcAPI(url, "POST", body)
        .then(res => {
          sweetSuccess('操作成功');
          self.$refs.disabledPost.close();
        })
        .catch(err => {
          sweetError(err);
        })
      })
    }
  }
}
</script>
