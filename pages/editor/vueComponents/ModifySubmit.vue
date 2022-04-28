<template lang="pug">
.modifySubmit
  h5.text-danger 温馨提示：
  .pre-wrap {{ notice }}
  div(v-cloak)
    hr
    .checkbox(v-if="havePermissionToSendAnonymousPost")
      label
        input(
          type="checkbox",
          v-model="anonymous",
          :value="true",
          :disabled="!allowedAnonymous"
        )
        span
          | 匿名发表
          span.text-danger(v-if="!allowedAnonymous") (所选专业分类不支持匿名发表)
    .checkbox
      label
        input.agreement(type="checkbox", v-model="checkProtocol", :value="true")
        span
          | 我已阅读并同意遵守与本次发表相关的全部协议。
          a(href="/protocol", target="_blank") 查看协议
    .checkbox
      .editor-auto-save(v-if="autoSaveInfo")
        .fa.fa-check-circle &nbsp;{{ autoSaveInfo }}
    .btn-area
      button.btn.btn-theme(
        @click="readyData",
        :disabled="disabledSubmit || !checkProtocol"
      ) {{ disabledSubmit ? '提交中...' : '提交' }}
      button.btn.btn-default(@click="saveToDraftBase('manual')") 存草稿
</template>

<script>
import { nkcAPI, nkcUploadFile } from "../../lib/js/netAPI";
import { sweetError, sweetQuestion2 } from "../../lib/js/sweetAlert.js";
import { timeFormat } from "../../lib/js/tools";
import { screenTopWarning } from "../../lib/js/topAlert";

