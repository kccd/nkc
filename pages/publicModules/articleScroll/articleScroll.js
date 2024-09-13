import { ToTop, ToBottom, Up, Down } from '@icon-park/vue';
import Vue from 'vue';

window.onload = function () {
  const app = new Vue({
    el: '#articleScrollContainer',
    components: {
      up: Up,
      down: Down,
      'to-top': ToTop,
      'to-bottom': ToBottom,
    },
    data: {
      offsetTop: 46,
    },
    methods: {
      scrollPost(direction, klass) {
        let elements = document.querySelectorAll(`.${klass}`);
        elements = [...elements];
        if (direction === 'prev') {
          elements = elements.reverse();
        }
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const rect = element.getBoundingClientRect();
          if (direction === 'prev') {
            if (rect.top >= this.offsetTop) {
              continue;
            }
            NKC.methods.scrollToDom($(element), this.offsetTop);
          } else {
            if (rect.top <= this.offsetTop + 1) {
              continue;
            }
            NKC.methods.scrollToDom($(element), this.offsetTop);
          }
          return;
        }

        // 沒有元素可以滾動了，則滾動到頁面頂部或底部
        if (direction === 'prev') {
          scrollToTop();
        } else {
          scrollToBottom();
        }
      },
    },
  });
};
