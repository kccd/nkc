import { getDataById } from '../../../lib/js/dataConversion';
import { sweetError } from '../../../lib/js/sweetAlert';
import { timeFormat } from '../../../lib/js/time';
import { nkcAPI } from '../../../lib/js/netAPI';

const data = getDataById('data');
var CommonModal = new window.NKC.modules.CommonModal();

new window.Vue({
  el: '#app',
  data: {
    selected: false,
    list: data.list,
  },
  methods: {
    timeFormat,
    move(type, index) {
      let targetIndex;
      if (type === 'up') {
        if (index === 0) {
          return;
        }
        targetIndex = index - 1;
      } else {
        if (index === this.list.length - 1) {
          return;
        }
        targetIndex = index + 1;
      }
      const currentItem = this.list[index];
      const targetItem = this.list[targetIndex];

      const newList = [...this.list];

      newList[targetIndex] = currentItem;
      newList[index] = targetItem;

      const toolsId = newList.map((item) => item._id);
      nkcAPI('/tools/order', 'POST', {
        toolsId,
      })
        .then(() => {
          this.list = newList;
        })
        .catch(sweetError);
    },
    setStyle(link, dom, dom1) {
      if (link) {
        const t = dom.text().trim();
        if (t === '工具压缩包') {
          dom.hide();
        }
        const t1 = dom1.text().trim();
        if (t1 === '入口文件名') {
          dom1.children('h5').text('链接');
          dom1.children('input').attr('placeholder', '请输入链接');
        }
      } else {
        const t = dom.text().trim();
        if (t === '工具压缩包') {
          dom.show();
        }
        const t1 = dom1.text().trim();
        if (t1 === '链接') {
          dom1.children('h5').text('入口文件名');
          dom1.children('input').attr('placeholder', '默认index');
        }
      }
    },
    selectLink() {
      // radio公共的父级dom
      const radio = window.$('#moduleCommonModalApp div[class=radio]');
      // 链接 第一个为true的radio
      const select = window.$(
        '#moduleCommonModalApp div[class=radio] input[value=true]',
      )[0];
      // 工具压缩包
      const dom = $('#moduleCommonModalApp div[class=form-group]:last');
      // 入口文件
      const dom1 = dom.prev();
      if (!radio[0] || !select || !dom[0] || !dom1[0]) {
        window.asyncSweetSuccess('缺少必要的dom').catch(console.error);
        return;
      }
      if (select) {
        // this.setStyle(select.checked, dom, dom1);
        if (select.checked) {
          dom1.show();
          dom.hide();
        } else {
          dom1.hide();
          dom.show();
        }
      }
      radio[0].onclick = ({ target }) => {
        let link = (select && select.checked) || false;
        if (target.type === 'radio' && target.value === 'true') {
          link = true;
        }
        if (target.type === 'radio' && target.value === 'false') {
          link = false;
        }
        if (link) {
          dom1.show();
          dom.hide();
        } else {
          dom1.hide();
          dom.show();
        }
        // this.setStyle(link, dom, dom1);
      };
    },
    editTool: function (
      version,
      name,
      summary,
      uid,
      author,
      entry,
      isOtherSite,
      id,
    ) {
      CommonModal.open(
        function (form) {
          let formData = new FormData();
          form.forEach((d) => {
            formData.append(d.name, d.value);
          });
          formData.append('_id', id);
          window
            .nkcUploadFile('/tools/update', 'post', formData, (e, percent) => {
              // console.log(percent)
            })
            .then(() => {
              window.asyncSweetSuccess('修改成功', { autoHide: false });
              CommonModal.close();
            })
            .then(() => location.reload())
            .catch(window.asyncSweetError);
        },
        {
          title: '修改工具信息',
          data: [
            {
              dom: 'input',
              label: '版本号',
              name: 'version',
              value: version,
              placeholder: '1.0',
            },
            {
              dom: 'input',
              label: '工具名',
              name: 'name',
              value: name,
              placeholder: '必填',
            },
            {
              dom: 'input',
              label: '简介',
              name: 'summary',
              value: summary,
              placeholder: '可缺省',
            },
            {
              dom: 'input',
              label: '作者',
              name: 'author',
              value: author,
              placeholder: '缺省显示为[匿名]',
            },
            {
              dom: 'input',
              label: '作者uid',
              name: 'uid',
              value: uid,
              placeholder: '可缺省',
            },
            {
              dom: 'radio',
              label: '链接',
              value: isOtherSite,
              name: 'isOtherSite',
              radios: [
                { name: '是', value: true },
                { name: '否', value: false },
              ],
            },
            // {
            //   dom: "input",
            //   label: "入口文件名",
            //   name: "entry",
            //   value: entry,
            //   placeholder: "必填，默认index"
            // },
            {
              dom: 'input',
              label: '链接',
              name: 'entry',
              value: isOtherSite ? entry : '',
              placeholder: '请输入链接',
            },
            {
              dom: 'input',
              label: '工具压缩包',
              type: 'file',
              name: 'file',
              accept: '.zip',
            },
          ],
        },
      );
      this.$nextTick(() => {
        this.selectLink();
      });
    },
    deleteTool: function (id, toolname) {
      window
        .sweetConfirm(`确定要删除 ${toolname} 吗？（此操作不可恢复）`)
        .then(() => window.nkcAPI('/tools/delete?_id=' + id, 'DELETE'))
        .then(() => window.asyncSweetSuccess('删除成功', { autoHide: false }))
        .then(() => location.reload())
        .catch(window.asyncSweetError);
    },
    addTool: function () {
      CommonModal.open(
        function (form) {
          if (form[5].value) {
            const reg = /^http(s)?:\/\/.+/;
            if (!reg.test(form[6].value)) {
              window.asyncSweetError('请输入正确的链接');
              return;
            }
          }
          let formData = new FormData();
          form.forEach((d) => {
            formData.append(d.name, d.value);
          });
          window
            .nkcUploadFile('/tools/upload', 'post', formData, (e, percent) => {
              console.log(percent);
            })
            .then(() => {
              window.asyncSweetSuccess('上传成功', { autoHide: false });
              CommonModal.close();
            })
            .then(() => location.reload())
            .catch(window.asyncSweetError);
        },
        {
          title: '上传工具',
          // 如果label改变，请改变setStyle方法中对应的dom内容
          data: [
            {
              dom: 'input',
              label: '版本号',
              name: 'version',
              value: '',
              placeholder: '1.0',
            },
            {
              dom: 'input',
              label: '工具名',
              name: 'name',
              value: '',
              placeholder: '必填',
            },
            {
              dom: 'input',
              label: '简介',
              name: 'summary',
              value: '',
              placeholder: '可缺省',
            },
            {
              dom: 'input',
              label: '作者',
              name: 'author',
              value: '',
              placeholder: '缺省显示为[匿名]',
            },
            {
              dom: 'input',
              label: '作者uid',
              name: 'uid',
              value: '',
              placeholder: '可缺省',
            },
            {
              dom: 'radio',
              label: '链接',
              value: false,
              name: 'isOtherSite',
              radios: [
                { name: '是', value: true },
                { name: '否', value: false },
              ],
            },
            // {
            //   dom: "input",
            //   label: "入口文件名",
            //   name: "entry",
            //   value: "",
            //   placeholder: "默认index"
            // },
            {
              dom: 'input',
              label: '链接',
              name: 'entry',
              value: '',
              placeholder: '请输入链接',
            },
            {
              dom: 'input',
              label: '工具压缩包',
              type: 'file',
              name: 'file',
              accept: '.zip',
            },
          ],
        },
      );
      this.$nextTick(() => {
        this.selectLink();
      });
    },
    hideTool: function (id, toolname, isHide) {
      window
        .sweetConfirm(
          isHide
            ? `要取消屏蔽 ${toolname} 吗？`
            : `确定要屏蔽 ${toolname} 吗？（可以随时取消屏蔽）`,
        )
        .then(() => window.nkcAPI('/tools/hide?_id=' + id, 'DELETE'))
        .then(() =>
          window.asyncSweetSuccess(isHide ? '屏蔽已取消' : '已屏蔽', {
            autoHide: false,
          }),
        )
        .then(() => location.reload())
        .catch(window.asyncSweetError);
    },
    enableSiteTool: function () {
      window
        .nkcAPI('/tools/enableSiteTools', 'POST')
        .then((data) =>
          window.asyncSweetSuccess(data.message, { autoHide: false }),
        )
        .then(() => location.reload())
        .catch(window.asyncSweetError);
    },
  },
});

window.CommonModal = CommonModal;
