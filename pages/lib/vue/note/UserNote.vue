<template lang="pug">
  .user-note(v-if="!loading")
    span(v-if="pageButtons.length > 0")
      paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")
    .paging-button
      a.button.radius-left(
        :class="!t?'active':''"
        @click="screen()"
        data-type="reload"
      ) 全部
      a.button.radius-right(
        :class="t==='own'?'active':''"
        @click="screen('own')"
        data-type="reload"
      ) 我的
    .account-notes
      .note-threads(v-if="!threads || !threads.length")
        .null 空空如也~
      .note-threads(v-else)
        .note-thread(v-for="t in threads")
          .note-thread-info
            a(:href="'/t/'+t.tid" target="_blank").note-thread-title {{t.title}}
            .note-thread-abstract {{t.abstract}}
          .note-thread-cover(v-if="t.cover")
            .note-thread-cover-image(:style="'background-image: url(' + getUrl('cover', t.cover) + ')'")
          .note-thread-posts
            .note-thread-post(v-for="post in t.posts")
              .note-thread-note(v-for="note in post.notes")
                .note-origin-content
                  a(:href="post.url" target="_blank") {{note.content}}
                .note-content-body
                  .note-content(v-for="n in note.notes")
                    .time {{fromNow(n.toc)}}
                    .options(v-if="n.uid === uid")
                      .fa.fa-pencil(title="编辑" @click="modifyNote(n)")
                      .fa.fa-trash(title="删除" @click="deleteNote(note, n)")
                    .options(v-else)
                      .user
                        a(@click="visitUrl('/u/' + n.uid, true)"
                          data-global-mouseover="showUserPanel"
                          data-global-mouseout="hideUserPanel"
                          :data-global-data="objToStr({uid: n.uid})"
                        )
                          img(:src="getUrl('userAvatar', n.user.avatar)")
                          span {{n.user.username}}
                    .content
                      div(v-if="n.edit").m-b-1
                        textarea.form-control(v-model="n.content" :ref="n._id" @keyup.ctrl.enter="saveContent(n)" @input="textareaAutoResize(n)" @focus="textareaAutoResize(n)")
                        .m-t-05
                          button.btn.btn-xs.btn-primary(@click="saveContent(n)") 保存
                          button.btn.btn-xs.btn-default(@click="modifyNote(n)") 取消
                      div(v-else)
                        .note(v-html="n.html")
                  .note-content(v-if="note.edit").m-b-1
                    textarea.form-control(
                      placeholder="添加笔记（公开、500字限制）"
                      v-model="note.newContent" :ref="'note' + note._id" @keyup.ctrl.enter="saveNewNote(note)" @input="textareaAutoResize(note, 'note')" @focus="textareaAutoResize(note, 'note')")
                    .m-t-05
                      button.btn.btn-xs.btn-primary(@click="saveNewNote(note)") 保存
                      button.btn.btn-xs.btn-default(@click="addNote(note)") 取消
                .add-note(v-if="!note.edit")
                  .fa.fa-plus(@click="addNote(note)" title="添加笔记") &nbsp;添加笔记
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
.null {
  text-align: center;
  margin-top: 5rem;
  margin-bottom: 5rem;
}
.account-notes{
  .note-threads{
    .null{
      padding: 5rem 0;
      text-align: center;
    }
    .note-thread{
      margin-bottom: 2rem;
      .note-thread-cover{
        vertical-align: top;
        display: table-cell;
        width: 11rem;
        .note-thread-cover-image{
          width: 10rem;
          height: 7rem;
          margin-left: 1rem;
          background-size: cover;
          border-radius: 3px;
        }
      }
      .note-thread-info{
        display: table-cell;
        width: 100%;
        vertical-align: top;
        .note-thread-title{
          font-weight: 700;
          color: @dark;
          height: 2rem;
          .hideText(@line: 1);
          font-size: 1.4rem;
        }
        .note-thread-abstract{
          max-height: 5rem;
          .hideText(@line: 3);
        }
      }
      .note-thread-posts{
        .note-thread-post{
          .note-thread-note{
            .note-origin-content{
              a{
                color: #757575;
                cursor: pointer;
                text-decoration: none;
                &:hover, &:active, &:visited{
                  text-decoration: none;
                }
                padding-right: 2rem;
                &:hover{
                  color: @dark;
                }
              }
              position: relative;
              border-left: 4px solid #aaa;
              display: block;
              margin-top: 0.5rem;
              //font-style: oblique;
              font-size: 1.25rem;
              font-weight: 700;
              padding: 0.5rem;
              background-color: #f4f4f4;
            }
            .note-content-body{
              padding-top: 0.5rem;
              .note-content{
                margin-bottom: 0.3rem;
                &:hover{
                  .options{
                    .fa{
                      color: #555;
                    }
                    .user{
                      a{
                        text-decoration: underline;
                      }
                    }
                  }
                }
                &>textarea{
                  height: 4rem;
                  resize: none;
                  overflow: hidden;
                }
                .time{
                  display: inline-block;
                  font-size: 1rem;
                  //font-style: oblique;
                  color: @accent;
                  margin-right: 0.5rem;
                }
                .options{
                  float: right;
                  display: inline-block;
                  padding-left: 0.2rem;
                  text-align: right;
                  .fa{
                    padding-left: 0.3rem;
                    cursor: pointer;
                    color: #aaa;
                    &:hover{
                      color: #555;
                    }
                  }
                  .user{
                    font-weight: 700;
                    display: inline-block;
                    //font-style: oblique;
                    color: #555;
                    font-size: 1rem;
                    a{
                      cursor: pointer;
                      user-select: none;
                      color: @primary;
                      img{
                        margin-top: -2px;
                        height: 1.5rem;
                        width: 1.5rem;
                        border-radius: 50%;
                        margin-right: 0.3rem;
                      }
                    }
                  }
                }
                .content{
                  vertical-align: top;
                  word-break: break-all;
                  width: 100%;
                  textarea{
                    width: 100%;
                    height: 4rem;
                    resize: none;
                    overflow: hidden;
                    &:focus{
                      outline: none;
                    }
                  }
                  .note{

                  }
                }
              }
            }
            .add-note{
              text-align: left;
              //padding: 0 2rem;
              .fa{
                width: 7rem;
                height: 1.6rem;
                border-radius: 1rem;
                max-width: 100%;
                text-align: center;
                font-size: 1rem;
                line-height: 1.7rem;
                //background-color: #f4f4f4;
                cursor: pointer;
                color: #fff;
                background-color: @primary;
                &:hover{
                  //background-color: #f9f9f9;
                  opacity: 0.8;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
<script>
import Paging from "../Paging";
import {getState} from "../../js/state";
import {nkcAPI} from "../../js/netAPI";
import {getUrl, fromNow, objToStr} from "../../js/tools";
import {visitUrl} from "../../js/pageSwitch";
export default {
  data: () => ({
    uid: '',
    threads: [],
    paging: null,
    loading: false,
    t: ""
  }),
  components: {
    "paging": Paging
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  mounted() {
    this.initData();
    this.getUserNotes();
  },
  methods: {
    visitUrl: visitUrl,
    objToStr: objToStr,
    fromNow: fromNow,
    getUrl: getUrl,
    initData() {
      const {uid} = this.$route.params;
      const {uid: stateUid} = getState();
      this.uid = uid || stateUid;
    },
    //获取用户的笔记
    getUserNotes(page=0, t='') {
      this.loading = true;
      const self = this;
      let url = `/u/${self.uid}/profile/noteData?page=${page}`;
      if(t) {
        url += `&t=${t}`;
      }
      nkcAPI(url, 'GET')
      .then(res => {
        self.threads = res.threads;
        self.paging = res.paging;
        self.t = res.t;
      })
      .catch(err => {
        sweetError(err);
      })
      self.loading = false;
    },
    clickBtn(num) {
      this.getUserNotes(num);
    },
    screen(type) {
      this.getUserNotes(0, type);
    },
    modifyNote(nc) {
      const self = this;
      nc.edit = !nc.edit;
      if(nc.edit) {
        setTimeout(() => {
          self.textareaAutoResize(nc);
        }, 50)
      }
    },
    saveNewNote(note) {
      const {_id, newContent, targetId, type} = note;
      const self = this;
      Promise.resolve()
        .then(() => {
          if(!newContent) throw "请输入笔记内容";
          return nkcAPI("/note", "POST", {
            _id,
            type,
            targetId,
            content: newContent
          });
        })
        .then(data => {
          note.notes.push(data.noteContent);
          note.newContent = "";
          self.addNote(note);
          self.textareaAutoResize(note, "note");
        })
        .catch(sweetError);
    },
    addNote(note) {
      note.edit = !note.edit;
    },
    deleteNote(note, nc) {
      sweetQuestion("确定要执行删除操作？")
        .then(() => {
          const {noteId, _id} = nc;
          return nkcAPI(`/note/${noteId}/c/${_id}`, "DELETE");
        })
        .then(() => {
          const index = note.notes.indexOf(nc);
          if(index !== -1) note.notes.splice(index, 1);
        })
        .catch(sweetError);
    },
    saveContent(nc) {
      const {content, noteId, _id} = nc;
      const self = this;
      nkcAPI(`/note/${noteId}/c/${_id}`, "PUT", {
        content
      })
        .then(data => {
          nc.html = data.noteContentHTML;
          self.resetTextarea(nc);
        })
        .catch(sweetError);
    },
    getTextarea(nc, t = "") {
      return this.$refs[t+nc._id][0];
    },
    resetTextarea(nc, t) {
      nc.edit = false;
      this.textareaAutoResize(nc, t);
    },
    textareaAutoResize(nc, t) {
      const textArea = this.getTextarea(nc, t);
      const num = 4 * 12;
      if(num < textArea.scrollHeight) {
        textArea.style.height = textArea.scrollHeight + 'px';
      } else {
        textArea.style.height = '4rem';
      }
    }
  }
}
</script>
