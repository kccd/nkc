<template lang="pug">
.module-dialog-body(@click.stop)
  .module-dialog-header
    .module-dialog-title(ref='draggableHandle') 评论控制
    .module-dialog-close(@click.stop.prevent='close')
      .fa.fa-remove
  .module-dialog-content
    .draggable-panel-loading(v-if='loading') 加载中...
    .draggable-panel-content(v-else)
      .p-t-05.p-b-1
        div 文号：{{ `D${did}` }}
        .m-r-1
          .radio.m-l-1(v-for='opt in commentOptions', :key='opt.value')
            label
              input(type='radio', :value='opt.value', v-model='comment')
              span {{ opt.label }}
        //- .radio
        //-   label
        //-     input(type='radio'  value='rw' v-model='comment')
        //-     span 可查看、可评论
        //- .radio
        //-   label
        //-     input(type='radio'  value='r' v-model='comment')
        //-     span 只可查看
        //- .radio
        //-   label
        //-     input(type='radio'  value='n' v-model='comment')
        //-     span 不可查看、不可评论
        .text-right
          button.btn.btn-default.btn-sm.m-r-05(@click='close') 取消
          button.btn.btn-primary.btn-sm(@click='submit') 保存
</template>

<style lang="less" scoped>
@import '../../publicModules/base';

.module-dialog-body {
  text-align: left;
  display: none;
  position: fixed;
  width: 30rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;

  .module-dialog-header {
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    padding-right: 3rem;

    .module-dialog-close {
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
        color: #777;
      }
    }

    .module-dialog-title {
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
      text-align: center;
    }
  }

  .module-dialog-content {
    padding: 0 1rem;
  }
}
</style>

<script>
import { DraggableElement } from "../js/draggable";
import { nkcAPI } from "../js/netAPI";
import { sweetError, sweetSuccess } from "../js/sweetAlert";
export default {
  data: () => ({
    momentId: '',
    did: '',
    comment: '',
    loading: false,
    commentOptions: [
      { value: 'rw', label: '可查看、可评论' },
      { value: 'r', label: '只可查看' },
      { value: 'n', label: '不可查看、不可评论' },
    ],
  }),
  mounted() {
    this.initDraggableElement();
  },
  destroyed() {
    this.draggableElement && this.draggableElement.destroy();
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
      this.draggableElement.setPositionCenter()

    },
    submit() {
      const self = this;
      if (!this.momentId) return;
      nkcAPI(`/moment/${this.momentId}/comment`, 'POST', {
        comment: this.comment
      })
        .then(() => {
          sweetSuccess('保存成功');
          self.close();
        })
        .catch(err => {
          sweetError(err);
        });
    },
    open({ momentId, did, commentControl }) {
      this.did = did
      this.momentId = momentId;
      this.draggableElement.show();
      const self = this;
      this.loading = true;
      nkcAPI(`/moment/${this.momentId}/comment`, 'GET')
        .then((res) => {
          self.comment = res.commentControl;
          self.loading = false;
        })
        .catch((err) => {
          sweetError(err);
        });
    },
    close() {
      this.draggableElement.hide();
      this.momentId = '';
      this.did = '';
      this.comment = 'rw';
    }
  }
}
</script>
