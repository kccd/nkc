<template lang="pug">
  .modifySubmit
    h5.text-danger 温馨提示：
    div(v-html="notice") {{notice}}
    div(v-cloak)
        hr
        .checkbox(v-if="havePermissionToSendAnonymousPost")
          label
            input(type="checkbox" v-model="anonymous" :value="true" :disabled="!allowedAnonymous")
            span
              | 匿名发表
              span.text-danger(v-if='!allowedAnonymous') (所选专业分类不支持匿名发表)
        .checkbox
          label
            input(type="checkbox" v-model="checkProtocol" :value="true")
            span
              | 我已阅读并同意遵守与本次发表相关的全部协议。
              a(href=`/protocol` target="_blank") 查看协议
        .checkbox
          .editor-auto-save(v-if="autoSaveInfo")
            .fa.fa-check-circle &nbsp;{{autoSaveInfo}}
        if blockButton
          .row
            .col-xs-6.p-r-05
              button.btn.btn-theme.btn-block(@click="submit" v-if="checkProtocol && !disabledSubmit") 提交
              button.btn.btn-theme.btn-block(v-else disabled :title="!checkProtocol?'请先勾选同意遵守全部协议':''")
                span(v-if="disabledSubmit")
                  span 提交中...&nbsp;
                  .fa.fa-spinner.fa-spin
                span(v-else) 提交
            .col-xs-6.p-l-05
              button.btn.btn-default.btn-block(@click="saveToDraftBase") 存草稿
        else
          button.btn.btn-theme(@click="readyData" v-if="checkProtocol && !disabledSubmit") 提交
          button.btn.btn-theme(v-else disabled :title="!checkProtocol?'请先勾选同意遵守全部协议':''")
            span(v-if="disabledSubmit")
              span 提交中...&nbsp;
              .fa.fa-spinner.fa-spin
            span(v-else) 提交
          button.btn.btn-default(@click="saveToDraftBase") 存草稿
</template>

