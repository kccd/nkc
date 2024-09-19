import { ToTop, ToBottom, Up, Down } from '@icon-park/vue';
import Vue from 'vue';
import { scrollToTop, scrollToBottom, scrollTo } from '../../lib/js/scrollPage';

window.onload = function () {
  new Vue({
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
      scrollToTop,
      scrollToBottom,
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
            if (rect.top >= this.offsetTop - 2) {
              continue;
            }
            scrollTo(window.scrollY - (this.offsetTop - rect.top));
          } else {
            if (rect.top <= this.offsetTop + 2) {
              continue;
            }
            scrollTo(window.scrollY + (rect.top - this.offsetTop));
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
