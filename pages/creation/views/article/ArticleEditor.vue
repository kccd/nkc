<template lang="pug">
  .row.creation-center-article-editor
    .col-xs-12.col-md-12
      bread-crumb(:list="navList")
    .col-xs-12.col-md-10.col-md-offset-1
      .form
        .form-group
          input.form-control(type="text" v-model="article.title")
        .form-group
          editor(:configs="editorConfigs" ref="editor")

</template>


<script>
  import Editor from '../../../lib/vue/Editor';
  export default {
    components: {
      'editor': Editor
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
      article: {
        title: '',
        content: ''
      },
      editorConfigs: {

      }
    })
  }
</script>