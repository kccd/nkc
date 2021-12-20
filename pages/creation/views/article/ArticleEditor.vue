<template lang="pug">
  .row.creation-center-article-editor
    .col-xs-12.col-md-12.m-b-3
      bread-crumb(:list="navList")
    .col-xs-12.col-md-10.col-md-offset-1
      document-editor(ref="documentEditor")

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
      navList: [
        {
          name: '文档创作',
          page: 'books'
        },
        {
          name: '编辑文章',
        }
      ],
      coverBase64: '',
      coverData: null,
      bookId: '',
      articleId: '',
      article: {
        title: '',
        content: '',
        coverUrl: '',
      },
    }),
    computed: {
      type() {
        return this.articleId? 'modify': 'create'
      },
      coverUrl() {
        return this.coverBase64 || this.article.coverUrl || '';
      }
    },
    mounted() {
      if(this.article) {
        this.initArticle();
      }
    },
    methods: {
      initId() {
        const {bid, aid} = this.$route.query;
        this.bookId = bid;
        if(aid) {
          this.articleId = aid;
        }
      },
      initArticle() {
        const self = this;
        if(!this.articleId) return;
        nkcAPI(`/creation/article/${this.articleId}`, 'GET')
          .then(data => {
            const {title, content, coverUrl} = data.article;
            self.article.title = title;
            self.article.content = content;
            self.article.coverUrl = coverUrl;
          })
          .catch(sweetError);
      },
      post(type) {
        const self = this;
        const formData = new FormData();
        const {title, content, coverData} = this;
        const article = {
          title,
          content
        };
        if(self.articleId) {
          article.articleId = self.articleId;
        }
        if(coverData) {
          formData.append('cover', coverData);
        }
        formData.append('article', JSON.stringify(article));
        formData.append('type', type);
        nkcUploadFile(`/creation/articles/editor`, 'POST', formData)
          .then(data => {
            const {articleId} = data;
            self.articleId = articleId;
          })
          .catch(sweetError);
      }
    }
  }
</script>