<template lang="pug">
  .disabled-and-todraft
    disabled(ref="disabled")
</template>
<style lang="less" scoped>
@import '../../../publicModules/base';
</style>
<script>
import DisabledPost from '../post/DisabledPost';
import { reviewActions } from '../../js/review';
export const contentType = {
  post: 'post',
  document: 'document',
};

export default {
  data: () => ({}),
  components: {
    disabled: DisabledPost,
  },
  methods: {
    //打开退修和审核弹窗
    open(arr, callback) {
      const self = this;
      self.$refs.disabled.open(function (data) {
        const documentArr = [];
        const postArr = [];
        for (const item of arr) {
          const { type, id } = item;
          if (type === contentType.post) {
            postArr.push({
              postsId: [id],
              reason: data.reason,
              remindUser: data.noticeType,
              delType: data.type,
              violation: data.illegalType,
            });
          } else if (type === contentType.document) {
            documentArr.push({
              type: 'document',
              docId: id,
              reason: data.reason,
              delType: data.type === 'toDraft' ? 'faulty' : 'disabled',
              remindUser: data.noticeType,
              violation: data.illegalType,
            });
          }
        }
        try {
          self.post(postArr, 0);
          self.document(documentArr, 0);
          self.$refs.disabled.close();
        } catch (err) {
          console.log(err);
        }
        callback();
      });
    },
    //提交post
    post(arr, index) {
      const self = this;
      let data = arr[index];
      if (!data) return;
      return Promise.resolve()
        .then(() => {
          if (data.delType === 'toRecycle') {
            return reviewActions.rejectPostReviewAndDelete({
              postsId: data.postsId,
              reason: data.reason,
              remindUser: data.remindUser,
              violation: data.violation,
            });
          } else {
            return reviewActions.rejectPostReviewAndReturn({
              postsId: data.postsId,
              reason: data.reason,
              remindUser: data.remindUser,
              violation: data.violation,
            });
          }
        })
        .then(() => {
          screenTopAlert('操作成功');
          self.post(arr, index + 1);
        })
        .catch((err) => {
          sweetError(err);
          self.post(arr, index + 1);
        });
    },
    //提交document
    document(arr, index) {
      const self = this;
      let data = arr[index];
      if (!data) return;
      return Promise.resolve()
        .then(() => {
          if (data.delType === 'disabled') {
            return reviewActions.rejectDocumentReviewAndDelete({
              docId: data.docId,
              reason: data.reason,
              remindUser: data.remindUser,
              violation: data.violation,
            });
          } else {
            return reviewActions.rejectDocumentReviewAndReturn({
              docId: data.docId,
              reason: data.reason,
              remindUser: data.remindUser,
              violation: data.violation,
            });
          }
        })
        .then(() => {
          screenTopAlert('操作成功');
          self.document(arr, index + 1);
        })
        .catch((err) => {
          sweetError(err);
          self.document(arr, index + 1);
        });
    },
  },
};
</script>
