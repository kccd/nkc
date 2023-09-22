import Vue from 'vue';
import { HttpMethods, nkcAPI } from '../lib/js/netAPI';
import { visitUrl } from '../lib/js/pageSwitch';
import { logger } from '../lib/js/logger';
import { getUrl } from '../lib/js/tools';

window.onload = main;

function main() {
  const elements = document.querySelectorAll(
    '[data-type="communityLeftNavForumSelector"]',
  );
  for (let i = 0; i < elements.length; i++) {
    initVueInstance(elements[i]);
  }
}

function initVueInstance(el) {
  new Vue({
    el,
    data: {
      forumsTree: [],
      selectedForumsId: [],
    },
    mounted() {
      this.getForumsTree();
    },
    computed: {
      allForums() {
        return this.getAllForums(this.forumsTree);
      },
      allForumsObj() {
        const obj = {};
        for (const forum of this.allForums) {
          obj[forum.fid] = forum;
        }
        return obj;
      },
      selectedForums() {
        const arr = [];
        for (const item of this.selectedForumsId) {
          const forum = this.allForumsObj[item.fid];
          arr.push(forum || null);
        }
        return arr;
      },
    },
    methods: {
      getAllForums(arr) {
        const forums = [];
        for (const forum of arr) {
          forums.push(forum);
          if (forum.childrenForums && forum.childrenForums.length > 0) {
            const childArr = this.getAllForums(forum.childrenForums);
            forums.push(...childArr);
          }
        }
        return forums;
      },
      selectForum(e) {
        const index = Number(e.target.getAttribute('data-index'));
        const value = e.target.value;

        this.setSelectedForumsId(index, value);
      },
      getForumsTree() {
        nkcAPI('/api/v1/forums/tree', HttpMethods.GET)
          .then((res) => {
            this.forumsTree = res.data.forumsTree;
            this.setSelectedForumsId(0, this.forumsTree[0].fid);
          })
          .catch((err) => {
            logger.error(err);
          });
      },
      setSelectedForumsId(index, fid) {
        this.selectedForumsId.length = index;
        this.selectedForumsId.push(fid);
        const forum = this.allForumsObj[fid];
        if (forum.childrenForums && forum.childrenForums.length > 0) {
          this.setSelectedForumsId(index + 1, forum.childrenForums[0].fid);
        }
      },
      visit() {
        const targetFid =
          this.selectedForumsId[this.selectedForumsId.length - 1];
        visitUrl(getUrl('forumHome', targetFid));
      },
    },
  });
}
