<template lang="pug">
.key-word
  .editor-header 关键词
    small （选填，最多可添加50个，当前已添加
      span(v-if="keywordsLength <= 50") {{ keywordsLength }}
      b.warning(v-else) {{ keywordsLength }}
      | 个）
  .editor-keywords
    .editor-keyword(v-for="(k, index) in keyWordsCn")
      span {{ k }}
      .fa.fa-remove.p-l-05(@click="removeKeyword(index, keyWordsCn)")
    .editor-keyword(v-for="(k, index) in keyWordsEn")
      span {{ k }}
      .fa.fa-remove.p-l-05(@click="removeKeyword(index, keyWordsEn)")
    button.btn.btn-default.btn-sm(@click="addKeyword") 添加

  //- .modal.fade(v-if="showModel", )
  //-   .modal-dialog.modal-sm
  .modal-key-word(ref="model" v-show="showModel")
    .modal-header(ref="addKeyword")
      .fa.fa-remove.close-modal(@click="close")
      .modal-title {{ title }}
      .quote-content(v-if="quote") {{ quote }}
    .modal-body
      .form
        .form-group(v-for="(d, index) in data")
          h5(v-if="d.label") {{ d.label }}
          //- 数字input
          input.form-control(
            v-if="d.dom === 'input' && d.type === 'number' && d.type !== 'file'",
            :type="d.type || 'text'",
            v-model.number="d.value",
            :placeholder="d.placeholder || ''",
            @keyup.enter="submit"
          )
          //- 非数字input
          input.form-control(
            v-if="d.dom === 'input' && d.type !== 'number' && d.type !== 'file'",
            :type="d.type || 'text'",
            v-model="d.value",
            :placeholder="d.placeholder || ''",
            @keyup.enter="submit"
          )
          //- 文件input
          input.form-control(
            v-if="d.dom === 'input' && d.type === 'file'",
            type="file",
            @change="pickedFile(index)",
            @keyup.enter="submit",
            :ref="'input' + index",
            :accept="d.accept"
          )
          //- 文本框
          textarea.form-control(
            v-if="d.dom === 'textarea'",
            v-model="d.value",
            :placeholder="d.placeholder || ''",
            :rows="d.rows || 4",
            @keyup.enter="!d.disabledKeyup ? submit : ';'"
          )
          //- 单选
          .radio(v-if="d.dom === 'radio'")
            label.m-r-05(v-for="r in d.radios")
              input(type="radio", :value="r.value", v-model="d.value")
              span {{ r.name }}
          .checkbox(v-if="d.dom === 'checkbox'")
            label.m-r-05(v-for="r in d.checkboxes")
              input(
                type="checkbox",
                :value="r._id",
                name="checkboxes",
                v-model="d.value"
              )
              span {{ r.name }}
    .modal-footer
      .options-button
        button.btn.btn-default.keyword-btn-close(
          data-dismiss="modal",
          @click="close"
        ) 关闭
        button.btn.active.btn-primary.keyword-btn-determine(@click="submit") 确定
</template>

<script>
import { DraggableElement } from "../../lib/js/draggable";
import { debounce } from '../../lib/js/execution';

