<template lang="pug">
  .container-fluid.creation-center-article-editor
    .m-b-1
      bread-crumb(:list="navList")
    .standard-max-container
      .m-b-1
        document-editor(ref="documentEditor" :configs="formConfigs" @content-change="watchContentChange")
      .m-t-1
        button.btn.btn-primary.m-r-05(@click="publish") 发布
        button.btn.btn-default(@click="saveArticle") 保存

</template>

<script>
  import DocumentEditor from "../../../lib/vue/DocumentEditor";
  import {nkcUploadFile, nkcAPI} from "../../../lib/js/netAPI";
  import {sweetError} from "../../../lib/js/sweetAlert";
  import {screenTopWarning} from "../../../lib/js/topAlert";

  export default {
    components: {
      'document-editor': DocumentEditor
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
      this.initId();
      this.initData();
    },
    methods: {
      initId() {
        const {bid, aid} = this.$route.query;
        this.bookId = bid;
        if(aid) {
          this.articleId = aid;
        }
      },
      initData() {
        const self = this;
        const {bookId, articleId} = this;
        let url = `/creation/articles/editor?bid=${bookId}`;
        if(articleId) url += `&aid=${articleId}`;
        nkcAPI(url, 'GET')
          .then(data => {
            const {article, book} = data;
            if(article) {
              const {title, content, cover} = article;
              self.article.title = title;
              self.article.content = content;
              self.article.cover = cover;
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
        return nkcUploadFile(`/creation/articles/editor`, 'POST', formData)
          .then(data => {
            self.oldCoverFile = self.coverFile;
            self.coverFile = null;
            const {articleId, articleCover} = data;
            self.articleId = articleId;
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
        const self = this;
        self.post('publish')
        .then(() => {
          self.$router.replace({
            name: 'book',
            params: {
              bid: self.bookId,
              // aid: self.articleId
            }
          });
        })
        .catch(sweetError);
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
