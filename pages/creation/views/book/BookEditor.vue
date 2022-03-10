<template lang="pug">
  .standard-max-container
    user-selector(ref="userSelector")
    image-selector(ref="imageSelector")
    .m-b-1
      bread-crumb(:list="navList")
      //- .standard-container
    .formm
      .form-group
        label.control-label 专题名称
        input.form-control(type="text" v-model="book.name")
      .form-group
        label.control-label 专题介绍
        textarea.form-control(rows=5 v-model="book.description")
      .form-group
        label.control-label 专题封面
        .m-r-05
          img.book-cover(v-if="bookCover" :src="bookCover")
        div
          button.btn.btn-default.btn-sm(@click="openImageSelector") 选择封面
      .form-group(v-if="bookId")
        label.control-label 创作成员
        .table-responsive
          table.table.nkc-table.m-b-05
            thead
              tr
                th 用户名
                th 角色
                th 状态
                th 操作
            tbody
              tr(v-for="m in bookMembers")
                th.member-name
                  img(:src="m.avatarUrl")
                  a(:href="m.userHome" target="_blank") {{m.username}}
                th
                  .radio.m-t-05.m-b-05
                    label.m-r-1
                      input(type="radio" value="admin" v-model="m.role" :disabled="m.isFounder")
                      span 管理员
                    label
                      input(type="radio" value="member" v-model="m.role" :disabled="m.isFounder")
                      span 普通成员
                th.member-status(:class="m.status") {{m.statusName}}
                th
                  button.btn.btn-xs.btn-default(v-if="m.status !== 'rejected' && !m.isFounder" @click="removeMember(m)") 删除
                  button.btn.btn-xs.btn-default(v-if="m.status === 'rejected'") 重新邀请
        .m-b-05
          button.btn.btn-default.btn-xs(@click="selectorMember") 添加成员
        .permission-info.bg-info.p-a-05
          strong 权限说明
          div 管理员：
            span {{rolePermission.admin.join("、")}}
          div 普通成员：
            span {{rolePermission.member.join("、")}}


      .form-group(v-if="bookId")
        label.control-label 谁可以阅读
        .radio
          label.m-r-1
            input(type="radio" value="everyone" v-model="book.read")
            span 所有人
          label.m-r-1
            input(type="radio" value="member" v-model="book.read")
            span 仅创作成员
          label.m-r-1
            input(type="radio" value="self" v-model="book.read")
            span 仅自己
      .form-group.m-b-3
        button.btn.btn-primary.btn-block(v-if="submitting" disabled) {{progress === 100? `处理中...`: `提交中...${progress}%`}}
        button.btn.btn-primary.btn-block(v-else @click="submit") 提交
        //button.btn.btn-danger.btn-block(v-if="bookId") 删除
</template>
<script>
  import {nkcAPI} from "../../../lib/js/netAPI";
  import {fileToBase64} from "../../../lib/js/file";
  import {checkString} from "../../../lib/js/checkData";
  import ImageSelector from '../../../lib/vue/ImageSelector';
  import UserSelector from '../../../lib/vue/UserSelector';
  import {sweetError, sweetSuccess} from '../../../lib/js/sweetAlert';

  export default {
    data: () => ({
      bookId: '',
      bookName: '',
      book: {
        name: '',
        description: '',
        cover: '',
        read: '',
      },
      bookMembers: [],
      rolePermission: {
        admin: [],
        member: []
      },
      file: null,
      fileBase64: '',
      progress: 0,
      submitting: false
    }),
    components: {
      'image-selector': ImageSelector,
      'user-selector': UserSelector
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
              name: '专题创作',
              page: 'books'
            },
            {
              name: '创建新专题'
            }
          ]
        } else {
          return [
            {
              name: '专题创作',
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
      navToPage(name, params = {}) {
        this.$router.push({
          name,
          params
        });
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
        nkcAPI(`/creation/books/editor?bid=${bookId}`, 'GET')
          .then(data => {
            const {
              name,
              description,
              coverUrl,
              read,
            } = data.bookData;
            this.bookName = name;
            this.book = {
              name,
              description,
              coverUrl,
              read
            };
            this.rolePermission = data.rolePermission;
            this.bookMembers = data.bookMembers;
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
        const {book, file, bookMembers} = this;
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
            if(!self.bookId && !file) throw new Error(`请选择专题封面`);
            const formData = new FormData();
            if(file) {
              formData.append('cover', file, 'cover.png');
            }

            const members = bookMembers.map(member => {
              const {uid, role} = member
              return {
                uid,
                role
              };
            });

            formData.append('book', JSON.stringify({
              bookId: self.bookId,
              name: book.name,
              read: book.read,
              description: book.description,
              members
            }));

            return nkcUploadFile(`/creation/books/editor`, 'POST', formData, (e, p) => {
              self.progress = p;
            });
          })
          .then((data) => {
            sweetSuccess('提交成功');
            self.submitting = false;
            self.navToPage('book', {bid: data.bookId})
          })
          .catch(err => {
            self.submitting = false;
            sweetError(err);
          })
      },
      addMembers(membersId) {
        const {bookId} = this;
        const self = this;
        nkcAPI(`/creation/book/${bookId}/member`, 'POST', {
          membersId
        })
          .then(data => {
            self.bookMembers = data.bookMembers;
            self.$refs.userSelector.close();
          })
          .catch(sweetError)
      },
      removeMember(member) {
        const {bookId} = this;
        const self = this;
        return sweetQuestion(`确定要删除成员「${member.username}」？`)
        .then(() => {
          return nkcAPI(`/creation/book/${bookId}/member?uid=${member.uid}`, 'DELETE')
        })
        .then(data => {
          self.bookMembers = data.bookMembers;
        })
        .catch(sweetError)
      },
      selectorMember() {
        const self = this;
        this.$refs.userSelector.open((data) => {
          if(data.usersId.length === 0) return;
          self.addMembers(data.usersId);
        }, {
          userCount: 10
        });
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
  .member-name{
    img{
      height: 1.8rem;
      width: 1.8rem;
      border-radius: 3px;
      margin-right: 0.5rem;
    }
  }
  .member-status.resolved{
    color: green;
  }
  .member-status.rejected{
    color: red;
  }
  .permission-info{
    font-size: 1rem;
    color: #555;
    strong{
      margin-bottom: 0.3rem;
      display: block;
    }
    div{
      span{
        color: #000
      }
    }
  }
</style>