<template lang="pug">
  .row.creation-center-article-editor
    common-modal(ref="commonModal")
    .col-xs-12.col-md-12
      bread-crumb(:list="navList")
    .col-xs-12.col-md-10.col-md-offset-1
      .form
        .form-group
          input.form-control(type="text" v-model="article.title")
        .form-group
          editor(:configs="editorConfigs" ref="editor" @content-change="watchContentChange" :plugs="editorPlugs")
        .form-group
          .m-b-2(v-if="['newDocument', 'modifyDocument'].indexOf(type) !== -1")
            .editor-header 封面图
              small （如未指定，默认从内容中选取）
            .editor-cover
              resource-selector(ref="resource")
              image-selector(ref="image")
              .editor-cover-default(v-if="!cover && !coverUrl" @click="selectCover")
                .fa.fa-plus
              div(v-else)
                .editor-cover-img
                  img(:src="coverUrl" v-if="coverUrl")
                  img(:src="getUrl('postCover', cover)" v-else-if="cover")
                .m-t-05
                  button.btn.btn-default.btn-sm(@click="selectCover") 重新选择
                  button.btn.btn-default.btn-sm(@click="removeCover") 删除
        .form-group
          .m-b-2(v-if="['newDocument', 'modifyDocument'].indexOf(type) !== -1")
            .editor-header 摘要
              small （选填）
            .row.editor-abstract
              .col-xs-12.col-md-6
                textarea(placeholder="中文摘要，最多可输入1000字符" rows=7 v-model.trim="abstractCn")
                .editor-abstract-info(:class="{'warning': abstractCnLength > 1000}") {{abstractCnLength}} / 1000
              .col-xs-12.col-md-6
                textarea(placeholder="英文摘要，最多可输入1000字符" rows=7 v-model.trim="abstractEn")
                .editor-abstract-info(:class="{'warning': abstractEnLength > 1000}") {{abstractEnLength}} / 1000
        .form-group
          .m-b-2(v-if="['newDocument', 'modifyDocument'].indexOf(type) !== -1")
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
        .form-group
          .m-b-2(v-if="['newDocument', 'modifyDocument'].indexOf(type) !== -1")
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
.creation-center-article-editor {
  .form {
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
  import Editor from '../../../lib/vue/Editor';
  import ResourceSelector from "../../../lib/vue/ResourceSelector";
  import ImageSelector from "../../../lib/vue/ImageSelector";
  import CommonModal from '../../../lib/vue/CommonModal'
  import {getUrl} from "../../../lib/js/tools";
  import {blobToFile, fileToBase64} from "../../../lib/js/file";
  import {getLength} from "../../../lib/js/checkData";
  import {getDocumentEditorConfigs} from "../../../lib/js/editor";
  export default {
    data: () => ({
      navList: [
        {
          name: '文档创作',
          page: 'books'
        },
        {
          name: '编辑文章',
        }
      ],
      article: {
        title: '',
        content: ''
      },
      type: 'newDocument',
      cover: "",
      // 新选择的封面图的本地路径
      coverUrl: "",
      coverData: "",
      abstractCn: "", // 中文摘要
      abstractEn: "", // 英文摘要

      keyWordsCn: [], // 中文关键词
      keyWordsEn: [], // 英文关键词
      originalWordLimit: 500 || 0,
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
      }
    }),
    computed: {
      // 摘要的字节数
      abstractCnLength() {
        return this.getLength(this.abstractCn);
      },
      abstractEnLength() {
        return this.getLength(this.abstractEn);
      },
      // 关键词字数
      keywordsLength() {
        return this.keyWordsEn.length + this.keyWordsCn.length;
      },
      // 是否能够申明原创
      allowedOriginal() {
        return this.contentLength >= this.originalWordLimit;
      },
      editorConfigs() {
        return getDocumentEditorConfigs();
      }
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
      getLength: getLength,
      getUrl: getUrl,
      // 移除关键词
      removeKeyword: function(index, arr) {
        arr.splice(index, 1);
      },
      // 添加关键词，借助commonModal模块
      addKeyword() {
        var self = this;
        this.$refs.commonModal.open(function(data) {
          self.keyWordsEn = [];
          self.keyWordsCn = [];
          var keywordCn = data[0].value;
          var keywordEn = data[1].value;
          keywordCn = keywordCn.replace(/，/ig, ",");
          keywordEn = keywordEn.replace(/，/ig, ",");
          var cnArr = keywordCn.split(",");
          var enArr = keywordEn.split(",");
          for(var i = 0; i < cnArr.length; i++) {
            var cn = cnArr[i];
            cn = cn.trim();
            if(cn && self.keyWordsCn.indexOf(cn) === -1) {
              self.keyWordsCn.push(cn);
            }
          }
          for(var i = 0; i < enArr.length; i++) {
            var en = enArr[i];
            en = en.trim();
            if(en && self.keyWordsEn.indexOf(en) === -1) {
              self.keyWordsEn.push(en);
            }
          }
          if(!cnArr.length && !enArr.length) return sweetError("请输入关键词");
          self.$refs.commonModal.close();
        }, {
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
        });
      },
      //选择封面图
      selectCover() {
        var self = this;
        self.$refs.resource.open(function(data) {
          var r = data.resources[0];
          var url;
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
              self.coverData = file;
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
        this.coverData = "";
        this.coverUrl = "";
      },
      // 监听内容输入
      watchContentChange: function() {
        const content = this.$refs.editor.getContentTxt();
        this.contentLength = content.length;
      },
    }

  }
</script>
