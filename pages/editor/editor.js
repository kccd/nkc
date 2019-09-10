var editor;
var CommonModal;
var PostInfo, PostButton;
// 标志：编辑器是否已初始化
var EditorReady = false;
var data;
$(function() {
  data = NKC.methods.getDataById("data");
  editor = UE.getEditor("content", NKC.configs.editor.defaultOptions);
  editor.addListener( 'ready', function( editor ) {
    resetBodyPaddingTop();
    EditorReady = true;
    initVueApp();
  });
});

function initVueApp() {
  PostInfo = new Vue({
    el: "#postInfo",
    data: {

      type: "newThread",

      thread: "",

      forums: [],
      selectedForums: [], // 已选择的专业

      abstractCn: "", // 中文摘要
      abstractEn: "", // 英文摘要

      title: "", // 文章标题
      content: "", // 文章内容

      keyWordsCn: [], // 中文关键词
      keyWordsEn: [], // 英文关键词

      authorInfos: [], // 作者信息

      originState: 0, // 原创声明

    },
    mounted: function() {
      this.selectedForums = data.mainForums || [];
      this.thread = data.thread;
      this.type = data.type;
      this.initPost(data.post);
    },
    computed: {
      // 关键词字数
      keywordsLength: function() {
        return this.keyWordsEn.length + this.keyWordsCn.length;
      },
      // 摘要的字节数
      abstractCnLength: function() {
        return this.getLength(this.abstractCn);
      },
      abstractEnLength: function() {
        return this.getLength(this.abstractEn);
      },
      // 获取已选择专业ID组成的数组
      selectedForumsId: function() {
        var arr = [];
        var selectedForums = this.selectedForums;
        for(var i = 0; i < selectedForums.length; i++) {
          var forum = selectedForums[i];
          if(forum.fid) arr.push(forum.fid);
        }
        return arr;
      },
      // 获取已选择文章分类ID组成的数组
      selectedCategoriesId: function() {
        var arr = [];
        var selectedForums = this.selectedForums;
        for(var i = 0; i < selectedForums.length; i++) {
          var forum = selectedForums[i];
          if(forum.cid) arr.push(forum.cid);
        }
        return arr;
      }
    },
    methods: {
      getLength: NKC.methods.checkData.getLength,
      checkString: NKC.methods.checkData.checkString,
      checkEmail: NKC.methods.checkData.checkEmail,
      visitUrl: NKC.methods.visitUrl,
      initPost: function(post) {
        if(!post) return;
        this.title = post.t;
        this.content = post.c;
        this.abstractCn = post.abstractCn;
        this.abstractEn = post.abstractEn;
        this.keyWordsCn = post.keyWordsCn;
        this.keyWordsEn = post.keyWordsEn;
        this.authorInfos = post.authorInfos;
      },
      getTitle: function() {
        this.title = $("#title").val();
      },
      setTitle: function() {
        $("#title").val(this.title);
      },
      getContent: function() {
        if(!EditorReady) {
          return sweetError("编辑器尚未初始化");
        } else {
          this.content = editor.getContent();
        }
      },
      setContent: function() {
        if(!EditorReady) {
          return sweetError("编辑器尚未初始化");
        } else {
          editor.setContent(this.content);
        }
      },
      // 添加作者信息
      addAuthor: function() {
        var authorInfos = this.authorInfos;
        authorInfos.push({
          name: "",
          kcid: "",
          agency: "",
          agencyCountry: "",
          agencyAdd: "",
          isContract: false,
          contractObj: {
            contractEmail: "",
            contractTel: "",
            contractAdd: "",
            contractCode: ""
          }
        });
      },
      // 上/下移动作者信息
      moveAuthor: function(index, type) {
        var authorInfos = this.authorInfos;
        var otherIndex;
        if(type === "up") {
          if(index === 0) return;
          otherIndex = index - 1;
        } else {
          if((index + 1) === authorInfos.length) return;
          otherIndex = index + 1;
        }
        var info = authorInfos[index];
        authorInfos[index] = authorInfos[otherIndex];
        authorInfos[otherIndex] = info;
        Vue.set(authorInfos, 0, authorInfos[0]);
      },
      // 移除作者信息
      removeAuthor: function(index, arr) {
        sweetQuestion("确定要删除该条作者信息？")
          .then(function() {
            arr.splice(index, 1);
          });

      },
      // 移除关键词
      removeKeyword: function(index, arr) {
        arr.splice(index, 1);
      },
      // 通过fid找到forum对象
      getForumById: function(fid) {
        var forums = this.forums;
        for(var i = 0; i < forums.length; i++) {
          var forum = forums[i];
          if(forum.fid === fid) return forum;
        }
      },
      // 移除已选择的专业
      removeSelectedForums: function(index) {
        this.selectedForums.splice(index, 1);
      },
      // 添加关键词，借助commonModal模块
      addKeyword: function() {
        var self = this;
        if(!NKC.modules.CommonModal) {
          return sweetError("未引入表单模块");
        }
        if(!window.CommonModal) {
          window.CommonModal = new NKC.modules.CommonModal();
        }
        CommonModal.open(function(data) {
          self.keyWordsEn = [];
          self.keyWordsCn = [];
          var keywordCn = data[0].value;
          var keywordEn = data[1].value;
          var cnArr = keywordCn.split("，");
          var enArr = keywordEn.split(",");
          for(var i = 0; i < cnArr.length; i++) {
            var cn = cnArr[i];
            cn = cn.trim();
            if(cn && self.keyWordsCn.indexOf(cn) === -1) {
              self.keyWordsCn.push(cn);
            }
          }
          for(var i = 0; i < enArr.length; i++) {
            var en = enArr[i];
            en = en.trim();
            if(en && self.keyWordsEn.indexOf(en) === -1) {
              self.keyWordsEn.push(en);
            }
          }
          if(!cnArr.length && !enArr.length) return sweetError("请输入关键词");
          CommonModal.close();
        }, {
          data: [
            {
              label: "中文，添加多个请以中文逗号分隔",
              dom: "textarea",
              value: this.keyWordsCn.join("，")
            },
            {
              label: "英文，添加多个请以英文逗号分隔",
              dom: "textarea",
              value: this.keyWordsEn.join(",")
            }
          ],
          title: "添加关键词"
        });
      },
      // 选择专业，借助moveThread模块
      selectForums: function() {
        var self = this;
        if(!NKC.modules.MoveThread) {
          return sweetError("未引入专业选择模块");
        }
        if(!window.MoveThread) {
          window.MoveThread = new NKC.modules.MoveThread();
        }
        MoveThread.open(function(data) {
          self.selectedForums = data.forums;
          MoveThread.close();
        }, {
          hideMoveType: true,
          forumCountLimit: 2,
          selectedForumsId: this.selectedForumsId,
          selectedCategoriesId: this.selectedCategoriesId
        });
      },
      // 检测作者信息
      checkAuthorInfos: function() {
        var checkAuthorInfos = this.checkAuthorInfos;
        for(var i = 0; i < checkAuthorInfos.length; i++) {
          var info = checkAuthorInfos[i];
          this.checkString(info.name, {
            name: "作者姓名",
            minLength: 1,
            maxLength: 100
          });
          this.checkString(info.kcid, {
            name: "KCID",
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
          if(!info.isContract) continue;
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
      checkTitle: function() {
        this.checkString(this.title, {
          name: "标题",
          minLength: 6,
          maxLength: 200
        });
      },
      // 检测内容
      checkContent: function() {
        this.checkString(this.content, {
          name: "内容",
          minLength: 1,
          maxLength: 100000
        });
      },
      // 检测摘要
      checkAbstract: function() {
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
      checkForums: function() {
        if(!this.selectedForumsId.length) throw "请至少选择一个专业";
      },
      // 检测关键词
      checkKeywords: function() {
        if(this.keywordsLength > 50) throw "关键词数量超出限制"
      },
      // 提交内容
      submit: function() {
        var self = this;
        var post = {}, type;
        Promise.resolve()
          .then(function() {
            // 锁住发表按钮
            PostButton.disabledSubmit = true;
            self.getTitle();
            self.getContent();
            type = self.type;
            post.abstractCn = self.abstractCn;
            post.abstractEn = self.abstractEn;
            post.t = self.title;
            post.fids = self.selectedForumsId;
            post.cids = self.selectedCategoriesId;
            post.c = self.content;
            post.authorInfos = self.authorInfos;
            post.originState = self.originState;
          })
          .then(function() {
            if(type === "newThread") { // 发新帖：从专业点发表、首页点发表、草稿箱
              self.checkTitle();
              self.checkContent();
              self.checkAbstract();
              self.checkForums();
              self.checkKeywords();
              self.checkAuthorInfos();
              return nkcAPI("/f/" + post.fids[0], "POST", {post: post})
            } else if(type === "newPost") { // 发表回复：从文章页点"去编辑器"、草稿箱
              self.checkContent();
            } else if(type === "modifyPost") { // 修改post：编辑post，草稿箱
              self.checkContent();
            } else if(type === "forumDeclare") { // 修改专业详情：专业设置
              self.checkContent();
            }
          })
          .then(function() {
            sweetSuccess("发表成功");
            // 解锁发表按钮
            PostButton.disabledSubmit = false;
          })
          .catch(function(data) {
            // 解锁发表按钮
            PostButton.disabledSubmit = false;
            console.log(data);
            sweetError(data);
          })
      }
    }
  });
  PostButton = new Vue({
    el: "#postButton",
    data: {
      disabledSubmit: false, // 锁定提交按钮
      checkProtocol: true, // 是否勾选协议
    },
    methods: {
      submit: function() {
        PostInfo.submit();
      }
    }
  })
}

// 根据导航栏和工具栏的高度重置body的padding-top
function resetBodyPaddingTop() {
  var header = $(".navbar.navbar-default.navbar-fixed-top.nkcshade");
  var tools = $(".edui-editor-toolbarbox.edui-default");
  var height = header.height() + tools.height();
  $("body").css("padding-top", height + 40);
}

window.onresize=function(){
  resetBodyPaddingTop();
};

