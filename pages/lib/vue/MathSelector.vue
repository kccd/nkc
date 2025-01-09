<template>
  <draggable-dialog
    ref="dialog"
    title="LaTeX 数学公式预览"
    width="43rem"
    height="34.5rem"
    heightXS="70%"
  >
    <div style="background-color: #fff; height: 100%">
      <!-- 阻止一些事件，避免在输入公式内容时触发tiptap编辑器的相关事件而导致闪动 -->
      <div
        class="math-selector-input-container"
        @mousedown.stop="noneFunc"
        @focus.stop="noneFunc"
        @mouseup.stop="noneFunc"
        @click.stop="noneFunc"
      >
        <div class="text-info bg-info p-a-05">
          <span class="fa fa-lightbulb-o m-r-05"></span>
          您还可以在正文中直接输入 LaTeX 公式：行内公式用 $...$，独立公式用
          $$...$$。
        </div>
        <div>输入公式：</div>
        <textarea
          class="form-control"
          rows="4"
          style="resize: none"
          v-model="text"
        ></textarea>
      </div>
      <div class="math-selector-preview-container">
        <div class="text-left">预览：</div>
        <div :key="text" ref="mathContainer">{{ formula }}</div>
      </div>
      <div class="math-selector-block-container">
        <div class="math-selector-block-container-radio">
          <div class="m-r-1">
            <input type="radio" v-model="block" :value="false" />
            <span @click="block = false">行内显示</span>
          </div>
          <div>
            <input type="radio" v-model="block" :value="true" />
            <span @click="block = true">独行显示</span>
          </div>
        </div>
      </div>
      <div class="math-selector-button-container hidden-xs text-right">
        <button class="btn btn-default btn-sm" @click="close">取消</button>
        <button class="btn btn-primary btn-sm" @click="confirm">确定</button>
      </div>
      <div
        class="math-selector-button-container math-selector-button-container-xs hidden-sm hidden-md hidden-lg"
      >
        <button class="btn btn-primary btn-block" @click="confirm">确定</button>
      </div>
    </div>
  </draggable-dialog>
</template>

<script>
import DraggableDialog from './DraggableDialog/DraggableDialog.vue';
export default {
  components: {
    'draggable-dialog': DraggableDialog,
  },
  data() {
    return {
      text: '',
      block: false,
      callback: null,
    };
  },
  methods: {
    noneFunc() {},
    open(callback, options) {
      options = options || {};
      this.text = options.text || '';
      this.block = options.block || false;
      this.callback = callback;
      this.renderPreviewHTML();
      this.$refs.dialog.open();
    },
    close() {
      this.$refs.dialog.close();
    },
    confirm() {
      if (!this.callback || !this.text) return;
      this.callback({
        text: this.text,
        block: this.block,
      });
      this.close();
    },
    renderPreviewHTML() {
      window.MathJax.typeset([this.$refs.mathContainer]);
    },
  },
  computed: {
    formula() {
      if (!this.text) {
        return '';
      } else if (this.block) {
        return `$$${this.text}$$`;
      } else {
        return `$${this.text}$`;
      }
    },
  },
  watch: {
    formula() {
      setTimeout(() => {
        this.renderPreviewHTML();
      }, 10);
    },
  },
};
</script>

<style scoped lang="less">
.math-selector-input-container {
  padding: 1rem 1rem 0 1rem;
  margin-bottom: 1rem;
  line-height: initial;
  div {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
}
.math-selector-block-container {
  padding: 0 1rem;
  margin-bottom: 1rem;
  line-height: initial;
  label:first-child {
    margin-right: 1rem;
  }
}
.math-selector-preview-container {
  padding: 0 1rem;
  text-align: center;
  margin-bottom: 1rem;
  line-height: initial;
  div:first-child {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  div:last-child {
    height: 8rem;
    border: 3px dotted #9baec8;
    margin: auto;
    border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.math-selector-button-container {
  padding: 0 1rem;
}
.math-selector-button-container-xs {
  display: flex;
}
span {
  font-size: 1rem;
}
.math-selector-block-container-radio {
  user-select: none;
  display: flex;
  & > div {
    display: flex;
    align-items: center;
    justify-content: center;
    input {
      margin-right: 0.5rem;
    }
  }
}
</style>
