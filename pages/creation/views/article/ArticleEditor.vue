<template lang="pug">
  .row.creation-center-article-editor
    .col-xs-12.col-md-12.m-b-3
      bread-crumb(:list="navList")
    .col-xs-12.col-md-10
      document-editor(ref="documentEditor" :configs="formConfigs" @content-change="watchContentChange")
      .m-t-1.m-b-3
        button.btn.btn-primary.m-r-05(@click="publish") 发布
        button.btn.btn-default.m-r-05(@click="saveArticle") 保存
        button.btn.btn-default(@click="documentPreview") 预览
        button.btn.btn-default(@click="documentHistory") 历史记录
    MoveDirectoryDialog(:bid="bookId" ref="moveDialog")
</template>

<script>
  import DocumentEditor from "../../../lib/vue/DocumentEditor";
  import {nkcUploadFile, nkcAPI} from "../../../lib/js/netAPI";
  import {sweetError} from "../../../lib/js/sweetAlert";
  import {screenTopWarning} from "../../../lib/js/topAlert";
  import MoveDirectoryDialog from '../../component/MoveDirectoryDialog'
  import { EventBus } from '../../eventBus'
  // import {saveToSessionStorage, getFromSessionStorage, updateInSessionStorage, sessionStorageKeys} from "../../../lib/js/sessionStorage";
  import { scrollTopFun } from '../../scrollTop'
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
      doucmentId:'',
      moveData:'',
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
            name: '文档创作',
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
            name: articleId? '编辑文章': '添加文章'
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
      this.scrollPosition()
      EventBus.$on('publish', (publishIndex, publishId)=>{
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
      })
      this.initId();
      this.initData();
    },
    methods: {
      scrollPosition(){
      scrollTopFun(window, 0)
      },
      moveDialog(data, childIndex, bid, type) {
        childIndex=childIndex.split(',')
        EventBus.$emit("moveDirectory", data, childIndex, bid, type);
      },
      documentPreview(){
        const {doucmentId}=this
        if(doucmentId){
          window.open(`/document/${doucmentId}/preview`)
        }else{
          sweetError('文章id不存在')
        }
      },
      documentHistory(){
        const {doucmentId, bookId}=this 
        window.open(`/document/${doucmentId}/history?bid=${bookId}`)
      },
      initId() {
        const {bid, aid, data ,childIndex} = this.$route.query;
        this.moveData=data;
        this.moveIndex=childIndex;
        this.bookId = bid;
        // type && (this.articleType=type)
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
              const {title, content, cover,did,_id} = article;
              self.article.title = title;
              self.article.content = content;
              self.article.cover = cover;
              self.doucmentId=did
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
        let url='/creation/articles/editor'
        return nkcUploadFile(url, 'POST', formData)
          .then(data => {
            self.oldCoverFile = self.coverFile;
            self.coverFile = null;
            const {articleId, articleCover} = data;
            self.articleId = articleId;
            self.resetCoverFile(articleCover);
            self.doucmentId=data.document.did
          })
          .then(() => {
            if(type !== 'publish') {
              self.lockPost = false;
            }
          })
          .catch(err => {
            self.lockPost = false;
            throw err;
          });
      },
      modifyArticle() {
        this.post(this.type).then(data=>{
        })
        .catch(err => {
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
      let article={
        title:this.article.title,
        id:this.articleId,
        url:'',
        type:'article',
        child:[]
      }
      // 文章编辑过后默认添加在列表最后 点击发布选中最后一项  
      let  childIndex=this.moveIndex?.split(',') || []
      this.$refs.moveDialog.moveDialog(article, childIndex, this.bookId, 'choice')
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
