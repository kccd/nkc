<template lang="pug">
  .row
    .col-xs-12.col-md-12
      bread-crumb(:list="navList")
    .col-xs-12.col-md-6.col-md-offset-3
      .formm
        .form-group
          label.control-label 文档名称
          input.form-control(type="text" v-model="book.name")
        .form-group
          label.control-label 文档介绍
          textarea.form-control(rows=5 v-model="book.description")
        .form-group
          label.control-label 文档封面
          div
            img.book-cover(v-if="bookCover" :src="bookCover")
            input.hidden(type="file" accept="image/*" ref="file" @change="selectedImage")
            button.btn.btn-default.btn-sm(@click="toSelectImage") 选择封面
        .form-group
          button.btn.btn-default.btn-block(v-if="submitting" disabled) {{progress === 100? `处理中...`: `提交中...${progress}%`}}
          button.btn.btn-default.btn-block(v-else @click="submit") 提交
</template>

<script>
  import {nkcAPI} from "../../../lib/js/netAPI";
  import {fileToBase64} from "../../../lib/js/file";
  import {getUrl} from "../../../lib/js/tools";
  import {checkString} from "../../../lib/js/checkData";

  export default {
    data: () => ({
      mode: 'create', // create: 新建文档, modify: 修改文档
      navList: [
        {
          name: '文档创作',
          page: 'books'
        },
        {
          name: '新建文档',
        }
      ],
      bookId: '',
      book: {
        name: '',
        description: '',
        cover: ''
      },
      file: null,
      fileBase64: '',
      progress: 0,
      submitting: false
    }),
    computed: {
      bookCover() {
        const {book, fileBase64} = this;
        if(fileBase64) {
          return fileBase64;
        } else if(book.cover) {
          return getUrl('bookCover', book.cover)
        }
        return '';
      }
    },
    methods: {
      navToPage(name) {
        this.$router.push({name});
      },
      init() {
        if(this.mode === 'modify') {
          this.initBook();
        }
      },
      initBook() {
        const {bookId} = this;
        if(!bookId) return;
        nkcAPI(`/creation/book/${bookId}`, 'GET')
          .then(data => {
            const {name, description, cover} = data.book;
            this.book = {
              name,
              description,
              cover
            };
          })
          .catch(sweetError)
      },
      toSelectImage() {
        this.$refs.file.click();
      },
      selectedImage() {
        const file = this.$refs.file.files[0];
        fileToBase64(file)
          .then(url => {
            this.fileBase64 = url;
            this.file = file;
          })
      },
      submit() {
        const {book, file} = this;
        const self = this;
        self.submitting = true;
        Promise.resolve()
          .then(() => {
            checkString(book.name, {
              name: '文档名称',
              minLength: 1,
              maxLength: 100,
            });
            checkString(book.description, {
              name: '文档介绍',
              minLength: 0,
              maxLength: 1000
            });
            if(!book.cover && !file) throw new Error(`请选择文档封面`);
            const formData = new FormData();
            if(file) {
              formData.append('cover', file);
            }
            formData.append('book', JSON.stringify(book));
            return nkcUploadFile(`/creation/books/creator`, 'POST', formData, (e, p) => {
              self.progress = p;
            });
          })
          .then(() => {
            self.submitting = false;
          })
          .catch(err => {
            self.submitting = false;
            sweetError(err);
          })

      }
    }
  }
</script>

<style lang="less">
  .book-cover{
    max-width: 100%;
    margin-bottom: 1rem;
  }
</style>