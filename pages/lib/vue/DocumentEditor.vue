<template lang="pug">
  .document-editor
    common-modal(ref="commonModal")
    .form
      .form-group(v-if="formConfigs.title")
        input.form-control.form-title(type="text" v-model="title" placeholder="请输入标题")
      .form-group
        editor(:configs="editorConfigs" ref="editor" @content-change="watchContentChange" :plugs="editorPlugs")
      .form-group(v-if="formConfigs.cover")
        .m-b-2
          .editor-header 封面图
            small （如未指定，默认从内容中选取）
          .editor-cover
            resource-selector(ref="resource")
            image-selector(ref="image")
            .editor-cover-default(v-if="!coverLink" @click="selectCover")
              .fa.fa-plus
            div(v-else)
              .editor-cover-img
                img(:src="coverLink")
              .m-t-05
                button.btn.btn-default.btn-sm(@click="selectCover") 重新选择
                button.btn.btn-default.btn-sm(@click="removeCover") 删除
      .form-group(v-if="formConfigs.abstract || formConfigs.abstractEN")
        .m-b-2
          .editor-header 摘要
            small （选填）
          .row.editor-abstract
            .col-xs-12.col-md-6(v-if="formConfigs.abstract")
              textarea(placeholder="中文摘要，最多可输入1000字符" rows=7 v-model.trim="abstract")
              .editor-abstract-info(:class="{'warning': abstractCnLength > 1000}") {{abstractCnLength}} / 1000
            .col-xs-12.col-md-6(v-if="formConfigs.abstractEN")
              textarea(placeholder="英文摘要，最多可输入1000字符" rows=7 v-model.trim="abstractEN")
              .editor-abstract-info(:class="{'warning': abstractEnLength > 1000}") {{abstractEnLength}} / 1000
      .form-group(v-if="formConfigs.keywords || formConfigs.keywordsEN")
        .m-b-2
          .editor-header 关键词
            small （选填，最多可添加50个，当前已添加
              span(v-if="keywordsLength <= 50") {{keywordsLength}}
              b.warning(v-else) {{keywordsLength}}
              |个）
          .editor-keywords
            .editor-keyword(v-for="(k, index) in keywords" v-if="formConfigs.keywords")
              span {{k}}
              .fa.fa-remove.p-l-05(@click="removeKeyword(index, keywords)")
            .editor-keyword(v-for="(k, index) in keywordsEN" v-if="formConfigs.keywordsEN")
              span {{k}}
              .fa.fa-remove.p-l-05(@click="removeKeyword(index, keywordsEN)")
            button.btn.btn-default.btn-sm(@click="addKeyword") 添加
      .form-group(v-if="formConfigs.origin")
        .m-b-2
          .editor-header 原创
            small （字数小于{{originalWordLimit}}的文章无法声明原创）
          .editor-origin-state.form-inline
            select.form-control(
              v-model="originState"
              :disabled="!allowedOriginal"
              :title="!allowedOriginal?'字数小于' + originalWordLimit + '的文章不可申明原创': ''"
            )
              option(v-for="(text, index) in originLevel" :value="index") {{text}}

</template>

<style lang="less" scoped>
.document-editor {
  .form {
    .form-title{
      height: 5rem;
      padding: 0;
      font-size: 2rem;
      box-shadow: none;
      border: none;
      border-bottom: 1px solid #f4f4f4;
      &:focus{
        outline: none;
      }
    }
    .form-group {
      .editor-header {
        font-size: 1.25rem;
        margin: 0.3rem 0;
        color: #555;
        font-weight: 700;
        small {
          color: #88919d;
        }
      }
      .editor-keywords {
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
        .editor-keyword {
          .fa {
            cursor: pointer;
          }
        }
      }
      .editor-cover {
        .editor-cover-default {
          .fa {
            height: 12rem;
            cursor: pointer;
            width: 18rem;
            line-height: 12rem;
            text-align: center;
            color: #aaa;
            font-size: 1.5rem;
            background-color: #eee;
          }
        }
        div {
          .editor-cover-img {
            height: 12rem;
            width: 18rem;
            img {
              height: 100%;
            }
          }
        }
      }
      .editor-abstract {
        textarea:focus{
          outline: none;
        }
        textarea{
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 3px;
          resize: none;
          padding: 0.5rem;
        }
        .editor-abstract-info {
          text-align: right;
          font-size: 1.2rem;
          color: #9baec8;
        }
      }
    }
  }
}
</style>


