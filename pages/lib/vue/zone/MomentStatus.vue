<template lang="pug">
  .moment-status(v-if="moment && moment.status === 'unknown'")
    .review 内容未审核
    p 送审理由:{{moment.reason}}
    | 通过审核请点击
    button.btn.btn-xs.btn-default(@click="reviewMoment") 通过
    | &nbsp; 按钮，不通过请点击
    button.btn.btn-xs.btn-default(@click="deleteMoment") 删除
    | 按钮。
    a(href="/review", target="_blank") 待审核列表
  .moment-status(v-else-if="moment && moment.status === 'deleted'")
    .deleted 内容已被删除
</template>

<style lang="less">
@import '../../../publicModules/base';
.moment-status {
  text-align: center;
  font-style: oblique;
  .review {
    color: red;
  }
  .deleted {
    background: #bdbdbd;
  }
}
</style>

<script>
import {nkcAPI} from "../../js/netAPI";

export default {
  props: ['moment'],
  data: () => ({

  }),
  mounted() {
  },
  methods: {
    //动态审核通过
    reviewMoment() {
      const {docId} = this.moment;
      nkcAPI('/review', 'PUT', {
        pass: true,
        docId,
        type: 'document'
      })
        .then(res => {
          sweetSuccess('操作成功');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        })
        .catch(err => {
          sweetError(err);
        })
    },
    //删除动态
    deleteMoment() {
      const {momentId, momentCommentId} = this.moment;
      let _id = momentCommentId;
      if(!_id) {
        _id = momentId;
      }
      if(!_id) return;
      sweetQuestion("你确定要删除吗？")
        .then(() => {
          nkcAPI(`/moment/${_id}`, 'DELETE', {
          })
            .then(() => {
              sweetSuccess('操作成功');
            })
            .catch(err => {
              sweetError(err);
            })
        })
    }
  }
}
</script>