export default {
  props: {
    notice: {
      type: String,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    type: "newThread",
    disabledSubmit: false, // 锁定提交按钮
    checkProtocol: true, // 是否勾选协议
    // 当前用户是否有权限发表匿名内容
    havePermissionToSendAnonymousPost: false,
    // 允许发表匿名内容的专业ID
    allowedAnonymousForumsId: [],
    // 根据当前所选专业判断用户是否有权限勾选匿名，若无权则此处无需将匿名标志提交到服务器。（新发表时不匿名，修改时无法需改匿名标志）
    allowedAnonymous: false,
    // 是否匿名
    anonymous: false,
    autoSaveInfo: "",
    oldContent: "",
    oldContentLength: "",
    saveDraftTimeout: 60000,
    saveData: '',
    setInterval: '',
  }),
  watch: {
    data(n) {
      this.allowedAnonymousForumsId = n?.allowedAnonymousForumsId || [];
      this.havePermissionToSendAnonymousPost =
        n?.havePermissionToSendAnonymousPost || false;
      if (n?.post) this.oldContent = n.post.c;
      if (n?.type) this.type = n.type;
      if (n?.forum) this.forum = n.forum;
      if (n?.threda) this.threda = n.threda;
      if (n?.post?.pid) this.pid = n.post.pid;
    },
  },
  computed: {
    selectedForumsId() {
      let arr = [];
      let selectedForums = this.selectedForums;
      for (let i = 0; i < selectedForums.length; i++) {
        let forum = selectedForums[i];
        if (forum.fid) arr.push(forum.fid);
      }
      return arr;
    },
  },
  mounted() {
    this.setInterval = setInterval(this.autoSaveToDraft, this.saveDraftTimeout);
  },
  destroyed(){
    clearInterval(this.setInterval)
  },
  methods: {
    checkString: NKC.methods.checkData.checkString,
    checkEmail: NKC.methods.checkData.checkEmail,
    visitUrl: NKC.methods.visitUrl,
    checkAnonymous(selectedForumsId) {
      // let selectedForumsId = window.PostInfo.selectedForumsId;
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
      this.readyDataForSave();
      let type = this.type;
      const { saveData } = this;
      // 内容为空时不自动保存草稿,不做任何操作
      if (!saveData.c) return;
      if (type === "newThread") {
        if (
          !(
            saveData.t ||
            saveData.c ||
            !saveData.tcId ||
            this.tcId.length ||
            saveData.cids.length ||
            saveData.fids.length ||
            saveData.cover ||
            saveData.abstractCn ||
            saveData.abstractEn ||
            saveData.keyWordsCn.length ||
            saveData.keyWordsEn.length ||
            saveData.authorInfos ||
            saveData.surveyId
          )
        )
          return;
      } else if (type === "newPost") {
        if (!saveData.title && !saveData.content) return;
      }
      // setTimeout(() => {
        this.saveToDraftBase("automatic")
          // .then(() => {
          //   this.autoSaveToDraft();
          // })
          .catch((data) => {
            sweetError("草稿保存失败：" + (data.error || data));
            // this.autoSaveToDraft();
          });
      // }, this.saveDraftTimeout);
    },
    saveToDraftBase(savetType = "manual") {
      if (savetType === "manual") this.readyDataForSave();
      const { saveData } = this;
      if (!saveData.c) return sweetError("请先输入内容");
      let type = this.type;

      return Promise.resolve()
        .then(() => {
          // 获取本次编辑器内容的全部长度
          // const allContentLength = editor.getContent();
          if (saveData.c.length < this.oldContent.length) {
            clearInterval(this.setInterval);
            this.setInterval = '';
            return sweetQuestion2(`您输入的内容发生了变化，是否还要继续保存？`)
              .finally( ()=>{
                this.setInterval = setInterval(this.autoSaveToDraft, this.saveDraftTimeout)
              } )
          } else {
            return;
          }
        })
        .then((res) => {
          // let post = this.getPost();
          let desType, desTypeId;
          if (type === "newThread") {
            desType = "forum";
          } else if (type === "newPost") {
            desType = "thread";
            desTypeId = this.thread.tid;
          } else if (type === "modifyPost") {
            desType = "post";
            desTypeId = this.pid;
          } else if (type === "modifyThread") {
            desType = "post";
            desTypeId = this.pid;
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
              post: saveData,
              draftId: this.draftId,
              desType: desType,
              desTypeId: desTypeId,
            })
          );
          if (saveData.coverData) {
            formData.append(
              "postCover",
              NKC.methods.blobToFile(saveData.coverData),
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
        .then((data) => {
          //保存草稿的全部内容长度
          if (data.contentLength) {
            this.oldContentLength = data.draft?.c?.length;
            this.oldContent = data.draft?.c;
          }
          this.draftId = data.draft.did;
          if (data.draft.cover) {
            this.coverData = "";
            this.coverUrl = "";
            this.cover = data.draft.cover;
          }
          return Promise.resolve();
        })
        .then((res) => {
          // const postButton = getPostButton();
          if (type === "manual") {
            sweetSuccess("草稿已保存");
          }
          this.saveToDraftSuccess();
        })
        .catch((data) => {
          if(data === '用户取消保存'){
            screenTopWarning(data)
            return
          }
          sweetError("草稿保存失败：" + (data.error || data));
        })
    },
    checkAuthorInfos(arr) {
      for (let i = 0; i < arr.length; i++) {
        let info = arr[i];
        this.checkString(info.name, {
          name: "作者姓名",
          minLength: 1,
          maxLength: 100,
        });
        this.checkString(info.kcid, {
          name: this.websiteUserId,
          minLength: 0,
          maxLength: 100,
        });
        this.checkString(info.agency, {
          name: "机构名称",
          minLength: 0,
          maxLength: 100,
        });
        this.checkString(info.agencyAdd, {
          name: "机构地址",
          minLength: 0,
          maxLength: 100,
        });
        if (!info.isContract) continue;
        // 检测邮箱
        this.checkEmail(info.contractObj.contractEmail);
        this.checkString(info.contractObj.contractEmail, {
          name: "通信邮箱",
          minLength: 1,
          maxLength: 200,
        });
        this.checkString(info.contractObj.contractTel, {
          name: "通信电话",
          minLength: 0,
          maxLength: 100,
        });
        this.checkString(info.contractObj.contractAdd, {
          name: "通信地址",
          minLength: 0,
          maxLength: 200,
        });
        this.checkString(info.contractObj.contractCode, {
          name: "通信邮编",
          minLength: 0,
          maxLength: 100,
        });
      }
    },
    // 检测标题
    checkTitle(v) {
      if (!v) {
        throw new Error("标题不能少于3个字");
      }
      if (v.length < 3) throw new Error("标题不能少于3个字");
      if (v.length > 100) throw new Error("标题不能超过100个字");
    },
    // 检测内容
    checkContent(v) {
      let contentText = $(v).text();
      if (contentText.length > 100000) {
        throw new Error("内容不能超过10万字");
      }
      if (contentText.length < 2) {
        throw new Error("内容不能少于2个字");
      }
    },
    // 检测摘要
    checkAbstract(cn, en) {
      this.checkString(cn, {
        name: "中文摘要",
        minLength: 0,
        maxLength: 1000,
      });
      this.checkString(en, {
        name: "英文摘要",
        minLength: 0,
        maxLength: 1000,
      });
    },
    // 检测已选专业
    checkForums(v) {
      if (!v.length) throw "请至少选择一个专业";
      for (let i = 0; i < v.length; i++) {
        let f = v[i];
        if (f.cid === null) throw "请选择完整的专业分类";
      }
    },
    checkThreadCategory(v) {
      for (const tc of v) {
        if (tc.selectedNode === null) {
          throw new Error(`请选择${tc.name}`);
        }
      }
    },
    // 检测关键词
    checkKeywords(cn, en) {
      if (cn.length + en.length > 50) throw "关键词数量超出限制";
    },
    //拿取其他组件数据
    readyData() {
      this.$emit("ready-data", (submitData) => this.submit(submitData));
    },
    // 获取其他组件数据 保存时使用
    readyDataForSave() {
      this.$emit("ready-data", (data) => {
        this.saveData = data;
      });
    },
    submit(submitData) {
      let type;
      Promise.resolve()
        .then(() => {
          // 锁住发表按钮
          this.disabledSubmit = true;
          type = this.type;
        })
        .then(() => {
          if (type === "newThread") {
            // 发新帖：从专业点发表、首页点发表、草稿箱
            this.checkTitle(submitData.t);
            this.checkContent(submitData.c);
            this.checkAbstract(submitData.abstractCn, submitData.abstractEn);
            this.checkForums(submitData.fids);
            this.checkThreadCategory(this.data.threadCategories);
            this.checkKeywords(submitData.keyWordsCn, submitData.keyWordsEn);
            this.checkAuthorInfos(submitData.authorInfos);
            let formData = new FormData();
            formData.append("body", JSON.stringify({ post: submitData }));
            if (submitData.coverData) {
              formData.append(
                "postCover",
                NKC.methods.blobToFile(submitData.coverData),
                "cover.png"
              );
            }
            return nkcUploadFile("/f/" + submitData.fids[0], "POST", formData);
          } else if (type === "newPost") {
            // 发表回复：从文章页点"去编辑器"、草稿箱
            this.checkString(submitData.t, {
              name: "标题",
              minLength: 0,
              maxLength: 200,
            });
            this.checkContent(submitData.c);
            return nkcAPI("/t/" + this.data?.thread?.tid, "POST", {
              post: submitData,
            });
          } else if (type === "modifyPost") {
            // 修改post
            this.checkString(submitData.t, {
              name: "标题",
              minLength: 0,
              maxLength: 200,
            });
            this.checkContent(submitData.c);
            let formData = new FormData();
            formData.append("body", JSON.stringify({ post: submitData }));
            if (submitData.coverData) {
              formData.append(
                "postCover",
                NKC.methods.blobToFile(submitData.coverData),
                "cover.png"
              );
            }
            return nkcUploadFile("/p/" + this.pid, "PUT", formData);
          } else if (type === "modifyThread") {
            // 修改thread
            this.checkTitle(submitData.t);
            this.checkContent(submitData.c);
            this.checkAbstract(submitData.abstractCn, submitData.abstractEn);
            this.checkKeywords(submitData.keyWordsCn, submitData.keyWordsEn);
            this.checkAuthorInfos(submitData.authorInfos);
            let formData = new FormData();
            formData.append("body", JSON.stringify({ post: submitData }));
            if (submitData.coverData) {
              formData.append(
                "postCover",
                NKC.methods.blobToFile(submitData.coverData),
                "cover.png"
              );
            }
            return nkcUploadFile("/p/" + this.pid, "PUT", formData);
          }
        })
        .then((data) => {
          this.$emit("remove-editor");
          if (NKC.configs.platform === "reactNative") {
            NKC.methods.visitUrlAndClose(data.redirect);
          } else if (NKC.configs.platform === "apiCloud") {
            this.visitUrl(data.redirect || "/");
            setTimeout(function () {
              //  api ？？？
              api.closeWin();
            }, 1000);
          } else {
            this.visitUrl(data.redirect || "/");
          }
        })
        .catch((err) => {
          // 解锁发表按钮
          this.disabledSubmit = false;

          sweetError(err);
        });
    },
    getData() {
      return {
        anonymous: this.anonymous,
        checkProtocol: this.checkProtocol,
      };
    },
  },
};
</script>

<style scoped lang="less">

.col-md-3 {
  width: 25%;
}
.col-xs-12{
  width: 100%;
}
@media screen and (max-width: 992px) {
  .col-xs-12 {
    width: 100%;
  }
  .modifySubmit {
    margin: auto;
    position: static;
    width: 100%;
  }
  .btn-area{
    text-align: left;
  }
}
// @media (min-width: 992px){
// }
.btn-area{
  .btn:nth-child(1){
    margin-right: 10px;
  }
}
.editor-auto-save {
  min-height: 2.6rem;
  padding: 0.5rem 0;
  color: #9baec8;
}
.modifySubmit {
  // background-color: transparent!important;
  button{
    max-width: 10rem;
    min-width: 6rem;
    @media (max-width: 1100px) {
      min-width: 0;
    }
  }
  @media (min-width: 992px) {
    max-width: 25rem;
    position: fixed;
  }
}
</style>
