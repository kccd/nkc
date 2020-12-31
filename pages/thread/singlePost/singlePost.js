var _singlePostModule = {
  getHidePostMaxHeight: function() {
    var DW = $(document).width();
    var hidePostMaxHeight;
    if(DW < 768) {
      hidePostMaxHeight = NKC.configs.postHeight.xs;
    } else if(DW < 992) {
      hidePostMaxHeight = NKC.configs.postHeight.sm;
    } else {
      hidePostMaxHeight = NKC.configs.postHeight.md;
    }
    return hidePostMaxHeight;
  },
  autoHidePostContent: function() {
    var containers = $('.single-post-container');
    for(var i = 0; i < containers.length; i++) {
      var c = containers.eq(i);
      var hide = c.attr('data-hide');
      var pid = c.attr('data-pid');
      if(hide === 'not') continue;
      if(['all', 'half'].includes(hide)) {
        _singlePostModule.hidePostContent(pid);
        continue;
      }
      var hidePostMaxHeight = _singlePostModule.getHidePostMaxHeight();
      var contentHeight = c.find('.single-post-center').height();
      if(contentHeight > hidePostMaxHeight) {
        _singlePostModule.hidePostContent(pid);
      }
    }
  },
  hidePostContent: function(pid) {
    var container = $('.single-post-container[data-pid="'+pid+'"]');
    var postCenter = container.find('.single-post-center');
    var hidePostFloat = NKC.configs.postHeight.float;
    var hidePostMaxHeight = _singlePostModule.getHidePostMaxHeight();
    postCenter.css({
      "max-height": hidePostMaxHeight * hidePostFloat + "px"
    });
    var buttonContainer = container.find('.switch-hidden-status');
    var button = buttonContainer.find('.switch-hidden-status-button');
    button.html('<div class="fa fa-angle-down"> 加载全文</div>');
    container.attr('data-hidden', 'true');
    buttonContainer.removeClass('hidden');
  },
  showPostContent: function(pid) {
    var container = $('.single-post-container[data-pid="'+pid+'"]');
    var postCenter = container.find('.single-post-center');
    postCenter.css({
      "max-height": 'none'
    });
    var buttonContainer = container.find('.switch-hidden-status');
    var button = buttonContainer.find('.switch-hidden-status-button');
    button.html('<div class="fa fa-angle-up"> 收起</div>');
    container.attr('data-hidden', 'false');
    buttonContainer.removeClass('hidden');
  },
  switchPostContent: function(pid) {
    var container = $('.single-post-container[data-pid="'+pid+'"]');
    var hidden = container.attr('data-hidden');
    if(hidden === 'true') {
      var scrollY = $(document).scrollTop();
      _singlePostModule.showPostContent(pid);
      scrollTo(0, scrollY);
    } else {
      var pagePosition = new NKC.modules.PagePosition();
      _singlePostModule.hidePostContent(pid);
      pagePosition.restore();
    }
  }
};

