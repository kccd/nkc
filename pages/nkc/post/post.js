import { initNKCSource } from '../../lib/js/nkcSource';
import { screenTopAlert } from '../../lib/js/topAlert';
import { sweetError } from '../../lib/js/sweetAlert';
import { nkcAPI } from '../../lib/js/netAPI';
import { getDataById } from '../../lib/js/dataConversion';
import { detailedTime } from '../../lib/js/time';
import dayjs from 'dayjs';
const { paging, posts, queryData } = getDataById('data');
const timestamp = queryData.timeStop || Date.now();
import ThreadItem from '../../lib/vue/nkc/post/TheadItem.vue';
import PostItem from '../../lib/vue/nkc/post/PostItem.vue';
import Paging from '../../lib/vue/Paging.vue';
import CommentItem from '../../lib/vue/nkc/post/CommentItem.vue';
import DraftItem from '../../lib/vue/nkc/post/DraftItem.vue';

window.moveThread = function (pid) {
  if (!window.MoveThread) {
    window.MoveThread = new window.NKC.modules.MoveThread();
  }
  const postData = window.NKC.methods.getDataById(`data_${pid}`);
  window.MoveThread.open(
    function (data) {
      var forums = data.forums;
      var moveType = data.moveType;
      const threadCategoriesId = data.threadCategoriesId;
      window.MoveThread.lock();
      nkcAPI('/threads/move', 'POST', {
        forums: forums,
        moveType: moveType,
        threadCategoriesId,
        threadsId: [postData.tid],
      })
        .then(function () {
          screenTopAlert('操作成功');
          window.MoveThread.close();
        })
        .catch(function (data) {
          sweetError(data);
          window.MoveThread.unlock();
        });
    },
    {
      selectedCategoriesId: postData.categoriesId,
      selectedForumsId: postData.mainForumsId,
      selectedThreadCategoriesId: postData.tcId,
    },
  );
};

window.deleteThread = function (pid) {
  if (!window.DisabledPost) {
    window.DisabledPost = new window.NKC.modules.DisabledPost();
  }
  window.DisabledPost.open(function (data) {
    var type = data.type;
    var reason = data.reason;
    var remindUser = data.remindUser;
    var violation = data.violation;
    var url,
      method = 'POST';
    var body = {
      postsId: [pid],
      reason: reason,
      remindUser: remindUser,
      violation: violation,
    };
    if (type === 'toDraft') {
      url = '/threads/draft';
    } else {
      url = '/threads/recycle';
    }
    window.DisabledPost.lock();
    nkcAPI(url, method, body)
      .then(function () {
        screenTopAlert('操作成功');
        window.DisabledPost.close();
        window.DisabledPost.unlock();
      })
      .catch(function (data) {
        sweetError(data);
        window.DisabledPost.unlock();
      });
  });
};

const app = new window.Vue({
  el: '#app',
  components: {
    thread: ThreadItem,
    post: PostItem,
    comment: CommentItem,
    draft: DraftItem,
    paging: Paging,
  },
  data: {
    source: queryData.source, // 可包含: 'thread' | 'post' | 'comment' | 'draft'
    text: queryData.text || '',
    page: queryData.page || 0,
    perPage: queryData.perPage || 100,
    timeStart: queryData.timeStart || null, // null 或毫秒数字
    timeStop: timestamp, // null 或毫秒数字
    posts: posts,
    pageButtons: paging.buttonValue,
    timestamp: timestamp,
    order: 'desc', // desc | asc
  },
  mounted() {
    initNKCSource();
  },
  methods: {
    detailedTime,
    formatLocalDate(ms) {
      if (typeof ms !== 'number' || isNaN(ms)) {
        return '';
      }
      const d = dayjs(ms);
      if (!d.isValid()) {
        return '';
      }
      return d.format('YYYY-MM-DDTHH:mm');
    },
    parseLocalDate(str) {
      if (typeof str !== 'string' || !str) {
        return null;
      }
      const d = dayjs(str);
      return d.isValid() ? d.valueOf() : null;
    },
    onLocalDateChange(key, value) {
      const ts = this.parseLocalDate(value);
      this[key] = ts === null ? null : ts;
    },
    selectSource(e) {
      const value = e.target.value;
      if (value === 'draft') {
        console.log(1);
        // 点击的草稿
        if (this.source.includes('draft')) {
          this.source = [];
        } else {
          this.source = ['draft'];
        }
      } else {
        if (this.source.includes('draft')) {
          this.source = this.source.filter((x) => x !== 'draft');
        }
        if (this.source.includes(value)) {
          // 取消选择
          this.source = this.source.filter((x) => x !== value);
        } else {
          // 选择
          this.source.push(value);
        }
      }
    },

    generateUrl(page) {
      let url = this.source.includes('draft')
        ? `/nkc/post/drafts?`
        : `/nkc/post?`;

      if (this.source && this.source.length > 0) {
        url += `source=${this.source.join(',')}&`;
      }
      if (typeof this.text === 'string' && this.text.trim() !== '') {
        url += `text=${encodeURIComponent(this.text.trim())}&`;
      }
      if (typeof this.timeStart === 'number' && !isNaN(this.timeStart)) {
        url += `timeStart=${this.timeStart}&`;
      }
      if (typeof this.timeStop === 'number' && !isNaN(this.timeStop)) {
        url += `timeStop=${this.timeStop}&`;
      }
      url += `perPage=${this.perPage}&`;
      url += `page=${page}&`;
      url += `order=${this.order}`;
      return url;
    },

    redirect(page = 0) {
      window.location.href = this.generateUrl(page);
    },

    movePost: window.moveThread,
    deletePost: window.deleteThread,
  },
});
