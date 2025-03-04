import { getState } from '../lib/js/state';
import { nkcAPI } from '../lib/js/netAPI';
import { visitUrl } from '../lib/js/pageSwitch';
import { sweetError } from '../lib/js/sweetAlert';

const state = getState();

$(function () {
  if (!state.uid) {
    $('.exam-link a')
      .removeAttr('href')
      .attr('onclick', "RootApp.openLoginPanel('login')")
      .addClass('pointer');
  }
});

window.createPaper = function (cid) {
  nkcAPI(`/exam/paper?cid=${cid}`, 'GET')
    .then((data) => {
      visitUrl(data.redirectUrl);
    })
    .catch(sweetError);
};

function highlightElement() {
  // 获取当前URL中的锚点
  const hash = window.location.hash;
  if (hash) {
    // 移除之前的高亮
    const highlightedElements = document.querySelectorAll('.volume-hl');
    highlightedElements.forEach((el) => el.classList.remove('volume-hl'));

    // 根据锚点找到对应的元素并添加高亮类
    const targetElement = document.querySelector(hash);
    if (targetElement) {
      const examListContainer = document.querySelector(`[data-id="${hash}"]`);
      targetElement.classList.add('volume-hl');
      examListContainer.classList.add('volume-hl');
    }
  }
}

// 页面加载时执行高亮函数
window.onload = highlightElement;
// 监听hashchange事件，以便在锚点变化时重新高亮
window.onhashchange = highlightElement;
