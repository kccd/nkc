const data = NKC.methods.getDataById('data');
const commonModel = new NKC.modules.CommonModal();
import Sortable from 'sortablejs';
data.categoryTree.map(c => {
  for(const n of c.nodes) {
    console.log(`${n.name} - ${n.order}`);
  }
})
const app = new Vue({
  el: '#app',
  data: {
    categoryTree: data.categoryTree
  },
  mounted() {
    // this.initSort();
    this.initSortable();
  },
  methods: {
    initSortable() {
      const masterContainer = document.getElementsByClassName('thread-categories')[0];
      new Sortable(masterContainer, {
        group: 'master',
        invertSwap: true,
        handle: '.thread-category-master-handle',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onEnd: this.saveOrder
      });
      const nodeContainer = document.getElementsByClassName('thread-category-nodes');
      for(let i = 0; i < nodeContainer.length; i ++) {
        const node = nodeContainer[i];
        new Sortable(node, {
          group: `node_${i}`,
          invertSwap: true,
          handle: '.thread-category-node',
          animation: 150,
          fallbackOnBody: true,
          swapThreshold: 0.65,
          onEnd: this.saveOrder
        });
      }
    },
    saveOrder() {
      const masters = $('.thread-category-master');
      const nodes = $('.thread-category-node');
      const categories = [];
      for(let i = 0; i < masters.length; i++) {
        const m = masters.eq(i);
        const cid = Number(m.attr('data-cid'));
        categories.push({
          cid,
          order: i
        });
      }
      for(let i = 0; i < nodes.length; i++) {
        const n = nodes.eq(i);
        categories.push({
          cid: n.attr('data-cid'),
          order: i
        });
      }
      nkcAPI(`/e/settings/threadCategory`, 'PUT', {
        categories
      })
        .then(() => {
          console.log(`顺序已保存`);
        })
        .catch(sweetError);
    },
    newCategory() {
      const self = this;
      commonModel.open(data => {
        const name = data[0].value;
        const description = data[1].value;
        nkcAPI(`/e/settings/threadCategory`, 'POST', {
          name,
          description,
        })
          .then(data => {
            commonModel.close();
            sweetSuccess('添加成功');
            window.location.reload();
          })
          .catch(sweetError);
      }, {
        title: '新建分类',
        data: [
          {
            dom: 'input',
            label: '分类名'
          },
          {
            dom: 'textarea',
            label: '分类介绍'
          }
        ]
      })
    },
    removeCategory(cid) {
      return sweetQuestion('确定要执行当前操作？')
        .then(() => {
          return nkcAPI(`/e/settings/threadCategory/${cid}`, 'DELETE')
        })
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError)
    },
    disableCategory(cid, disabled) {
      return sweetQuestion('确定要执行当前操作？')
        .then(() => {
          return nkcAPI(`/e/settings/threadCategory/${cid}`, 'PUT', {
            type: 'modifyDisable',
            disabled
          })
        })
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError)
    }
  }
})