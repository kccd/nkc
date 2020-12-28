class SinglePostModule {
  constructor() {}
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
    button.html(`<div class="fa fa-angle-down"> 加载全文</div>`);
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
}

const singlePostModule = new SinglePostModule();

NKC.methods.autoHidePostContent = function() {
  singlePostModule.autoHidePostContent();
};
NKC.methods.switchPostContent = function(pid) {
  singlePostModule.switchPostContent(pid);
}
