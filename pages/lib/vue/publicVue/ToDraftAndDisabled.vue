<template lang="pug">
  .disabled-and-todraft
    disabled(ref="disabled")
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
</style>
<script>
import DisabledPost from "../post/DisabledPost";

export const contentType = {
  post: 'post',
  document: 'document'
};

export default {
  data: () => ({
  }),
  components: {
    disabled: DisabledPost
  },
  methods: {
    //打开退修和审核弹窗
    open(arr) {
      const self = this;
      self.$refs.disabled.open(function(data) {
        console.log('delType', data.delType);
        const documentArr = [];
        const postArr = [];
        for(const item of arr) {
          const {type, id} = item;
          if(type === contentType.post) {
            postArr.push({
              postsId: [id],
              reason: data.reason,
              remindUser: data.noticeType,
              delType: data.type,
              violation: data.illegalType
            });
          } else if(type === contentType.document) {
            documentArr.push({
              type: 'document',
              docId: id,
              reason: data.reason,
              delType: data.type === 'toDraft' ? 'faulty' : 'disabled',
              remindUser: data.noticeType,
              violation: data.illegalType
            });
          }
        }
        self.post(postArr, 0);
        self.document(documentArr, 0);
        self.$refs.disabled.close();
      });
    },
    //提交post
    post(arr, index) {
      const self = this;
      let data = arr[index];
      if(!data) return;
      let url;
      if(data.delType === 'toRecycle') {
        //送回收站
        url = "/threads/recycle";
      } else {
        //退修
        url = '/threads/draft';
      }
      //去除删除类型
      delete data.delType;
      return nkcAPI(url, 'POST', data)
        .then(() => {
          screenTopAlert('操作成功');
          self.post(arr, index + 1);
        })
        .catch(err => {
          sweetError(err);
          self.post(arr, index + 1);
        })
    },
    //提交document
    document(arr, index) {
      const self = this;
      let data = arr[index];
      if(!data) return;
      return nkcAPI('/review', 'PUT', data)
        .then(() => {
          screenTopAlert('操作成功');
          self.document(arr, index + 1);
        })
        .catch(err => {
          sweetError(err);
          self.document(arr, index + 1);
        })
    }
  },
}
</script>
