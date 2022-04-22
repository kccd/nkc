<template lang="pug">
  .document-editor
    common-modal(ref="commonModal")
    .form
      .form-group(v-if="formConfigs.title")
        input.form-control.form-title(type="text" v-model="title" placeholder="请输入标题")
      .form-group

        editor(:configs="editorConfigs" ref="editor" @content-change="watchContentChange" :plugs="editorPlugs" @ready="editorReady")
      .form-group(v-if="formConfigs.cover")
        .m-b-2
          .editor-header 封面图
            //small （如未指定，默认从内容中选取）
          .editor-cover
            resource-selector(ref="resourceSelector")
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
          .row.editor-abstract.clear-marginR
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
      .form-group(v-if="formConfigs.authorInfos")
        .m-b-2
          .editor-header 作者信息
            small （选填，信息将公开显示）
          .editor-authors
            .table-responsive(v-if="authorInfos.length")
              table.table-condensed.table
                thead
                  tr
                    th
                    th 姓名
                    th {{websiteUserId + "(选填)"}}
                    th 机构名称(选填)
                    th 机构地址(选填)
                    th 通信作者
                tbody.editor-author(v-for="(a, index) in authorInfos")
                  tr
                    th
                      .fa.fa-trash(@click="removeAuthor(index, authorInfos)" title="删除")
                      .fa.fa-chevron-up(@click="moveAuthor(index, 'up', authorInfos)" title="上移")
                      .fa.fa-chevron-down(@click="moveAuthor(index, 'down', authorInfos)" title="下移")
                    th
                      input.author-name(type="text" v-model.trim="a.name")
                    th
                      input.author-id(type="text" v-model.trim="a.kcid")
                    th
                      input(type="text" v-model.tirm="a.agency")
                    th
                      input(type="text" v-model.trim="a.agencyAdd")
                    th
                      .checkbox
                        label
                          input(type="checkbox" :value="true" v-model="a.isContract")
                  tr(v-if="a.isContract").contract-info
                    th(colspan="6")
                      h5 以下信息仅登录用户可见
                      .display-i-b.m-b-05
                        span 邮箱
                        input(type="text" v-model.trim="a.contractObj.contractEmail" placeholder="必填")
                      .display-i-b.m-b-05
                        span &nbsp;电话
                        input(type="text" v-model.trim="a.contractObj.contractTel" placeholder="选填")
                      .display-i-b.m-b-05
                        span &nbsp;地址
                        input(type="text" v-model.trim="a.contractObj.contractAdd" placeholder="选填")
                      .display-i-b.m-b-05
                        span &nbsp;邮政编码
                        input.author-name(type="text" v-model.trim="a.contractObj.contractCode" placeholder="选填")
            button.btn.btn-default.btn-sm(@click="addAuthor") 添加
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
@import "../../publicModules/base.less";
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
      .editor-authors {
        color: #88919d;
        .editor-author input:focus{
          outline: none;
        }
        .editor-author input{
          height: 2.5rem;
          padding: 0.5rem;
          border: 1px solid #d8d8d8;
          border-radius: 3px;
        }
        .editor-author .author-name{
          width: 6rem;
        }
        .editor-author .author-id{
          width: 6rem;
        }
        .editor-authors thead{
          color: #88919d;
        }
        .contract-info{
          background-color: #f4f4f4;
        }
        .editor-author .fa:hover{
          color: #8c8c8c;
        }
        .editor-author .fa{
          font-size: 1.3rem;
          height: 2rem;
          width: 2rem;
          line-height: 2rem;
          cursor: pointer;
          color: #adadad;
          text-align: center;
        }
        .contract-info h5{
          color: #9baec8;
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
import {getState} from "../js/state";
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

    authorInfos: [], // 作者信息

    originalWordLimit: 500,
    originState: 0, // 原创声明
    contentLength: 0,
    websiteUserId: (getState().websiteCode).toUpperCase() + "ID",
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
      authorInfos: false,
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
    authorInfos: {
      deep: true,
      handler(newValue, oldValue) {
        this.watchContentChange();
      },
    }
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
  mounted() {
  },
  methods: {
    getState: getState,
    getLength: getLength,
    getUrl: getUrl,
    setSavedStatus(type) {
      this.$refs.editor.changeSaveInfo(type);
    },
    //编辑器准备完成填入数据
    editorReady() {
      this.$emit('ready');
    },
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
    // 上/下移动作者信息
    moveAuthor: function(index, type) {
      let authorInfos = this.authorInfos;
      let otherIndex;
      if(type === "up") {
        if(index === 0) return;
        otherIndex = index - 1;
      } else {
        if((index + 1) === authorInfos.length) return;
        otherIndex = index + 1;
      }
      let info = authorInfos[index];
      authorInfos[index] = authorInfos[otherIndex];
      authorInfos[otherIndex] = info;
      Vue.set(authorInfos, 0, authorInfos[0]);
    },
    // 移除作者信息
    removeAuthor: function(index, arr) {
      sweetQuestion("确定要删除该条作者信息？")
        .then(function() {
          arr.splice(index, 1);
        })
        .catch(function(){})
    },
    // 添加作者信息
    addAuthor: function() {
      let authorInfos = this.authorInfos;
      authorInfos.push({
        name: "",
        kcid: "",
        agency: "",
        agencyCountry: "",
        agencyAdd: "",
        isContract: false,
        contractObj: {
          contractEmail: "",
          contractTel: "",
          contractAdd: "",
          contractCode: ""
        }
      });
    },
    //选择封面图
    selectCover() {
      let self = this;
      self.$refs.resourceSelector.open(function(data) {
        //关闭资源弹框
        self.$refs.resourceSelector.close();
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
                //关闭弹框
                self.$refs.image.close();
              })
          })
          .catch(err => {
            sweetError(err);
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
      this.emitContentChangeEvent();
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
        formConfigs,
        authorInfos
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
      if(formConfigs.origin) data.originState = originState;
      if(formConfigs.title) data.title = title;
      if(formConfigs.authorInfos) data.authorInfos = authorInfos;
      return data;
    },
    initDocumentForm(data) {
      const {
        title = '',
        content = '',
        cover = '',
        keywords= '',
        keywordsEN = '',
        abstract = '',
        abstractEN = '',
        origin = '',
        authorInfos= [],
      } = data;
      this.title = title;
      if(content) {
        this.$refs.editor.setContent(content);
      }
      this.cover = cover;
      this.keywords = keywords;
      this.keywordsEN = keywordsEN;
      this.abstract = abstract;
      this.abstract = abstract;
      this.abstractEN = abstractEN;
      this.originState = origin;
      this.authorInfos = authorInfos;
    },
    emitContentChangeEvent() {
      const data = this.getDocumentForm();
      this.$emit('content-change', data);
    },
    // 监听内容输入
    watchContentChange: debounce(function() {
      this.updateContentLength();
      this.emitContentChangeEvent();
    }, 500),
  }
}
</script>