<script>
import { nkcAPI } from "../../lib/js/netAPI";
import { timeFormat } from "../../lib/js/tools"
export default {
  props: {
    blockButton: {
      default: true,
      type: Boolean
    },
    notice:{
      type: String
    }
  },
  data: () => ({
    // thread = data.thread;
    disabledSubmit: false, // 锁定提交按钮
    checkProtocol: true, // 是否勾选协议
    // 当前用户是否有权限发表匿名内容
    havePermissionToSendAnonymousPost:
      data.havePermissionToSendAnonymousPost || false,
    // 允许发表匿名内容的专业ID
    allowedAnonymousForumsId: data.allowedAnonymousForumsId || [],
    // 根据当前所选专业判断用户是否有权限勾选匿名，若无权则此处无需将匿名标志提交到服务器。（新发表时不匿名，修改时无法需改匿名标志）
    allowedAnonymous: false,
    // 是否匿名
    anonymous: data.post ? data.post.anonymous : false,
    autoSaveInfo: ""
  }),
  computed: {
    selectedForumsId() {
      let arr = [];
      let selectedForums = this.selectedForums;
      for (let i = 0; i < selectedForums.length; i++) {
        let forum = selectedForums[i];
        if (forum.fid) arr.push(forum.fid);
      }
      return arr;
    }
  },
  methods: {
    setFloatDom() {
      const oldDom = $("#submit-scroll-sm");
      const scrollWidth = oldDom.width();
      const { left, top } = oldDom.offset();
      $("#submit-scroll").css({
        width: scrollWidth + 30,
        display: "block",
        left,
        top
      });
    },
    checkAnonymous() {
      let selectedForumsId = this.selectedForumsId;
      let havePermission = false;
      for (let i = 0; i < selectedForumsId.length; i++) {
        let fid = selectedForumsId[i];
        if (this.allowedAnonymousForumsId.indexOf(fid) !== -1) {
          havePermission = true;
          break;
        }
      }
      if (!havePermission) {
        this.anonymous = false;
        this.allowedAnonymous = false;
      } else {
        this.allowedAnonymous = true;
      }
    },
    format: timeFormat,
    saveToDraftSuccess() {
      let time = new Date();
      this.autoSaveInfo = "草稿已保存 " + this.format(time);
    },
    autoSaveToDraft() {
      let type = this.type;
      // 内容为空时不自动保存草稿,不做任何操作
      if (!this.content) return;
      if (type === "newThread") {
        if (
          !this.title &&
          !this.content &&
          (!this.selectedForums || !this.selectedForums.length) &&
          !this.cover &&
          !this.abstractCn &&
          !this.abstractEn &&
          !this.keyWordsCn &&
          !this.keyWordsEn &&
          !this.authorInfos &&
          !this.surveyId
        )
          return;
      } else if (type === "newPost") {
        if (!this.title && !this.content) return;
      }
      setTimeout(() => {
        this.saveToDraftBase()
          .then(() => {
            const postButton = getPostButton();
            postButton.saveToDraftSuccess();
            this.autoSaveToDraft();
          })
          .catch(data => {
            sweetError("草稿保存失败：" + (data.error || data));
            this.autoSaveToDraft();
          });
      }, this.saveDraftTimeout);
    },
    saveToDraftBase() {
      if (!this.content) return sweetError("请先输入内容");
      return Promise.resolve()
        .then(() => {
          // 获取本次编辑器内容的全部长度
          const allContentLength = editor.getContent();
          // 如果内容相对上一次减少了就提示用户是否需要保存
          if (allContentLength.length < this.oldContentLength) {
            return sweetQuestion(`您输入的内容发生了变化，是否还要继续保存？`)
              .then(() => {
                return;
              })
              .catch(err => {
                sweetError(err);
              });
          } else {
            return;
          }
        })
        .then( ()=> {
          let post = this.getPost();
          let desType, desTypeId;
          let type = this.type;
          if (type === "newThread") {
            desType = "forum";
          } else if (type === "newPost") {
            desType = "thread";
            desTypeId = this.thread.tid;
          } else if (type === "modifyPost") {
            desType = "post";
            desTypeId = this.post.pid;
          } else if (type === "modifyThread") {
            desType = "post";
            desTypeId = this.post.pid;
          } else if (type === "modifyForumDeclare") {
            desType = "forumDeclare";
            desTypeId = this.forum.fid;
          } else if (type === "modifyForumLatestNotice") {
            desType = "forumLatestNotice";
            desTypeId = this.forum.fid;
          } else {
            throw "未知的草稿类型";
          }
          let formData = new FormData();
          formData.append(
            "body",
            JSON.stringify({
              post: post,
              draftId: this.draftId,
              desType: desType,
              desTypeId: desTypeId
            })
          );
          if (this.coverData) {
            formData.append(
              "postCover",
              NKC.methods.blobToFile(this.coverData),
              "cover.png"
            );
          }
          // 保存草稿
          // 当编辑器中的字数减少时提示用户是否需要保存，避免其他窗口的自动保存覆盖内容
          return nkcUploadFile(
            "/u/" + NKC.configs.uid + "/drafts",
            "POST",
            formData
          );
        })
        .then( data=> {
          //保存草稿的全部内容长度
          if (data.contentLength) {
            this.oldContentLength = data.contentLength;
          }
          this.draftId = data.draft.did;
          if (data.draft.cover) {
            this.coverData = "";
            this.coverUrl = "";
            this.cover = data.draft.cover;
          }
          return Promise.resolve();
        })
        .then( res=> {
          const postButton = getPostButton();
          postButton.saveToDraftSuccess();
          sweetSuccess("草稿已保存");
        })
        .catch( data=> {
          sweetError("草稿保存失败：" + (data.error || data));
        });
    },
    checkAuthorInfos() {
      let checkAuthorInfos = this.checkAuthorInfos;
      for (let i = 0; i < checkAuthorInfos.length; i++) {
        let info = checkAuthorInfos[i];
        this.checkString(info.name, {
          name: "作者姓名",
          minLength: 1,
          maxLength: 100
        });
        this.checkString(info.kcid, {
          name: this.websiteUserId,
          minLength: 0,
          maxLength: 100
        });
        this.checkString(info.agency, {
          name: "机构名称",
          minLength: 0,
          maxLength: 100
        });
        this.checkString(info.agencyAdd, {
          name: "机构地址",
          minLength: 0,
          maxLength: 100
        });
        if (!info.isContract) continue;
        // 检测邮箱
        this.checkEmail(info.contractObj.contractEmail);
        this.checkString(info.contractObj.contractEmail, {
          name: "通信邮箱",
          minLength: 1,
          maxLength: 200
        });
        this.checkString(info.contractObj.contractTel, {
          name: "通信电话",
          minLength: 0,
          maxLength: 100
        });
        this.checkString(info.contractObj.contractAdd, {
          name: "通信地址",
          minLength: 0,
          maxLength: 200
        });
        this.checkString(info.contractObj.contractCode, {
          name: "通信邮编",
          minLength: 0,
          maxLength: 100
        });
      }
    },
    // 检测标题
    checkTitle() {
      if (this.title.length < 3) throw new Error("标题不能少于3个字");
      if (this.title.length > 100) throw new Error("标题不能超过100个字");
    },
    // 检测内容
    checkContent() {
      let contentText = $(this.content).text();
      if (contentText.length > 100000) {
        throw new Error("内容不能超过10万字");
      }
      if (contentText.length < 2) {
        throw new Error("内容不能少于2个字");
      }
    },
    // 检测摘要
    checkAbstract() {
      this.checkString(this.abstractCn, {
        name: "中文摘要",
        minLength: 0,
        maxLength: 1000
      });
      this.checkString(this.abstractEn, {
        name: "英文摘要",
        minLength: 0,
        maxLength: 1000
      });
    },
    // 检测已选专业
    checkForums() {
      if (!this.selectedForumsId.length) throw "请至少选择一个专业";
      for (let i = 0; i < this.selectedForums.length; i++) {
        let f = this.selectedForums[i];
        if (f.cid === null) throw "请选择完整的专业分类";
      }
    },
    // 检测关键词
    checkKeywords() {
      if (this.keywordsLength > 50) throw "关键词数量超出限制";
    },
    //拿取其他组件数据
    readyData(){
      this.$emit('ready-data', data => this.submit(data))
    },
    submit() {
      let post = {},
        type;
      Promise.resolve()
        .then(() => {
          // 锁住发表按钮
          this.disablePostButton();
          type = this.type;
          post = this.getPost();
        })
        .then(() => {
          if (type === "newThread") {
            // 发新帖：从专业点发表、首页点发表、草稿箱
            this.checkTitle();
            this.checkContent();
            this.checkAbstract();
            this.checkForums();
            this.checkThreadCategory();
            this.checkKeywords();
            this.checkAuthorInfos();
            let formData = new FormData();
            formData.append("body", JSON.stringify({ post: post }));
            if (this.coverData) {
              formData.append(
                "postCover",
                NKC.methods.blobToFile(this.coverData),
                "cover.png"
              );
            }
            return nkcUploadFile("/f/" + post.fids[0], "POST", formData);
          } else if (type === "newPost") {
            // 发表回复：从文章页点"去编辑器"、草稿箱
            this.checkString(this.title, {
              name: "标题",
              minLength: 0,
              maxLength: 200
            });
            this.checkContent();
            return nkcAPI("/t/" + this.thread.tid, "POST", { post: post });
          } else if (type === "modifyPost") {
            // 修改post
            this.checkString(this.title, {
              name: "标题",
              minLength: 0,
              maxLength: 200
            });
            this.checkContent();
            let formData = new FormData();
            formData.append("body", JSON.stringify({ post: post }));
            if (this.coverData) {
              formData.append(
                "postCover",
                NKC.methods.blobToFile(this.coverData),
                "cover.png"
              );
            }
            return nkcUploadFile("/p/" + this.post.pid, "PUT", formData);
          } else if (type === "modifyThread") {
            // 修改thread
            this.checkTitle();
            this.checkContent();
            this.checkAbstract();
            this.checkKeywords();
            this.checkAuthorInfos();
            let formData = new FormData();
            formData.append("body", JSON.stringify({ post: post }));
            if (this.coverData) {
              formData.append(
                "postCover",
                NKC.methods.blobToFile(this.coverData),
                "cover.png"
              );
            }
            return nkcUploadFile("/p/" + this.post.pid, "PUT", formData);
          }
        })
        .then(data => {
          editor.removeNoticeEvent();
          this.showCloseInfo = false;
          if (NKC.configs.platform === "reactNative") {
            NKC.methods.visitUrlAndClose(data.redirect);
          } else if (NKC.configs.platform === "apiCloud") {
            this.visitUrl(data.redirect || "/");
            setTimeout(function() {
              api.closeWin();
            }, 1000);
          } else {
            this.visitUrl(data.redirect || "/");
          }
          // 解锁发表按钮
          // PostButton.disabledSubmit = false;
        })
        .catch(err => {
          // 解锁发表按钮
          this.enablePostButton();
          sweetError(err);
        });
    }
  }
};
</script>

<style scope>
.editor-auto-save {
  padding: 0.5rem 0;
  color: #9baec8;
}
.modifySubmit{
  position: fixed;
}
</style>