export default {
  data: () => ({
    title: "添加关键词",
    info: "",
    quote: "",
    data: [
      {
        label: "中文，添加多个请以逗号分隔",
        dom: "textarea",
        value: "",
      },
      {
        label: "英文，添加多个请以逗号分隔",
        dom: "textarea",
        value: "",
      },
    ],
    showModel: false,
    keyWordsCn: [], // 中文关键词
    keyWordsEn: [], // 英文关键词
    draggableElement: {},
    changeContentDebounce: '',
  }),
  props: {
    keywords: {
      type: Object,
      require: true,
      default: () => ({}),
    },
  },
  watch: {
    keywords: {
      immediate: true,
      handler(n) {
        if (typeof n !== "undefined") {
          this.$set(this.data[0], "value", (n.cn && n.cn.join(",")) || "");
          this.$set(this.data[1], "value", (n.en && n.en.join(",")) || "");
          this.submit();
        }
      },
    },
    keyWordsWatch: {
      deep: true,
      handler() {
        this.changeContentDebounce()
      }
    },
  },
  created(){
    this.changeContentDebounce = debounce(this.changeContent, 2000);
  },
  mounted(){
    this.draggableElement = new DraggableElement(
      this.$refs.model,
      this.$refs.addKeyword
    );
    this.draggableElement.setPositionCenter()
    
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  methods: {
    changeContent() {
      this.$emit('info-change');
    },
    close() {
      this.showModel = false;
    },
    open() {
      this.showModel = true;
    },
    submit() {
      let keywordCn = this.data[0].value;
      if (keywordCn) {
        this.keyWordsCn = [];
        keywordCn = keywordCn.replace(/，/gi, ",");
        let cnArr = keywordCn.split(",");
        for (let i = 0; i < cnArr.length; i++) {
          let cn = cnArr[i];
          cn = cn.trim();
          if (cn && this.keyWordsCn.indexOf(cn) === -1) {
            this.keyWordsCn.push(cn);
          }
        }
        if (!cnArr.length) return sweetError("请输入关键词");
      }

      let keywordEn = this.data[1].value;
      if (keywordEn) {
        this.keyWordsEn = [];
        keywordEn = keywordEn.replace(/，/gi, ",");
        let enArr = keywordEn.split(",");
        for (let i = 0; i < enArr.length; i++) {
          let en = enArr[i];
          en = en.trim();
          if (en && this.keyWordsEn.indexOf(en) === -1) {
            this.keyWordsEn.push(en);
          }
        }
        if (!enArr.length) return sweetError("请输入关键词");
      }

      this.close();
    },
    pickedFile: function (index) {
      var dom = this.$refs["input" + index][0];
      this.data[index].value = dom.files[0];
    },
    removeKeyword(index, arr) {
      arr.splice(index, 1);
      this.$set(this.data[index], "value", "");
      },
    addKeyword() {
      this.open();
    },
    update() {},
    getData() {
      return {
        keyWordsEn: this.keyWordsEn,
        keyWordsCn: this.keyWordsCn,
      };
    },
  },
  computed: {
    keyWordsWatch() {
      return {
        cn: this.keyWordsCn,
        en: this.keyWordsEn
      }
    },
    keywordsLength: function () {
      return this.keyWordsEn.length + this.keyWordsCn.length;
    },
  },
};
</script>

<style scoped lang="less">
.keyword-btn-close {
  margin-right: 0.8rem;
}
.keyword-btn-determine {
  margin-left: 0;
}
.modal-body {
    position: relative;
    padding: 15px;
}
.key-word .modal-key-word{
  position: fixed;
  top: 20%;
  min-width: 25rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  box-shadow: 0 0 5px rgba(0,0,0,.2);
  background: white;
}
textarea {
  margin: 0;
  font: inherit;
  overflow: auto;
  font-family: inherit;
}
.form-control {
  display: block;
  width: 100%;
  height: 34px;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
  box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
  -webkit-transition: border-color ease-in-out 0.15s,
    -webkit-box-shadow ease-in-out 0.15s;
  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}
textarea.form-control {
  height: auto;
}
h5 {
  margin-top: 10px;
}
h5:nth-child(1) {
  margin-top: 0;
}
.btn {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
}
.btn.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
}
.btn-primary {
  color: #fff;
  background-color: #337ab7;
  border-color: #2e6da4;
}
.btn-default {
  color: #333;
  background-color: #fff;
  border-color: #ccc;
}
.close-modal {
  color: #888;
  text-align: center;
  line-height: 2.8rem;
  float: right;
  width: 2.8rem;
  height: 2.8rem;
  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
    cursor: pointer;
  }
}

.modal-footer {
  padding: 15px;
  text-align: right;
  border-top: 0;
  padding-top: 0;
}
.modal-header {
  border-bottom: 1px solid #e5e5e5;
  line-height: 2.8rem;
  color: #000;
  padding: 0;
  cursor: all-scroll;
  height: 2.8rem;
  position: relative;
  background-color: #f6f6f6;
  // padding-right: 2.8rem;
  border-radius: 6px 6px 0 0;
  user-select: none;
}
.form-group {
  margin-bottom: 15px;
}
.modal-title {
  padding-left: 0.5rem;
  float: left;
  cursor: move;
  text-align: center;
  height: 2.8rem;
  color: #282c37;
  font-weight: 700;
  line-height: 2.8rem;
  // font-size: 1.3rem;
}
.p-l-05 {
  padding-left: 0.5rem !important;
}
.modal-dialog {
  margin: 10rem auto;
}
.modal {
  display: block;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1050;
}
.fade {
  opacity: 1;
}
.editor-keyword {
  display: inline-block;
  height: 2.4rem;
  border-radius: 3px;
  padding: 0 0.5rem;
  vertical-align: top;
  background-color: #2b90d9;
  color: #fff;
  margin: 0 0.8rem 0.8rem 0;
  line-height: 2.4rem;
}
.editor-keyword .fa {
  cursor: pointer;
}
.warning {
  color: #ff6262;
}
.editor-header {
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small {
  color: #88919d;
}
.options-button {
  display: inline-block;
  padding-right: 0;
}
</style>
