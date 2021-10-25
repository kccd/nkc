window.ForumSelector = undefined;
window.data = NKC.methods.getDataById("data");
const commonModel = new NKC.modules.CommonModal();
const fixBlockHeightClass = 'fix-block-height';
import Sortable from "sortablejs";

$(function() {
  // 轮播图
  var swiper = new Swiper('.swiper-container', {
    pagination: {
      el: '.swiper-pagination',
      type: 'fraction',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
  });
  swiper.el.onmouseover = function(){
    swiper.autoplay.stop();
  };
  swiper.el.onmouseleave = function() {
    swiper.autoplay.start();
  };
  // 监听页面滚动 更改header样式
  $(window).scroll(function(event){
    const scrollTop = $(window).scrollTop();
    const header = $(".navbar-default.nkcshade");
    if(scrollTop > 10) {
      header.addClass("home-fixed-header");
    } else {
      header.removeClass("home-fixed-header");
    }
  });
});
function initSortable() {
  const masterContainerL = document.getElementsByClassName('home-categories-left')[0];
  new Sortable(masterContainerL, {
    group: 'master',
    invertSwap: true,
    handle: '.home-category-master-handle',
    animation: 150,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    onEnd: changeOrder
  });
  const masterContainerR = document.getElementsByClassName('home-categories-right')[0];
  new Sortable(masterContainerR, {
    group: 'master',
    invertSwap: true,
    handle: '.home-category-master-handle',
    animation: 150,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    onEnd: changeOrder
  });
}
function changeOrder(){
  const leftDom = $('.home-categories-left>.home-forums-list');
  const rightDom = $('.home-categories-right>.home-forums-list');
  const left = [];
  const right = [];
  for(let i = 0; i < leftDom.length; i++) {
    const m = leftDom.eq(i);
    let cid = m.attr('id');
    if(cid.indexOf('new_') === 0) continue;
    cid = cid.split('_').pop();
    left.push(cid);
  }
  for(let i = 0; i < rightDom.length; i++) {
    const m = rightDom.eq(i);
    let cid = m.attr('id');
    if(cid.indexOf('new_') === 0) continue;
    cid = cid.split('_').pop();
    right.push(cid);
  }
  nkcAPI(`/nkc/home/block`, 'PUT', {
    homeBlocksId: {
      left,
      right
    }
  })
    .then(() => {
      console.log(`顺序已保存`);
    })
    .catch(sweetError);
}

//新建
function create(){
  const date = new Date();
  const id = 'new_'+date.getTime();
  const leftModel = $('.home-categories-left');
  const hiddenForm = $('#hiddenForm>.home-threads-editor').eq(0).clone();
  leftModel.prepend(`<div id='${id}' class='home-forums-list m-b-1 home-category-master-handle'>
    <div class="home-title-box">
      <div class="home-title-l">
        <span class="fa fa-bars move-handle m-r-1"></span>
        <span class="panel-header m-b-0 home-title">新建模块<span>
      </div>
      <div class="operate">
          <button class="home-title-r btn-success btn btn-xs" style="visibility: initial" @click=save('${id}')>保存</button>
          <button class="home-title-r btn-danger btn btn-xs" style="visibility: initial" @click=delBlock('${id}')>删除</button>
        </div>
    </div>
    <div class="home-threads"></div>
  </div>`);
  const form = $(`#${id}>.home-threads`)
  form.append(hiddenForm);
  const vueAppId = getVueAppId(id);
  let app = apps[vueAppId];
  if(!app) {
    //创建vue实例
    app = initVue(id);
    apps[vueAppId] = app;
  }
  app.show = true;
  app.loading = false;
  setTimeout(() => {
    app.$refs.homeCategoryList.initCategories();
  });
}
const apps = {};
function getVueAppId(cid) {
  return `vue_app_${cid}`;
}
function editorBlock(bid){
  const oldContainer = $(`#block_${bid}>.home-threads`);
  const editorBlockDom = $(`#block_${bid}>.panel-header>.home-forums-list-options>#btn-editorBlock`);
  const saveBlockDom = $(`#block_${bid}>.panel-header>.home-forums-list-options>.btn-saveEditor`);
  saveBlockDom.show();
  editorBlockDom.hide();
  oldContainer.hide();
  const vueAppId = getVueAppId(bid);
  let app = apps[vueAppId];
  if(!app) {
    //创建vue实例
    app = initVue('block_'+bid);
    apps[vueAppId] = app;
  }
  app.show = true;
  app.getData();
}
import ThreadCategoryList from '../publicModules/threadCategory/list';
//创建vue实例
function initVue(cid){
  window.app = new Vue({
    el: `#${cid}`,
    data: {
      show: false,
      loading: true,
      //已选择的专业
      forums: [],
      // selectedForums: [],
      form: {
        name:'',
        forumsId: [],
        tcId: [],
        digest: false ,
        origin: false,
        postCountMin: 0,
        voteUpMin: 0,
        voteUpTotalMin: 0,
        voteDownMax: 0,
        updateInterval: 1,
        timeOfPostMin: 0,
        timeOfPostMax: 365,
        threadStyle: 'brief',
        blockStyle: {
          headerTitleColor: '#000',
          backgroundColor: '#fff',
          usernameColor: '',
          forumColor: '',
          titleColor: '',
          abstractColor: '',
          infoColor: '',
        },
        coverPosition: 'left',
        threadCount: 10,
        disabled: false,
        fixedThreadCount: 0,
        autoThreadCount: 50,
        autoThreadsId: [],
        fixedThreadsId: [],
        sort: 'random',
      },
      threadCategories: data.threadCategories || [],
      selectedHomeCategoriesId: [],
    },
    components: {
      'thread-category-list': ThreadCategoryList
    },
    computed: {
      categoriesId(){
        const {selectedHomeCategoriesId} = this;
        for(const tc of selectedHomeCategoriesId) {
          if(tc.nodeId === 'default') continue;
          this.form.tcId.push(tc.nodeId);
        }
        return arr;
      },
      forumsObj() {
        const {forums} = this;
        const obj = {};
        for(const forum of forums) {
          obj[forum.fid] = forum;
        }
        return obj;
      },
      selectedForums() {
        const {forumsObj, form} = this;
        const arr = [];
        for(const fid of form.forumsId) {
          const forum = forumsObj[fid];
          if(!forum) continue;
          arr.push(forum);
        }
        return arr;
      }
    },
    mounted() {

    },
    methods: {
      getData(){
        if(cid.indexOf('new_') !== 0){
          const id = cid.split('_').pop();
          nkcAPI('nkc/home/block/'+id, 'GET', {
          })
            .then(data => {
              this.form = data.homeBlock;
              this.forums = data.forums;
              this.selectedHomeCategoriesId = data.homeBlock.tcId;
              this.threadCategories = data.threadCategories;
              this.loading = false;
              const _this = this;
              setTimeout(() => {
                _this.$refs.homeCategoryList.initCategories();
              });
            })
            .catch(err => {sweetError(err)});
        }
      },
      //保存编辑
      saveEditor(bid){
        const id = bid.split('_').pop();
        const selectedThreadCategories = this.getSelectedHomeCategoriesId();
        this.form.tcId = [];
        for(const tc of selectedThreadCategories) {
          if(tc.nodeId === 'default') continue;
          this.form.tcId.push(tc.nodeId);
        }
        const editorBlockDom = $(`#block_${bid}>.panel-header>.home-forums-list-options>#btn-editorBlock`);
        const saveEditorDom = $(`#block_${bid}>.panel-header>.home-forums-list-options>.btn-saveEditor`);
        const oldContainer = $(`#block_${bid}>.home-threads`);
        nkcAPI('/nkc/home/block/'+ id, 'PUT', {
          block: this.form
        })
          .then((data) => {
            editorBlockDom.show();
            oldContainer.show();
            saveEditorDom.hide();
            this.show = false;
          })
          .catch(err => {
            sweetError(err)
          })
      },
      //选择文章列表样式
      selectBlockStyle(){
        const self = this;
        commonModel.open(data => {
          this.form.blockStyle.backgroundColor = data[0].value;
          this.form.blockStyle.usernameColor = data[1].value;
          /*this.form.blockStyle.forumColor = data[2].value;
          this.form.blockStyle.titleColor = data[3].value;
          this.form.blockStyle.abstractColor = data[4].value;
          this.form.blockStyle.infoColor = data[5].value;*/
          commonModel.close();
        }, {
          title: '文章列表样式',
          data: [
            {
              dom: 'input',
              label: '模块名称颜色',
              value: this.form.blockStyle.headerTitleColor
            },
            {
              dom: 'input',
              label: '模块背景颜色',
              value: this.form.blockStyle.backgroundColor
            },
            /*{
              dom: 'input',
              label: '用户名颜色',
              value: this.form.blockStyle.usernameColor
            },
            {
              dom: 'input',
              label: '专业名颜色',
              value: this.form.blockStyle.forumColor
            },
            {
              dom: 'input',
              label: '文章标题颜色',
              value: this.form.blockStyle.titleColor
            },
            {
              dom: 'input',
              label: '文章摘要颜色',
              value: this.form.blockStyle.abstractColor
            },
            {
              dom: 'input',
              label: '时间等其他信息颜色',
              value: this.form.blockStyle.infoColor
            }*/
          ]
        })
      },
      getSelectedHomeCategoriesId() {
        return this.$refs.homeCategoryList.getSelectedCategoriesId();
      },
      //保存创建的模块
      save(cid){
        const selectedThreadCategories = this.getSelectedHomeCategoriesId();
        this.form.tcId = [];
        for(const tc of selectedThreadCategories) {
          if(tc.nodeId === 'default') continue;
          this.form.tcId.push(tc.nodeId);
        }
        nkcAPI('/nkc/home/block', 'POST', {
          block: this.form
        })
          .then((data) => {
            window.location.reload();
          })
          .catch(err => {
            sweetError(err)
          })
      },
      //删除模块
      delBlock(cid){
        const delDom = $(`#${cid}`);
        delDom.remove();
      },
      //移除选中的专业
      removeForum(fid){
        this.forums = this.forums.filter((c => c.fid !== fid))
      },
      // 获取已选择文章分类ID组成的数组
      selectedCategoriesId() {
        var arr = [];
        var selectedForums = this.selectedForums;
        for(var i = 0; i < selectedForums.length; i++) {
          var forum = selectedForums[i];
          if(forum.cid) arr.push(forum.cid);
        }
        return arr;
      },
      //选择专业
      selectForums(){
        var self = this;
        if(!window.ForumSelector)
          window.ForumSelector = new NKC.modules.ForumSelector();
        window.ForumSelector.open(function(r) {
          self.forums.push(r.forum);
          if(self.form.forumsId.includes(r.forum.fid)) return;
          self.form.forumsId.push(r.forum.fid);
        }, {
          highlightForumId: [],
          selectedForumsId: [],
          disabledForumsId: self.form.forumsId
        });
      },
    },
  });
  return app;
}
//编辑
function initBlock(cid){
  const vueAppId = getVueAppId(cid);
  let app = apps[vueAppId];
  if(!app) {
    //创建vue实例
    app = initVue(cid);
    apps[vueAppId] = app;
  }
  app.show = true;
}
//删除
function deleteHomeBlock(homeBlockId){
  return sweetQuestion(`确定要删除当前模块吗？`)
    .then(() => {
      return nkcAPI(`/nkc/home/block/${homeBlockId}`, 'DELETE', {});
    })
    .then(() => {
      window.location.reload();
    })
    .catch(sweetError);
}
//屏蔽
function disabledHomeBlock(homeBlockId, disabled){
  nkcAPI(`/nkc/home/block/${homeBlockId}/disabled`, 'PUT', {
    disabled
  })
    .then(() => {
      sweetSuccess(`执行成功`);
    })
    .catch(sweetError)
}
function clickEditor(){

}

const defaultButtonStatus = {
  editor: true,
  finished: false,
  create: false,
  handle: false,
  saveEditor: false,
};

const editorButtonStatus = {
  editor: false,
  finished: true,
  create: true,
  handle: true,
  saveEditor: false,
};

function renderButtons(status) {
  const editor = $('.admin-editor');
  const finished = $('.admin-finished');
  const create = $('.admin-create');
  const moveHandle = $('.move-handle');
  const saveEditor = $('.btn-saveEditor');
  status.editor? editor.show(): editor.hide();
  status.finished? finished.show(): finished.hide();
  status.create? create.show(): create.hide();
  status.handle? moveHandle.show(): moveHandle.hide()
  status.saveEditor? saveEditor.show(): saveEditor.hide()
}

renderButtons(defaultButtonStatus);

//进入编辑模式
function editor(){
  renderButtons(editorButtonStatus);
  initSortable();
}

function expandList(homeBlockId) {
  const blockDom = $(`.home-forums-list[id="block_${homeBlockId}"]`);
  fixBlockHeight(blockDom);
}

function fixBlockHeight(blockDom) {
  const fixed = blockDom.hasClass(fixBlockHeightClass);
  if(!fixed) {
    blockDom.addClass(fixBlockHeightClass);
    blockDom.find('.icon-expand').text('展开');
  } else {
    blockDom.removeClass(fixBlockHeightClass);
    blockDom.find('.icon-expand').text('折叠');
  }
}

function fixAllBlockHeight(fixed) {
  const blocks = $('.home-categories-left>.home-forums-list, .home-categories-right>.home-forums-list');
  if(fixed) {
    blocks.addClass(fixBlockHeightClass);
  } else {
    blocks.removeClass(fixBlockHeightClass);
  }
}

function finished(){
  renderButtons(defaultButtonStatus);
  fixAllBlockHeight(false);
}

function refresh(homeBlockId) {
  nkcAPI(`/nkc/home/block/${homeBlockId}/refresh`, 'POST', {})
    .then(() => {
      sweetSuccess(`执行成功`);
    })
    .catch(sweetError);
}

Object.assign(window, {
  changeOrder,
  finished,
  clickEditor,
  initBlock,
  refresh,
  create,
  editor,
  initSortable,
  deleteHomeBlock,
  editorBlock,
  disabledHomeBlock,
  expandList
});
