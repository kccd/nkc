<template lang="pug">
  .container-fluid.creation-center-article-editor
    .m-b-1
      bread-crumb(:list="navList")
    .standard-max-container
      .m-b-1
        document-editor(ref="documentEditor" :configs="formConfigs" @content-change="watchContentChange")
      .m-t-1
        button.btn.btn-primary.m-r-05(@click="publish") 发布
        button.btn.btn-default.m-r-05(@click="saveArticle") 保存
        button.btn.btn-default(@click="documentPreview") 预览
        button.btn.btn-default(@click="documentHistory") 历史记录
    MoveDirectoryDialog(:bid="bookId" ref="moveDialog")
</template>

<script>
  import DocumentEditor from "../../../../lib/vue/DocumentEditor";
  import {nkcUploadFile, nkcAPI} from "../../../../lib/js/netAPI";
  import {sweetError} from "../../../../lib/js/sweetAlert";
  import {screenTopWarning} from "../../../../lib/js/topAlert";
  import MoveDirectoryDialog from '../../../components/MoveDirectoryDialog'
  import { EventBus } from '../../../eventBus'
  // import {saveToSessionStorage, getFromSessionStorage, updateInSessionStorage, sessionStorageKeys} from "../../../lib/js/sessionStorage";
  import { scrollTopFun } from '../../../scrollTop'
  export default {
    components: {
      'document-editor': DocumentEditor,
      MoveDirectoryDialog
    },
    data: () => ({
      coverFile: null,
      oldCoverFile: null,
      bookId: '',
      articleId: '',
      book: null,
      article: {
        title: '',
        content: '',
        cover: null,
      },
      formConfigs: {
        cover: true,
        title: true,
      },
      lockPost: false,
      documentId:'',
      // moveData:'',
      moveIndex:''
    }),
    computed: {
      type() {
        return this.articleId? 'modify': 'create'
      },
      navList() {
        const {book, articleId} = this;
        const list = [
          {
            name: '专题创作',
            page: 'books'
          }
        ];
        if(book) {
          list.push({
            name: book.name,
            page: 'book',
            params: {
              bid: book._id,
            }
          },
          {
            name: articleId? '编辑文章': '撰写文章'
          });
        } else {
          list.push({
            name: '加载中...'
          });
        }
        return list;
      }
    },
    mounted() {
      scrollTopFun(window, 0)
      this.initId();
      this.initData();
    },
    methods: {
      documentPreview(){
        const {documentId}=this
        if(documentId){
          window.open(`/document/${documentId}/preview`)
        }else{
          sweetError('文章id不存在')
        }
      },
      documentHistory(){
        const {documentId, bookId}=this
        window.open(`/document/${documentId}/history?bid=${bookId}`)
      },
      initId() {
        const {bid, aid, childIndex} = this.$route.query;
        this.moveIndex = childIndex;
        this.bookId = bid;
        if(aid) {
          this.articleId = aid;
        }
      },
      initData() {
        // if(this.notice) return
        const self = this;
        const {bookId, articleId} = this;
        let url = `/creation/articles/editor?bid=${bookId}`;
        if(articleId) url += `&aid=${articleId}`;
        nkcAPI(url, 'GET')
          .then(data => {
            // console.log(data,'data')
            const {article, book} = data;
            if(article) {
              const {title, content, cover, did, _id} = article;
              self.article.title = title;
              self.article.content = content;
              self.article.cover = cover;
              self.documentId = did;
              // self.id=_id
            }
            self.book = book;
            self.articleId = articleId;
            self.initDocumentForm();
          })
          .catch(sweetError);
      },
      initDocumentForm() {
        const {article} = this;
        const {title, content, cover} = article;
        this.$refs.documentEditor.initDocumentForm({
          title,
          content,
          cover
        });
      },
      post(type) {
        if(this.lockPost) return;
        this.lockPost = true;
        const self = this;
        const formData = new FormData();
        const {
          coverFile,
          bookId,
          articleId,
        } = this;
        const {
          title = '',
          content = '',
          cover = '',
        } = this.article;
        const article = {
          title,
          content,
          cover,
        };
        if(articleId) {
          formData.append('articleId', articleId);
        }
        if(coverFile) {
          formData.append('coverFile', coverFile, 'cover.png');
        }
        formData.append('bookId', bookId);
        formData.append('article', JSON.stringify(article));
        formData.append('type', type);
        formData.append('level', 'outermost');
        let url = '/creation/articles/editor';
        return nkcUploadFile(url, 'POST', formData)
          .then(data => {
            self.oldCoverFile = self.coverFile;
            self.coverFile = null;
            const {articleId, articleCover} = data;
            self.articleId = articleId;
            self.documentId = data.document.did;
            return self.resetCoverFile(articleCover);
          })
          .then(() => {
            if(type !== 'publish') {
              self.lockPost = false;
            }
            return;
          })
          .catch(err => {
            self.lockPost = false;
            throw err;
          });
      },
      modifyArticle() {
        const self = this;
        this.post(this.type)
        .catch(err => {
          console.error(err);
          screenTopWarning(err);
        })
      },
      saveArticle() {
        this.post('save')
        .then(() => {
          sweetSuccess('保存成功');
        })
      },
      publish() {
        let article = {
          title:'',
          id:this.articleId,
          url:'',
          type:'article',
          child:[]
        }
        // 文章编辑过后默认添加在列表最后 点击发布选中最后一项
        let  childIndex = this.moveIndex?.split(',') || []
        EventBus.$emit("moveDirectory", article, childIndex, 'publish', ()=>{
          this.post('publish')
          .then(() => {
            this.$router.replace({
              name: 'bookContent',
              params: {
                bid: this.bookId,
                aid: this.articleId
              }
            });
          })
          .catch(sweetError);
      });
      },
      resetCoverFile(cover) {
        this.cover = cover;
        this.coverFile = null;
        this.$refs.documentEditor.resetCover(cover);
      },
      watchContentChange(data) {
        if(this.lockContentChange) return;
        const {title, coverFile, content, cover} = data;
        this.article.title = title;
        this.article.content = content;
        this.article.cover = cover;
        this.coverFile = coverFile;
        this.modifyArticle();
      },
    }
  }
</script>
