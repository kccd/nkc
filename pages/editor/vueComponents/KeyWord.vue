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

  .modal.fade(v-if="showModel")
    .modal-dialog.modal-sm
      .modal-content
        .modal-header
          .fa.fa-remove(@click="close")
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
            a(data-dismiss="modal", @click="close") 关闭
            a.active(@click="submit") 确定
</template>

<script>
export default {
  data: () => ({
    title: "添加关键词",
    info: "",
    quote: "",
    data: [
      {
        label: "中文，添加多个请以逗号分隔",
        dom: "textarea",
        value: ""
      },
      {
        label: "英文，添加多个请以逗号分隔",
        dom: "textarea",
        value: ""
      }
    ],
    showModel: false,
    keyWordsCn: [], // 中文关键词
    keyWordsEn: [] // 英文关键词
  }),
  props: {
    keywords: {
      type: Object,
      require: true,
      default: () => ({})
    }
  },
  watch: {
    keywords(n, o) {
      this.$set(this.data[0], "value", (n.cn && n.cn.join(",")) || "");
      this.$set(this.data[1], "value", (n.en && n.en.join(",")) || "");
      this.submit();
    }
  },
  methods: {
    close() {
      this.showModel = false;
      this.data = [
        {
          label: "中文，添加多个请以逗号分隔",
          dom: "textarea",
          value: ""
        },
        {
          label: "英文，添加多个请以逗号分隔",
          dom: "textarea",
          value: ""
        }
      ];
    },
    open() {
      this.showModel = true;
      // this.$forcedUpdate()
    },
    submit() {
      this.keyWordsEn = [];
      this.keyWordsCn = [];
      let keywordCn = this.data[0].value;
      if (keywordCn) {
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
    pickedFile: function(index) {
      var dom = this.$refs["input" + index][0];
      this.data[index].value = dom.files[0];
    },
    removeKeyword(index, arr) {
      arr.splice(index, 1);
    },
    addKeyword() {
      this.open();
    },
    update() {},
    getData() {
      return {
        keyWordsEn: this.keyWordsEn,
        keyWordsCn: this.keyWordsCn
      };
    }
  },
  computed: {
    keywordsLength: function() {
      return this.keyWordsEn.length + this.keyWordsCn.length;
    }
  }
};
</script>

<style scoped lang="less">
.fa-remove {
  float: right;
  padding: 1rem;
}

.modal-footer {
  border-top: 0;
}
.modal-header {
  padding: 0;
}

.modal-title {
  text-align: center;
  height: 5rem;
  color: #282c37;
  font-weight: 700;
  line-height: 5rem;
  font-size: 1.3rem;
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
  margin: 0 0.5rem 0.5rem 0;
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
</style>
