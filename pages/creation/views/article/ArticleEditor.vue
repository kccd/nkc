<template lang="pug">
  .row.creation-center-article-editor
    .col-xs-12.col-md-12.m-b-3
      bread-crumb(:list="navList")
    .col-xs-12.col-md-10
      document-editor(ref="documentEditor" :configs="formConfigs" @content-change="watchContentChange")
      .m-t-1.m-b-3
        button.btn.btn-primary.m-r-05(@click="publish") 发布
        button.btn.btn-default(@click="saveArticle") 保存
        button.btn.btn-default(@click="documentPreview") 预览
    MoveDirectoryDialog(:bid="bookId" ref="moveDialog")
</template>

<script>
  import DocumentEditor from "../../../lib/vue/DocumentEditor";
  import {nkcUploadFile, nkcAPI} from "../../../lib/js/netAPI";
  import {sweetError} from "../../../lib/js/sweetAlert";
  import {screenTopWarning} from "../../../lib/js/topAlert";
  import MoveDirectoryDialog from '../../component/MoveDirectoryDialog'
  import { EventBus } from '../../eventBus'
  export default {
    components: {
      'document-editor': DocumentEditor,
      MoveDirectoryDialog
    },
    data: () => ({
      coverFile: null,
      oldCoverFile: null,
      bookId: '',
      id:'',
      aid:'',
      d_id:'',
      notice:'',
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
      articleType:'article',
      publishIndex:'',
      publishId:'',
      // 发布需要的位置 和 文章数据
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
      EventBus.$on('saveArticle',()=>{
        this.post('save')
        .then(() => {
          // sweetSuccess('保存成功');
        })
      })
      EventBus.$on('publish',(publishIndex,publishId)=>{
        this.post('publish')
        .then(() => {
          publishIndex && (this.publishIndex=publishIndex)
          publishId && (this.publishId=publishId)
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
      moveDialog(data, childIndex, isOpen, bid, type) {
        childIndex=childIndex.split(',')
        EventBus.$emit("moveDirectory", data, childIndex, isOpen, bid, type,);
      },
      documentPreview(){
        const {doucmentId,bookId,articleId,id}=this
        window.open(`/creation/document?_id=${id}&did=${doucmentId}&bid=${bookId}&aid=${articleId}`)
      },
      initId() {
        const {bid, aid, type, data ,childIndex} = this.$route.query;
        this.moveData=data;
        this.moveIndex=childIndex;
        this.bookId = bid;
        type && (this.articleType=type)
        if(aid) {
          this.articleId = aid;
        }
      },
      initData() {
        if(this.notice) return
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
              self.id=_id
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
      post(type,articleType) {
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
        formData.append('articleType', articleType);
        formData.append('level', 'outermost');
        let url='/creation/articles/editor'
        // if(this.articleId){
        //   url='/creation/addChapter'
        //   formData.append('aid', this.articleId);
        // }
        return nkcUploadFile(url, 'POST', formData)
          .then(data => {
            sessionStorage.document_id=data.document?._id
            self.oldCoverFile = self.coverFile;
            self.coverFile = null;
            const {articleId, articleCover} = data;
            self.articleId = articleId;
            self.resetCoverFile(articleCover);
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
        const self = this;
        this.post(this.type,this.articleType).then(data=>{
        })
        .catch(err => {
          screenTopWarning(err);
        })
      },
      saveArticle() {
      //   this.$router.push({
      //   name:"book",
      //   query:{
      //     data:this.article,
      //   },
      //   params:{
      //     bid:this.bookId
      //   },
      // });//choice 新建文章
      this.modifyArticle()

      // this.moveDialog(this.article,null,null,null,'choice')
      },
      publish() {
      let article={
        title:this.article.title,
        id:this.articleId,
        url:'',
        type:'article',
        child:[]
      }
      // this.publishId=this.article.id
      // 文章编辑过后默认添加在列表最后 点击发布选中最后一项  
      let publishType;
      // if(this.publishId === this.articleId && this.publishIndex) publishType="republish" 
      let  childIndex=this.moveIndex?.split(',')
      this.$refs.moveDialog.moveDialog(article, childIndex, null, this.bookId, 'choice', publishType,)
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