<script>
import Editor from './Editor';
import ResourceSelector from "./ResourceSelector";
import ImageSelector from "./ImageSelector";
import CommonModal from './CommonModal'
import {getUrl} from "../js/tools";
import {blobToFile, fileToBase64} from "../js/file";
import {getLength} from "../js/checkData";
import {getDocumentEditorConfigs} from "../js/editor";
import {debounce} from '../js/execution';
export default {
  props: ['configs'],
  data: () => ({
    title: '',
    cover: "",
    // 新选择的封面图的本地路径
    coverUrl: "",
    coverFile: "",
    abstract: "", // 中文摘要
    abstractEN: "", // 英文摘要
    keywords: [], // 中文关键词
    keywordsEN: [], // 英文关键词
    originalWordLimit: 500,
    originState: 0, // 原创声明
    contentLength: 0,
    originLevel: [
      "不声明",
      "普通转载",
      "获授权转载",
      "受权发表(包括投稿)",
      "发表人参与原创(翻译)",
      "发表人是合作者之一",
      "发表人本人原创"
    ],
    editorPlugs: {
      resourceSelector: true
    },
    defaultFormConfigs: {
      keywords: false,
      keywordsEN: false,
      abstract: false,
      abstractEN: false,
      origin: false,
      cover: false,
      title: false,
    },
    // 是否允许触发contentChange
    contentChangeEventFlag: false,
  }),
  watch: {
    title() {
      this.watchContentChange();
    },
    coverFile() {
      this.watchContentChange();
    },
    abstract() {
      this.watchContentChange();
    },
    abstractEN() {
      this.watchContentChange();
    },
    keywords() {
      this.watchContentChange();
    },
    keywordsEN() {
      this.watchContentChange();
    },
    originState() {
      this.watchContentChange();
    },
  },
  computed: {
    coverLink() {
      if(this.coverUrl) {
        return this.coverUrl;
      } else if(this.cover) {
        return getUrl('documentCover', this.cover);
      } else {
        return '';
      }
    },
    // 摘要的字节数
    abstractCnLength() {
      return this.getLength(this.abstract);
    },
    abstractEnLength() {
      return this.getLength(this.abstractEN);
    },
    // 关键词字数
    keywordsLength() {
      return this.keywordsEN.length + this.keywords.length;
    },
    // 是否能够申明原创
    allowedOriginal() {
      return this.contentLength >= this.originalWordLimit;
    },
    editorConfigs() {
      return getDocumentEditorConfigs();
    },
    formConfigs() {
      const {configs = {}, defaultFormConfigs} = this;
      return Object.assign({}, defaultFormConfigs, configs);
    },
  },
  components: {
    'editor': Editor,
    'resource-selector': ResourceSelector,
    'image-selector': ImageSelector,
    'common-modal': CommonModal,
  },
  methods: {
    getLength: getLength,
    getUrl: getUrl,
    // 移除关键词
    removeKeyword: function(index, arr) {
      arr.splice(index, 1);
    },
    // 添加关键词，借助commonModal模块
    addKeyword() {
      let self = this;
      let keywords, keywordsEN;
      keywords = this.formConfigs.keywords?{
          type: 'keywords',
          label: "中文，添加多个请以逗号分隔",
          dom: "textarea",
          value: this.keywords.join("，")
        }:null;
      keywordsEN = this.formConfigs.keywordsEN?{
          type: 'keywordsEN',
          label: "英文，添加多个请以逗号分隔",
          dom: "textarea",
          value: this.keywordsEN.join(",")
        }:null;
      let data = [keywords, keywordsEN];
      data = data.filter(n => n);
      this.$refs.commonModal.open(function(data) {
        let cnArr,enArr;
        for(const keyword of data) {
          if(keyword.type === 'keywords') {
            self.keywords = [];
            let keywordCN = keyword.value;
            keywordCN = keywordCN.replace(/，/ig, ",");
            cnArr = keywordCN.split(",");
            for(let i = 0; i < cnArr.length; i++) {
              let cn = cnArr[i];
              cn = cn.trim();
              if(cn && self.keywords.indexOf(cn) === -1) {
                self.keywords.push(cn);
              }
            }
          }
          if(keyword.type === 'keywordsEN') {
            self.keywordsEN = [];
            let keywordEn = keyword.value;
            keywordEn = keywordEn.replace(/，/ig, ",");
            enArr = keywordEn.split(",");
            for(let i = 0; i < enArr.length; i++) {
              let en = enArr[i];
              en = en.trim();
              if(en && self.keywordsEN.indexOf(en) === -1) {
                self.keywordsEN.push(en);
              }
            }
          }
        }
        self.$refs.commonModal.close();
      }, {
        data,
        title: "添加关键词"
      });
    },
    //选择封面图
    selectCover() {
      let self = this;
      self.$refs.resource.open(function(data) {
        let r = data.resources[0];
        let url;
        if(r.originId) {
          url = "/ro/" + r.originId;
        } else {
          url = "/r/" + r.rid;
        }
        self.$refs.image.open({aspectRatio: 3/2, url: url})
          .then(res => {
            const file = blobToFile(res, 'cover.png');
            return fileToBase64(file)
              .then(base64 => {
                self.coverFile = file;
                self.coverUrl = base64;
                self.$refs.image.close();
              })
          })
          .catch(err => {
            console.log(err);
          })
      }, {
        allowedExt: ["picture"],
        countLimit: 1
      });
    },
    removeCover() {
      this.cover = "";
      this.coverFile = "";
      this.coverUrl = "";
    },
    resetCover(coverId) {
      this.coverFile = '';
      this.coverUrl = '';
      this.cover = coverId;
    },
    //移除编辑器事件
    removeNoticeEvent() {
      this.$refs.editor.removeNoticeEvent();
    },
    updateContentLength() {
      const content = this.$refs.editor.getContentTxt();
      this.contentLength = content.length;
    },
    getDocumentForm() {
      const {
        title,
        cover,
        coverFile,
        abstract,
        abstractEN,
        keywords,
        keywordsEN,
        originState,
        formConfigs
      } = this;
      const data = {
        content: this.$refs.editor.getContent(),
      };
      if(formConfigs.cover) {
        data.coverFile = coverFile || null;
        data.cover = cover || '';
      }
      if(formConfigs.abstract) data.abstract = abstract;
      if(formConfigs.abstractEN) data.abstractEN = abstractEN;
      if(formConfigs.keywords) data.keywords = keywords;
      if(formConfigs.keywordsEN) data.keywordsEN = keywordsEN;
      if(formConfigs.originState) data.originState = originState;
      if(formConfigs.title) data.title = title;
      return data;
    },
    initDocumentForm(data) {
      const {
        title = '',
        content = '',
        cover = ''
      } = data;
      this.title = title;
      this.$refs.editor.setContent(content);
      this.cover = cover;
    },
    emitContentChangeEvent() {
      const data = this.getDocumentForm();
      this.$emit('content-change', data);
    },
    // 监听内容输入
    watchContentChange: debounce(function() {
      if(!this.contentChangeEventFlag) {
        this.contentChangeEventFlag = true;
        return;
      }
      this.updateContentLength();
      this.emitContentChangeEvent();
    }, 500),
  }
}
</script>
