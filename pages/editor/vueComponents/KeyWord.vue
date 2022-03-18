<template lang="pug">
.key-word
  .editor-header 关键词
    small （选填，最多可添加50个，当前已添加
      span(v-if="keywordsLength <= 50") {{keywordsLength}}
      b.warning(v-else) {{keywordsLength}}
      |个）
  .editor-keywords
    .editor-keyword(v-for="(k, index) in keyWordsCn")
      span {{k}}
      .fa.fa-remove.p-l-05(@click="removeKeyword(index, keyWordsCn)")
    .editor-keyword(v-for="(k, index) in keyWordsEn")
      span {{k}}
      .fa.fa-remove.p-l-05(@click="removeKeyword(index, keyWordsEn)")
    button.btn.btn-default.btn-sm(@click="addKeyword") 添加
</template>

<script>

export default {
  data: () => ({
    keyWordsCn: [], // 中文关键词
    keyWordsEn: [] // 英文关键词
  }),
  props: {
    post: {
      type: Object,
      require: true,
      default:()=> ({})
    }
  },
  created() {
    // this.keyWordsCn = post.keyWordsCn;
  },
  methods: {
    removeKeyword(index, arr) {
      arr.splice(index, 1);
    },
    addKeyword() {
      if (!NKC.modules.CommonModal) {
        return sweetError("未引入表单模块");
      }
      if (!window.CommonModal) {
        window.CommonModal = new NKC.modules.CommonModal();
      }
      CommonModal.open(
        data => {
          this.keyWordsEn = [];
          this.keyWordsCn = [];
          let keywordCn = data[0].value;
          let keywordEn = data[1].value;
          keywordCn = keywordCn.replace(/，/gi, ",");
          keywordEn = keywordEn.replace(/，/gi, ",");
          let cnArr = keywordCn.split(",");
          let enArr = keywordEn.split(",");
          for (let i = 0; i < cnArr.length; i++) {
            let cn = cnArr[i];
            cn = cn.trim();
            if (cn && this.keyWordsCn.indexOf(cn) === -1) {
              this.keyWordsCn.push(cn);
            }
          }
          for (let i = 0; i < enArr.length; i++) {
            let en = enArr[i];
            en = en.trim();
            if (en && this.keyWordsEn.indexOf(en) === -1) {
              this.keyWordsEn.push(en);
            }
          }
          if (!cnArr.length && !enArr.length) return sweetError("请输入关键词");
          CommonModal.close();
        },
        {
          data: [
            {
              label: "中文，添加多个请以逗号分隔",
              dom: "textarea",
              value: this.keyWordsCn.join("，")
            },
            {
              label: "英文，添加多个请以逗号分隔",
              dom: "textarea",
              value: this.keyWordsEn.join(",")
            }
          ],
          title: "添加关键词"
        }
      );
    },
    getData(){
      return {
        keyWordsEn: this.keyWordsEn,
        keyWordsCn: this.keyWordsCn,

      }
    }
  },
  computed: {
    keywordsLength: function() {
      return this.keyWordsEn.length + this.keyWordsCn.length;
    }
  }
};
</script>

<style></style>
