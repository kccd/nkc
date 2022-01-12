<template lang="pug">
  .row
    image-selector(ref="imageSelector")
    .col-xs-12.col-md-12.m-b-3
      bread-crumb(:list="navList")
    .col-xs-12.col-md-6.col-md-offset-3
      .formm
        .form-group
          label.control-label 图书名称
          input.form-control(type="text" v-model="book.name")
        .form-group
          label.control-label 图书介绍
          textarea.form-control(rows=5 v-model="book.description")
        .form-group
          label.control-label 图书封面
          .m-r-05
            img.book-cover(v-if="bookCover" :src="bookCover")
          div
            button.btn.btn-default.btn-sm(@click="openImageSelector") 选择封面
        .form-group
          label.control-label 谁可以阅读
          .radio
            label.m-r-1
              input(type="radio" value="all")
              span 所有人
            label.m-r-1
              input(type="radio" value="self")
              span 仅自己
            label.m-r-1
              input(type="radio" value="fans")
              span 仅粉丝
        .form-group
          label.control-label 谁可以撰写文章
          .radio
            label.m-r-1
              input(type="radio" value="all")
              span 所有人
            label.m-r-1
              input(type="radio" value="self")
              span 仅自己
            label.m-r-1
              input(type="radio" value="fans")
              span 仅粉丝
        .form-group
          button.btn.btn-default.btn-block(v-if="submitting" disabled) {{progress === 100? `处理中...`: `提交中...${progress}%`}}
          button.btn.btn-default.btn-block(v-else @click="submit") 提交
</template>

<script>
  import {nkcAPI} from "../../../lib/js/netAPI";
  import {fileToBase64} from "../../../lib/js/file";
  import {getUrl} from "../../../lib/js/tools";
  import {checkString} from "../../../lib/js/checkData";
  import ImageSelector from '../../../lib/vue/ImageSelector';

  export default {
    data: () => ({
      bookId: '',
      bookName: '',
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
    components: {
      'image-selector': ImageSelector
    },
    mounted() {
      this.init();
    },
    computed: {
      bookCover() {
        const {book, fileBase64} = this;
        if(fileBase64) {
          return fileBase64;
        } else if(book.coverUrl) {
          return book.coverUrl;
        }
        return '';
      },
      navList() {
        if(!this.bookId) {
          return [
            {
              name: '图书创作',
              page: 'books'
            },
            {
              name: '创建新图书'
            }
          ]
        } else {
          return [
            {
              name: '图书创作',
              page: 'books'
            },
            {
              name: this.bookName,
              page: 'book',
              params: {
                bid: this.bookId
              }
            },
            {
              name: '设置'
            }
          ]
        }
      }
    },
    methods: {
      navToPage(name) {
        this.$router.push({name});
      },
      init() {
        const bookId = this.$route.query.bid;
        if(bookId) {
          this.bookId = bookId;
          this.initBook();
        }
      },
      initBook() {
        const {bookId} = this;
        if(!bookId) return;
        nkcAPI(`/creation/book/${bookId}`, 'GET')
          .then(data => {
            const {
              name,
              description,
              coverUrl,
            } = data.bookData;
            this.bookName = name;
            this.book = {
              name,
              description,
              coverUrl
            };
          })
          .catch(sweetError)
      },
      openImageSelector() {
        const self = this;
        let file;
        this.$refs.imageSelector.open({
          aspectRatio: 3
        })
          .then(image => {
            file = image;
            return fileToBase64(image)
          })
          .then(url => {
            self.fileBase64 = url;
            self.file = file;
            self.$refs.imageSelector.close();
          })
          .catch(sweetError);
      },
      toSelectImage() {
        this.$refs.file.click();
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
            if(!self.bookId && !file) throw new Error(`请选择文档封面`);
            const formData = new FormData();
            if(file) {
              formData.append('cover', file, 'cover.png');
            }
            formData.append('book', JSON.stringify({
              bookId: self.bookId,
              name: book.name,
              description: book.description
            }));
            return nkcUploadFile(`/creation/books/editor`, 'POST', formData, (e, p) => {
              self.progress = p;
            });
          })
          .then(() => {
            sweetSuccess('提交成功');
            self.submitting = false;
            self.navToPage('books');
          })
          .catch(err => {
            self.submitting = false;
            sweetError(err);
          })

      }
    }
  }
</script>

<style lang="less" scoped>
  .book-cover{
    max-width: 100%;
    max-height: 20rem;
    margin-bottom: 1rem;
  }
</style>