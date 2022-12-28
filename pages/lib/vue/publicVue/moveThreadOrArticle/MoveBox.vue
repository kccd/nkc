<template lang="pug">
  .modal.fade#moduleMoveThread(tabindex="-1" role="dialog" aria-labelledby="myModalLabel")
    .modal-dialog(role="document")
      .modal-content
        .modal-header
          button.close(data-dismiss="modal" aria-label="Close")
            span(aria-hidden="true") &times;
          h4.modal-title 修改多维分类
        .modal-body
          move-category(
            :selected-cid='article.tcId'
            component-type='dialog'
            ref='moveCategoryList'
          )
          .m-t-05.text-danger 注意：仅更改已选择类别的文章属性
        .modal-footer
          .display-i-b(v-if="submitting") 处理中，请稍候...
          button(type="button" class="btn btn-default btn-sm" data-dismiss="modal") 关闭
          button(v-if="submitting" type="button" class="btn btn-primary btn-sm" disabled) 确定
          button(v-else type="button" class="btn btn-primary btn-sm" @click="submit") 确定

</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";

</style>
<script>
import MoveCategory from "./MoveCategory";

export default {
  components: {
    'move-category': MoveCategory,
  },
  data: () => ({
    callback: null,
    submitting: false,
    selectedCategories: [],
    article: {},
  }),
  mounted() {
    this.dom = $("#moduleMoveThread");
    this.dom.modal({
      show: false
    });
  },
  methods: {
    open(callback, options={}){
      this.article = options.article;
      this.dom.modal("show");
      this.$refs.moveCategoryList.open((data)=>{
        this.selectedCategories = data;
      },{source:'article'})
    },
    submit(){
      const tcId = this.selectedCategories.map(item=>item.nodeId).filter(item=>typeof item === 'number');
      nkcAPI('/zone/a/'+this.article._id+'/category', 'PUT',{
        tcId
      }).then(()=>{
        sweetSuccess('操作成功');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }).catch(err => {
          sweetError(err);
        })
    },
    getSelectedCategoriesId() {
      return this.$refs.moveCategoryList.getSelectedCategoriesId();
    },
  },
}
</script>
