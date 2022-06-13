<template lang="pug">
  .nkc-credit(ref="content")
    .nkc-credit-header(ref="creditHeader")
      span {{headerTitle}}
      .close-icon(type="button" @click="close")
        span.fa.fa-remove
    .nkc-credit-content(v-if="loading")
      .p-t-2.p-b-2.text-center 加载中...
    .nkc-credit-content(v-else)
      .form
        div(v-if="creditType === creditTypes.kcb")
          .form-group
            span 向作者转账{{creditScore.name}}以资鼓励
          .form-group
            label 分值
            span （{{creditSettings.min / 100}} {{creditScore.unit}} - {{creditSettings.max / 100}} {{creditScore.unit}}）
            input.form-control(type='number' v-model.number="kcbNumber")
        div(v-else)
          .form-group
            label 分值
            span （-{{xsfSettings.reduceLimit}} 到 {{xsfSettings.addLimit}}）
            input.form-control(type='number' v-model.number="xsfNumber")
        .form-group
          label 原因（不超过 500 字）
          textarea.form-control(rows="3" v-model="reason")
      .m-b-05.text-right
        button.btn.btn-sm.btn-default.m-r-05(@click="close") 取消
        button.btn.btn-sm.btn-primary(v-if="submitting" disabled) 提交中...
        button.btn.btn-sm.btn-primary(@click="submit" v-else) 提交
</template>

<style scoped lang="less">
.nkc-credit {
  display: none;
  width: 30rem;
  position: fixed;
  background-color: #fff;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #f0f0f0;

  .nkc-credit-header{
    cursor: move;
    height: 3rem;
    line-height: 3rem;
    background-color: #dadada;
    padding-left: 1rem;
    position: relative;
    padding-right: 3rem;
    .close-icon{
      cursor: pointer;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
    }
    .close-icon:hover {
      background-color: red;
      color: #fff;
    }
  }
  .nkc-credit-content{
    padding: 0.5rem 1rem;
    .form-group{
      margin-bottom: 1rem;
    }
  }
  .nkc-credit-footer{

  }
}
</style>

<script>
import { sweetError } from '../js/sweetAlert';
import { DraggableElement } from "../js/draggable";

export const creditTypes = {
  xsf: 'xsf',
  kcb: 'kcb'
};

export const creditTypeNames = {
  kcb: '鼓励',
  xsf: '评学术分'
};

export const contentTypes = {
  post: 'post',
  article: 'article',
  comment: 'comment',
};

export default {
  data: () => ({

    kcbNumber: 1,
    xsfNumber: 1,
    reason: '',

    creditType: creditTypes.kcb,
    contentId: '',
    contentType: '',
    creditScore: null,
    userKcb: 0,
    creditSettings: null,
    xsfSettings: null,
    loading: true,
    submitting: false,
    creditTypes,
    creditTypeNames,
  }),
  computed: {
    headerTitle() {
      return creditTypeNames[this.creditType];
    }
  },
  mounted() {
    this.dialog = new DraggableElement(
      this.$refs.content,
      this.$refs.creditHeader
    );
	  this.dialog.setPositionCenter();
  },
  destroyed(){
    this.dialog.destroy();
  },
  methods: {
    open(creditType, contentType, contentId){
      const self = this;
      self.creditType = creditType;
      self.contentId = contentId;
      self.contentType = contentType;
      self.loading = true;
      self.show();
      return Promise.resolve()
        .then(() => {
          if(!contentId || !contentType) {
            throw new Error(`未指定评分内容`);
          }
          return self.initSettings();
        })
        .then(() => {
          self.loading = false;
        })
        .catch(sweetError);
    },
    initSettings() {
      const self = this;
      const {creditType} = self;
      return nkcAPI(`/settings/credit`, 'GET')
        .then(res => {
          const {
            creditScore,
            creditSettings,
            xsfSettings
          } = res;
          self.creditScore = creditScore;
          self.creditSettings = creditSettings;
          self.xsfSettings = xsfSettings;
        });
    },
    close(){
      this.dialog.hide();
    },
    show() {
      this.dialog.show();
    },
    reset() {
      this.kcbNumber = 0;
      this.xsfNumber = 0;
      this.reason = '';
    },
    submit(){
      const {
        reason,
        xsfNumber,
        kcbNumber,
        creditType,
        creditTypes,
        contentId,
        contentType,
      } = this;
      const self = this;
      let url;
      if(creditType === creditTypes.xsf) {
        // 评学术分
        if(contentType === contentTypes.post) {
          url = `/p/${contentId}/credit/xsf`;
        } else if(contentType === contentTypes.article) {
          url = `/article/${contentId}/credit/xsf`;
        } else if(contentType === contentTypes.comment) {
          url = `/comment/${contentId}/credit/xsf`;
        }
      } else {
        // 鼓励
        if(contentType === contentTypes.post) {
          url = `/p/${contentId}/credit/kcb`;
        } else if(contentType === contentTypes.article) {
          url = `/article/${contentId}/credit/kcb`;
        } else if(contentType === contentTypes.comment) {
          url = `/comment/${contentId}/credit/kcb`;
        }
      }
      const body = {
        num: creditType === creditTypes.xsf? xsfNumber: Math.round(kcbNumber * 100),
        description: reason,
      };
      this.submitting = true;
      return nkcAPI(url, 'POST', body)
        .then(() => {
          sweetSuccess('提交成功');
          self.close();
          self.submitting = false;
          self.reset();
        })
        .catch(err => {
          sweetError(err);
          self.submitting = false;
        });
    }
  }
}
</script>
