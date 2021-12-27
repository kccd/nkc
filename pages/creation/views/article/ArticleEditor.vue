<template lang="pug">
  .row.creation-center-article-editor
    .col-xs-12.col-md-12.m-b-3
      bread-crumb(:list="navList")
    .col-xs-12.col-md-10.col-md-offset-1
      document-editor(ref="documentEditor" :configs="formConfigs" @content-change="watchContentChange")
      .m-t-1.m-b-3
        button.btn.btn-block.btn-primary(@click="publish") 发布

</template>

<script>
  import DocumentEditor from "../../../lib/vue/DocumentEditor";
  import {nkcUploadFile, nkcAPI} from "../../../lib/js/netAPI";
  import {sweetError} from "../../../lib/js/sweetAlert";

  export default {
    components: {
      'document-editor': DocumentEditor
    },
    data: () => ({
      coverFile: null,
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
      }
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
        if(cover) {
          formData.append('coverFile', coverFile);
        }
        formData.append('bookId', bookId);
        formData.append('article', JSON.stringify(article));
        formData.append('type', type);
        nkcUploadFile(`/creation/articles/editor`, 'POST', formData)
          .then(data => {
            const {articleId} = data;
            self.articleId = articleId;
          })
          .then(() => {
            if(type === 'publish') {
              self.$router.replace({
                name: 'bookContent',
                params: {
                  bid: self.bookId,
                  aid: self.articleId
                }
              });
            }
          })
          .catch(sweetError);
      },
      saveArticle() {
        this.post(this.type);
      },
      publish() {
        this.post('publish');
      },
      watchContentChange(data) {
        const {title, coverFile, cover, content} = data;
        this.article.title = title;
        this.article.content = content;
        this.article.cover = cover;
        this.coverFile = coverFile;
        this.saveArticle();
      },
    }
  }
</script>
