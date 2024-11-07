<template>
  <draggable-dialog ref="dialog" title="LaTeX 数学公式编辑器" width="43rem" height="34.5rem" heightXS="70%">
    <div style='background-color: #fff;height: 100%;'>
      <div class="math-selector-input-container">
        <div>输入公式：</div>
        <textarea class='form-control' rows='4' resize="none" v-model="text"></textarea>
      </div>
      <div class="math-selector-preview-container">
        <div>预览：</div>
        <div v-html="previewHTML"></div>
      </div>
      <div class="math-selector-block-container">
        <div class="math-selector-block-container-radio">
          <div class="m-r-1">
            <input type="radio" v-model="block" :value="false">
            <span @click="block = false">行内显示</span>
          </div>
          <div>
            <input type="radio" v-model="block" :value="true">
            <span @click="block = true">独行显示</span>
          </div>
        </div>
      </div>
      <div class="math-selector-button-container hidden-xs text-right">
        <button class='btn btn-default btn-sm' @click="close">取消</button>
        <button class='btn btn-primary btn-sm' @click="confirm">确定</button>
      </div>
      <div class="math-selector-button-container math-selector-button-container-xs hidden-sm hidden-md hidden-lg">
        <button class='btn btn-primary btn-block' @click="confirm">确定</button>
      </div>
    </div>
  </draggable-dialog>
</template>

<script>
import DraggableDialog from './DraggableDialog/DraggableDialog.vue'
export default {
  components: {
    'draggable-dialog': DraggableDialog
  },
  data() {
    return {
      text: '',
      block: false,
      callback: null,
      previewHTML: '',
    }
  },
  methods: {
    open(callback, options) {
      options = options || {};
      this.text = options.text || '';
      this.block = options.block || false;
      this.callback = callback;
      this.$refs.dialog.open();
    },
    close() {
      this.$refs.dialog.close();
    },
    confirm() {
      if(!this.callback || !this.text) return;
      this.callback({
        text: this.text,
        block: this.block,
      });
      this.close();
    },
    renderPreviewHTML() {
      MathJax.startup.promise
        .then(() => {
          return MathJax.tex2chtmlPromise(this.text, {
            display: true,
          })
        })
        .then(html => {
          this.previewHTML = html.outerHTML;
        });
    }
  },
  mounted() {
    this.renderPreviewHTML();

  },
  watch: {
    text() {
      this.renderPreviewHTML();
    }
  },
}
</script>

<style scoped lang='less'>
.math-selector-input-container{
  padding: 1rem 1rem 0 1rem;
  margin-bottom: 1rem;
  line-height: initial;
  div{
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
}
.math-selector-block-container{
  padding: 0 1rem;
  margin-bottom: 1rem;
  line-height: initial;
  label:first-child{
    margin-right: 1rem;
  }
}
.math-selector-preview-container{
  padding: 0 1rem;
  margin-bottom: 1rem;
  line-height: initial;
  div:first-child{
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  div:last-child{
    height: 11rem;
    border: 3px dotted #9baec8;
    margin: auto;
    border-radius: 3px;
  }
}
.math-selector-button-container{
  padding: 0 1rem;
}
.math-selector-button-container-xs{
  display: flex;
}
span{
  font-size: 1rem;
}
.math-selector-block-container-radio{
  user-select: none;
  display: flex;
  &>div{
    display: flex;
    align-items: center;
    justify-content: center;
    input{
      margin-right: 0.5rem;
    }
  }
}
</style>