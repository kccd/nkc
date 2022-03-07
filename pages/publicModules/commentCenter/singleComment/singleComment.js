import {getDataById} from "../../../lib/js/dataConversion";
const data = getDataById('data');

class SingleCommentModel {
  constructor() {
  }
  getCommentHeightFloat() {
    let postHeight = $('.hidden[data-type="hidePostContentSettings"]');
    if(!postHeight.length) throw '未读取到与post内容隐藏相关的配置';
    postHeight = NKC.methods.strToObj(postHeight.html());
    return postHeight.float;
  }
  // 获取后台有关post高度的配置
  // 根据屏幕尺寸判断是否需要隐藏
  getCommentMaxHeight() {
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
  // 隐藏post内容
  hideCommentContent(cid) {
    const container = $(`.single-post-container[data-cid="${cid}"]`);
    const postCenter = container.find('.single-post-center');
    const hidePostFloat = this.getCommentHeightFloat();
    const hidePostMaxHeight = this.getCommentMaxHeight();
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
  showCommentContent(cid) {
    const container = $(`.single-post-container[data-cid="${cid}"]`);
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
  // 自动获取comment列表、判断高度以及属性然后隐藏满足条件的post
  autoHideCommentContent() {
    const containers = $('.single-post-container');
    for(let i = 0; i < containers.length; i++) {
      const c = containers.eq(i);
      const hide = c.attr('data-hide');
      const cid = c.attr('data-cid');
      if(hide === 'not') continue;
      const hidePostMaxHeight = this.getCommentMaxHeight();
      const contentHeight = c.find('.single-post-center').height();
      if(contentHeight > hidePostMaxHeight) {
        this.hideCommentContent(cid);
      }
    }
  }
  // 切换post隐藏状态
  switchCommentContent(cid) {
    const container = $(`.single-post-container[data-cid="${cid}"]`);
    const hidden = container.attr('data-hidden');
    if(hidden === 'true') {
      const scrollY = $(document).scrollTop();
      this.showCommentContent(cid);
      scrollTo(0, scrollY);
    } else {
      const pagePosition = new NKC.modules.PagePosition();
      this.hideCommentContent(cid);
      pagePosition.restore();
    }
  }
}

const singleCommentModel = new SingleCommentModel();
NKC.methods.autoHideCommentContent = function() {
  singleCommentModel.autoHideCommentContent();
};
NKC.methods.switchCommentContent = function(cid) {
  singleCommentModel.switchCommentContent(cid);
}
