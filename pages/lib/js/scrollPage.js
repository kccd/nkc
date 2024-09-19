export function scrollToTop() {
  const htmlDom = $('html');
  const bodyDom = $('body');
  htmlDom.css('height', 'auto');
  bodyDom.css('height', 'auto');
  $('html,body').animate({ scrollTop: 0 }, 300);
  htmlDom.css('height', '100%');
  bodyDom.css('height', '100%');
}

export function scrollToBottom() {
  const htmlDom = $('html');
  const bodyDom = $('body');
  htmlDom.css('height', 'auto');
  bodyDom.css('height', 'auto');
  $('html,body').animate({ scrollTop: document.body.offsetHeight }, 300);
  htmlDom.css('height', '100%');
  bodyDom.css('height', '100%');
}

export function scrollTo(scrollTop) {
  $('html,body').animate({ scrollTop: scrollTop }, 300);
}
