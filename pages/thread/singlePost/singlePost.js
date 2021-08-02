class SinglePostModule {
  constructor() {
    this.editors = {};
    this.tid = null;
    // 如果不允许评论，此字段为相关说明
    this.cWriteInfo = true;
    this.postPermission = {
      permit: false,
      warning: null
    };
    this.sendAnonymousPost = false;
  }
  getPostHeightFloat() {
    let postHeight = $('.hidden[data-type="hidePostContentSettings"]');
    if(!postHeight.length) throw '未读取到与post内容隐藏相关的配置';
    postHeight = NKC.methods.strToObj(postHeight.html());
    return postHeight.float;
  }
  // 获取后台有关post高度的配置
  // 根据屏幕尺寸判断是否需要隐藏
  getPostMaxHeight() {
    const DW = $(document).width();
    let postHeight = $('.hidden[data-type="hidePostContentSettings"]');
    if(!postHeight.length) throw '未读取到与post内容隐藏相关的配置';
    postHeight = NKC.methods.strToObj(postHeight.html());
    let hidePostMaxHeight;
    if(DW < 768) {
      hidePostMaxHeight = postHeight.xs;
    } else if(DW < 992) {
      hidePostMaxHeight = postHeight.sm;
    } else {
      hidePostMaxHeight = postHeight.md;
    }
    return hidePostMaxHeight;
  }
  // 自动获取post列表、判断高度以及属性然后隐藏满足条件的post
  autoHidePostContent() {
    const containers = $('.single-post-container');
    for(let i = 0; i < containers.length; i++) {
      const c = containers.eq(i);
      const hide = c.attr('data-hide');
      const pid = c.attr('data-pid');
      if(hide === 'not') continue;
      const hidePostMaxHeight = this.getPostMaxHeight();
      const contentHeight = c.find('.single-post-center').height();
      if(contentHeight > hidePostMaxHeight) {
        this.hidePostContent(pid);
      }
    }
  }
  // 隐藏post内容
  hidePostContent(pid) {
    const container = $(`.single-post-container[data-pid="${pid}"]`);
    const postCenter = container.find('.single-post-center');
    const hidePostFloat = this.getPostHeightFloat();
    const hidePostMaxHeight = this.getPostMaxHeight();
    postCenter.css({
      "max-height": hidePostMaxHeight * hidePostFloat + "px"
    });
    const buttonContainer = container.find('.switch-hidden-status');
    const button = buttonContainer.find('.switch-hidden-status-button');
    button.html(`<div class="fa fa-angle-down"><strong> 加载全文</strong></div>`);
    container.attr('data-hidden', 'true');
    buttonContainer.removeClass('hidden');
  }
  // 取消隐藏post内容
  showPostContent(pid) {
    const container = $(`.single-post-container[data-pid="${pid}"]`);
    const postCenter = container.find('.single-post-center');
    postCenter.css({
      "max-height": 'none'
    });
    const buttonContainer = container.find('.switch-hidden-status');
    const button = buttonContainer.find('.switch-hidden-status-button');
    button.html(`<div class="fa fa-angle-up"> 收起</div>`);
    container.attr('data-hidden', 'false');
    buttonContainer.removeClass('hidden');
  }
  // 切换post隐藏状态
  switchPostContent(pid) {
    const container = $(`.single-post-container[data-pid="${pid}"]`);
    const hidden = container.attr('data-hidden');
    if(hidden === 'true') {
      const scrollY = $(document).scrollTop();
      this.showPostContent(pid);
      scrollTo(0, scrollY);
    } else {
      const pagePosition = new NKC.modules.PagePosition();
      this.hidePostContent(pid);
      pagePosition.restore();
    }
  }
  // 获取回复最外层dom
  getPostContainer(pid) {
    return $(`.single-post-container[data-pid="${pid}"]`);
  }
  // 获取评论框最外层dom
  getCommentContainer(pid) {
    return $(`[data-type="singlePostCommentContainer"][data-pid="${pid}"]`);
  }
  // 获取单条评论最外层
  getSingleComment(pid) {
    return $(`.single-comment[data-pid="${pid}"]`);
  }
  // 获取控制评论显示与隐藏的按钮
  getCommentButton(pid) {
    return $(`[data-type="singlePostCommentButton"][data-pid="${pid}"]`);
  }
  // 获取编辑器以及编辑器上的提示
  createCommentElements(pid) {
    let comments = $(`.single-comments[data-pid="${pid}"]`);
    if(!comments.length) comments = $(`<div class="single-comments" data-pid="${pid}"></div>`);
    return comments;
  }
  getPages(pid, paging) {
    let pages = $(`.single-comment-paging[data-pid="${pid}"]`);
    if(!pages.length) pages = $(`<div class="single-comment-paging" data-pid="${pid}"></div>`);
    pages.html("");
    for(const button of paging.buttonValue) {
      const b = $(`<span class="${button.type}">..</span>`);
      if(button.type !== 'null') {
        b.text(button.num + 1);
        b.attr('onclick', `NKC.methods.getPostCommentsByPage('${pid}', ${button.num})`)
      }
      pages.append(b);
    }
    return pages;
  }
  // 展开评论 添加或移除post背景
  switchPostBackgroundColor(pid, show) {
    const postContainer = this.getPostContainer(pid);
    postContainer.attr('data-show-comments', show? 'true': 'false');
  }
  showPostComment(pid, page = 0, options={}) {
    const {highlightCommentId = null} = options;
    this.removeAllEditorApp(pid);
    const self = this;
    const container = this.getCommentContainer(pid);
    this.switchPostBackgroundColor(pid, true);
    const button = this.getCommentButton(pid);

    const _loadDom = container.find('.single-post-comment-loading');
    const _errorDom = container.find('.single-post-comment-error');
    if(_loadDom.length > 0) {
      _loadDom.remove();
    }
    if(_errorDom.length > 0) {
      _errorDom.remove();
    }
    const loading = $(`<div class="single-post-comment-loading"><div class='fa fa-spinner fa-spin'></div>加载中...</div>`);
    if(container.attr('data-opened') !== 'true') {
      container.append(loading);
    }
    container.attr('data-hide', 'false');
    button.attr('data-show-number', 'false');
    this.renderPostCommentNumber(pid);
    this.getPostComments(pid, page)
      .then(data => {
        loading.remove();
        const {tid, htmlContent, paging, postPermission} = data;
        if(paging.page+1 >= paging.pageCount) {
          container.attr('data-last-page', 'true')
        } else {
          container.attr('data-last-page', 'false')
        }
        self.postPermission = postPermission;
        self.tid = tid;
        self.sendAnonymousPost = data.sendAnonymousPost;
        const comments = this.createCommentElements(pid);
        comments.html(htmlContent);
        const pagesDom = self.getPages(pid, paging);
        if(container.attr('data-opened') !== 'true') {
          container.append(pagesDom);
          container.append(comments);
          container.append(pagesDom.clone(true));
          container.attr('data-opened', 'true');
        }
        const editorApp = self.getEditorApp(pid, container, {
          cancelEvent: 'switchPostComment',
          keepOpened: true,
          position: 'bottom'
        });
        this.cWriteInfo = data.cWriteInfo;
        if(!data.cWriteInfo) {
          editorApp.show = true;
          editorApp.container.show();
        } else {
          container.append($(`<div class="text-danger single-post-comment-error">${data.cWriteInfo}</div>`));
        }
        if(highlightCommentId) {
          const targetComment = $(`.single-comment[data-pid="${highlightCommentId}"]>.single-comment-center`);
          NKC.methods.scrollToDom(targetComment);
          NKC.methods.markDom(targetComment);
        }
        self.autoSaveDraft(pid);
      })
      .then(() => {
        self.initNKCSource();
      })
      .catch(data => {
        const errorDom = $(`<div class="single-post-comment-error text-danger">${data.error || data.message || data}</div>`);
        container.html(errorDom);
      });
  }
  initNKCSource() {
    floatUserPanel.initPanel();
    NKC.methods.initSharePanel();
    NKC.methods.initPostOption();
    NKC.methods.initStickerViewer();
    if(!NKC.configs.isApp) NKC.methods.initImageViewer();
    NKC.methods.initVideo();
  }
  // 移除所有评论框和定时事件
  removeAllEditorApp(pid) {
    const container = this.getCommentContainer(pid);
    const comments = container.find(`.single-comment`);
    for(let i = 0; i < comments.length; i++) {
      const c = comments.eq(i);
      this.removeEditorApp(c.attr('data-pid'))
    }
    this.removeEditorApp(pid)
  }
  // 隐藏评论
  hidePostComment(pid) {
    this.switchPostBackgroundColor(pid, false);
    const container = this.getCommentContainer(pid);
    const button = this.getCommentButton(pid);
    container.attr('data-hide', 'true');
    button.attr('data-show-number', 'true');
    this.renderPostCommentNumber(pid);
  }
  renderPostCommentNumber(pid) {
    const button = this.getCommentButton(pid);
    const number = Number(button.attr('data-number'));
    const showNumber = button.attr('data-show-number');
    let text;
    if(showNumber === 'true') {
      text = '评论';
      if(number > 0) {
        text += `(${number})`;
      }
    } else {
      text = '折叠评论';
    }
    button.text(text);
  }
  setPostCommentNumber(pid, num = 1) {
    const button = this.getCommentButton(pid);
    const number = Number(button.attr('data-number'));
    button.attr('data-number', number + 1);
  }
  // 显示、隐藏评论
  switchPostComment(pid, fixPosition, page) {
    if(!window.UE) return screenTopWarning(`别着急，页面还在加载中...`);
    const container = this.getCommentContainer(pid);
    if(container.attr('data-hide') === 'false') {
      if(fixPosition) {
        const pagePosition = new NKC.modules.PagePosition();
        this.hidePostComment(pid);
        pagePosition.restore();
      } else {
        this.hidePostComment(pid);
      }
    } else {
      this.showPostComment(pid, page);
    }
  }
  // 获取post下的评论
  getPostComments(pid, page = 0) {
    return nkcAPI(`/p/${pid}/comments?page=${page}`, 'GET')
  }
  // 移除编辑框
  removeEditorApp(pid) {
    const editorApp = this.getEditorAppData(pid);
    if(!editorApp) return;
    clearTimeout(editorApp.timeoutId);
    if(editorApp.app && editorApp.app.destroy) {
      editorApp.app.destroy();
    }
    if(editorApp.container && editorApp.container.remove) {
      editorApp.container.remove();
    }
    delete this.editors[pid];
  }
  getEditorAppData(pid) {
    return this.editors[pid];
  }
  // 获取编辑器dom
  getEditorApp(pid, parentDom, props = {}) {
    props.keepOpened = props.keepOpened || false;
    const {
      cancelEvent = 'switchCommentForm',
      position = 'top',
    } = props;
    const editorApp = this.editors[pid];
    if(
      editorApp === undefined
    ) {
      const singleCommentBottom = parentDom;
      const editorContainer = $(`<div class="single-comment-editor-container"></div>`);
      const warningDom = $(`<div class="single-comment-warning"></div>`);
      warningDom.html(this.postPermission.warning);
      editorContainer
        .append(warningDom)
      let editorDom, app;
      if(this.postPermission.permit) {
        editorDom = $(`<div class="single-comment-editor" id="singlePostEditor_${pid}">`);
        const promptDom = $(`<div class="single-comment-prompt">200字以内，仅用于支线交流，主线讨论请采用回复功能。</div>`);
        const buttonDom = $(`<div class="single-comment-button" data-type="${pid}"></div>`);
        const onclick = `NKC.methods.${cancelEvent}("${pid}", true)`;
        if(this.sendAnonymousPost) {
          buttonDom.append($(`
          <div class="checkbox">
            <label>
              <input type="checkbox" data-type="anonymous" /> 匿名发表
            </label>
          </div>
        `));
        }
        buttonDom.append($(`
          <div class="checkbox">  
            <label>
              <input type="checkbox" checked="checked" data-type="protocol" onchange="NKC.methods.setProtocolStatus('${pid}')" /> 我已阅读并同意遵守与本次发表相关的全部协议。<a href="/protocol" target="_blank">查看协议</a>
            </label>
          </div>
        `));
        buttonDom
          .append($(`<button class="btn btn-primary btn-sm" data-type="post-button" onclick="NKC.methods.postData('${pid}')">提交</button>`))
          .append($(`<button class="btn btn-default btn-sm" onclick="NKC.methods.saveDraft('${pid}')">存草稿</button>`))
          .append($(`<button class="btn btn-default btn-sm" onclick='${onclick}'>取消</button>`));

        editorContainer
          .append(promptDom)
          .append(editorDom)
          .append(buttonDom)
      }

      if(position === 'top') {
        singleCommentBottom.prepend(editorContainer);
      } else {
        singleCommentBottom.append(editorContainer);
      }


      if(editorDom) {
        app = UE.getEditor(editorDom.attr('id'), NKC.configs.ueditor.commentConfigs);
      }

      editorContainer.hide();

      this.editors[pid] = {
        app,
        draftId: null,
        options: props,
        container: editorContainer,
        pid: pid,
        show: false,
        timeoutId: null,
        prevDraft: ""
      };
    }
    return this.editors[pid];
  }
  // 打开回评输入框
  switchCommentForm(pid) {
    if(!NKC.configs.uid) {
      return NKC.methods.toLogin();
    }
    const singleComment = this.getSingleComment(pid);
    singleComment.find('.single-post-comment-error').remove();
    if(this.cWriteInfo) {
      return singleComment.append($(`<div class="single-post-comment-error text-danger">${this.cWriteInfo}</div>`));
    }
    const singleCommentBottom = singleComment.children('.single-comment-bottom');
    const editorApp = this.getEditorApp(pid, singleCommentBottom);
    if(editorApp.show) {
      if(editorApp.options.keepOpened) return;
      editorApp.show = false;
      editorApp.container.hide();
      clearTimeout(editorApp.timeoutId);
      this.removeEditorApp(pid);
    } else {
      editorApp.show = true;
      editorApp.container.show();
      this.autoSaveDraft(pid);
    }
  }
  // 获取指定编辑器的内容
  getEditorContent(pid) {
    const editorApp = this.getEditorApp(pid);
    return editorApp.app.getContent();
  }
  // 清除编辑器内的内容
  clearEditorContent(pid) {
    const editorApp = this.getEditorApp(pid);
    editorApp.app.setContent('');
  }
  // 屏蔽提交按钮
  changeEditorButtonStatus(pid, disabled) {
    const editorApp = this.getEditorApp(pid);
    const button = editorApp.container.find('[data-type=post-button]');
    button.attr('disabled', disabled);
    if(disabled) {
      button.html(`<div class="fa fa-spinner fa-spin"></div> 提交中...`);
    } else {
      button.html(`提交`);
    }
  }
  // 点击回复按钮
  postData(pid) {
    const content = this.getEditorContent(pid);
    const self = this;
    return Promise.resolve()
      .then(() => {
        if(!content) throw '评论内容不能为空';
        const buttonDom = $(`.single-comment-button[data-type="${pid}"]`);
        const anonymousButton = buttonDom.find(`input[data-type="anonymous"]`);
        const isAnonymous = anonymousButton.prop('checked');
        self.changeEditorButtonStatus(pid, true);
        return nkcAPI("/t/" + self.tid, "POST", {
          postType: "comment",
          post: {
            c: content,
            l: "html",
            anonymous: isAnonymous,
            parentPostId: pid
          }
        })
      })
      .then((data) => {
        screenTopAlert('发表成功');
        const renderedComment = data.renderedPost;
        self.clearEditorContent(pid);
        self.changeEditorButtonStatus(pid, false);
        self.switchCommentForm(pid);
        if(renderedComment) {
          self.insertComment(
            renderedComment.parentCommentId,
            renderedComment.parentPostId,
            renderedComment.html
          );
        }
      })
      .catch(err => {
        sweetError(err);
        self.changeEditorButtonStatus(pid, false);
      })
  }
  // 保存草稿
  saveDraftData(pid) {
    const editorApp = this.getEditorApp(pid);
    const { prevDraft } = editorApp;
    const content = this.getEditorContent(pid);
    /*if(prevDraft === content) {
      console.log("内容相同，不保存新草稿");
      return Promise.resolve();
    } else {
      editorApp.prevDraft = content;
    }*/
    editorApp.prevDraft = content;
    const self = this;
    return Promise.resolve()
      .then(() => {
        if(!content) return;
        return nkcAPI(`/u/${NKC.configs.uid}/drafts`, 'POST', {
          post: {
            c: content,
            l: 'html'
          },
          draftId: editorApp.draftId,
          desType: 'thread',
          desTypeId: self.tid
        })
      })
      .then(data => {
        if(!data) return {saved: false, error: '草稿内容不能为空'};
        editorApp.draftId = data.draft.did;
        return {saved: true};
      })
  }
  // 手动点击保存草稿
  saveDraft(pid) {
    this.saveDraftData(pid)
      .then(({saved, error}) => {
        if(saved) {
          sweetSuccess('草稿已保存');
        } else {
          sweetError(error);
        }
      })
      .catch(sweetError);
  }
  // 自动保存草稿
  autoSaveDraft(pid) {
    const self = this;
    const editorApp = self.getEditorApp(pid);
    if(!editorApp || !editorApp.show) return;
    clearTimeout(editorApp.timeoutId);
    editorApp.timeoutId = setTimeout(() => {
      self.saveDraftData(pid)
        .then(() => {
          self.autoSaveDraft(pid);
        })
        .catch(err => {
          screenTopWarning(err);
          self.autoSaveDraft(pid);
        })
    }, 10000);
  }
  /*
  * 插入一条评论
  * @param {String} parentCommentId 当前评论的直接上级pid
  * @param {String} parentPostId 当前评论的最顶级pid
  * @param {String} html 已经在后端渲染好的单条评论的内容
  * */
  insertComment(parentCommentId, parentPostId,  html) {
    const container = this.getCommentContainer(parentCommentId);
    if(container.length) {
      // 最外层 仅仅在最后一页时才插入内容
      if(container.attr('data-last-page') === 'false') return;
      container.children(`.single-comments[data-pid="${parentCommentId}"]`)
        .children(`.single-comments[data-pid="${parentCommentId}"]`).append($(html));
    } else {
      // 内层
      const singleComment = this.getSingleComment(parentCommentId);
      singleComment.children('.single-comment-bottom')
        .children(`.single-comments[data-pid="${parentCommentId}"]`).append($(html));
    }
    this.setPostCommentNumber(parentPostId, 1);
    this.renderPostCommentNumber(parentPostId);
    this.initNKCSource();
  }
  setProtocolStatus(pid) {
    const buttonDom = $(`.single-comment-button[data-type="${pid}"]`);
    const protocolButton = buttonDom.find(`input[data-type="protocol"]`);
    const postButton = buttonDom.find(`button[data-type="post-button"]`);
    const checked = protocolButton.prop('checked');
    if(checked) {
      postButton.removeAttr('disabled');
    } else {
      postButton.attr('disabled', 'disabled');
    }
  }
}

const singlePostModule = new SinglePostModule();

NKC.methods.autoHidePostContent = function() {
  singlePostModule.autoHidePostContent();
};
NKC.methods.switchPostContent = function(pid) {
  singlePostModule.switchPostContent(pid);
}
NKC.methods.switchPostComment = function(pid, fix, page) {
  singlePostModule.switchPostComment(pid, fix, page);
}
NKC.methods.switchCommentForm  = function(pid) {
  singlePostModule.switchCommentForm (pid);
}
NKC.methods.postData = function(pid) {
  singlePostModule.postData(pid);
};
NKC.methods.saveDraft = function(pid) {
  singlePostModule.saveDraft(pid);
}
NKC.methods.getPostCommentsByPage = function(pid, page) {
  singlePostModule.showPostComment(pid, page);
}
NKC.methods.showPostComment = function(pid, page, options) {
  singlePostModule.showPostComment(pid, page, options);
}
NKC.methods.insertComment = function(parentCommentId, parentPostId, html) {
  singlePostModule.insertComment(parentCommentId, parentPostId, html);
}
NKC.methods.setProtocolStatus = function(pid) {
  singlePostModule.setProtocolStatus(pid);
}
