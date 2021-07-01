import { createApp, defineComponent, reactive, watch } from "@vue/composition-api";
import data from "../../lib/data";
import {
  Button, Input, Tag, Image, ColorPicker,
  Table, TableColumn, Popconfirm, Form, FormItem as ElFormItem,
  Dialog, Row, Col
} from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import styled from "vue-styled-components";
import Sortable from "sortablejs";

const tools = new Tools();

console.log(data);
const vueApp = createApp({
  setup() {
    return {
      settings: reactive(data)
    }
  },
  data: () => ({
    editNewTag: false,
    newTag: "",
    tempSiteIcon: "",
    siteIconFile: null,
    saving: false
  }),
  render() {
    return (
      <Wrapper class="col-xs-12 col-md-12">
        <div class="form-horizontal">
          <InputItem
            label="网站名"
            vModel={this.settings.websiteName}>
          </InputItem>
          <InputItem
            label="网站代号"
            vModel={this.settings.websiteCode}>
          </InputItem>
          <InputItem
            label="Github"
            vModel={this.settings.github}>
          </InputItem>
          <InputItem
            label="电话号码"
            vModel={this.settings.telephone}>
          </InputItem>
          <InputItem
            label="版权信息"
            vModel={this.settings.copyright}>
          </InputItem>
          <InputItem
            label="备案信息"
            vModel={this.settings.record}
            type="textarea">
          </InputItem>
          <InputItem
            label="网站简介"
            vModel={this.settings.brief}
            type="textarea">
          </InputItem>
          <InputItem
            label="网站声明"
            vModel={this.settings.statement}
            type="textarea">
          </InputItem>
          <InputItem
            label="网站介绍"
            vModel={this.settings.description}
            type="textarea">
          </InputItem>
          <FormItem label="关键词">
            <div class="keywords">
              {this.settings.keywords.map((keyword, index) => (
                <Tag
                  key={keyword}
                  closable
                  disable-transitions={false}
                  vOn:close={() => this.settings.keywords.splice(index, 1)}>
                  {keyword}
                </Tag>
              ))}
              {this.editNewTag
                ? <Input
                    ref="newTagInput"
                    class="input-new-tag"
                    vModel={this.newTag}
                    size="small"
                    vOn:keyup_enter_native={() => {
                      this.settings.keywords.push(this.newTag);
                      this.editNewTag = false;
                      this.newTag = "";
                    }}
                    vOn:blur={() => {
                      this.editNewTag = false;
                      this.newTag = "";
                    }}
                  >
                  </Input>
                : <Button
                    class="button-new-tag"
                    size="small"
                    onClick={() => {
                      this.editNewTag = true;
                      this.$nextTick(_ => this.$refs.newTagInput.$refs.input.focus())
                    }}>
                    + 新建
                  </Button>
              }
            </div>
          </FormItem>

          <FormItem label="网站图标">
            <Image
              style="width: 150px; height: 150px"
              fit="cover"
              src={this.tempSiteIcon? this.tempSiteIcon : tools.getUrl("siteIcon", this.settings.siteIcon, "sm")}
              onClick={() => this.$refs.selectSiteIconInput.click()}>
            </Image>
            <input
              class="hide"
              type="file"
              accept="image/*"
              ref="selectSiteIconInput"
              onChange={event => {
                const file = event.target.files[0];
                this.tempSiteIcon = URL.createObjectURL(file);
                this.siteIconFile = file;
              }} />
          </FormItem>

          <FormItem label="网页背景颜色">
            <ColorPicker v-model={this.settings.backgroundColor}></ColorPicker>
          </FormItem>

          <FormItem label="页脚链接">
            <h5 class="text-danger">每种链接的数量最好不超过7（显示区域限制）</h5>
            <LinksTable name="关于" vModel={this.settings.links.info} />
            <LinksTable name="应用" vModel={this.settings.links.app} />
            <LinksTable name="友情链接" vModel={this.settings.links.other} />
          </FormItem>

          <FormItem>
            <Button
              type="primary"
              style="width: 100%"
              loading={this.saving}
              onClick={async () => {
                this.saving = true;
                const settings = this.settings;
                const file = this.siteIconFile;
                const form = new FormData();
                form.append("siteicon", file);
                form.append("settings", JSON.stringify(settings));
                try {
                  await nkcUploadFile("/e/settings/base", "PUT", form);
                } catch (res) {
                  return this.$notify.error({
                    title: "保存失败",
                    message: res.error || res
                  });
                } finally {
                  this.saving = false;
                }
                this.$notify({
                  title: "保存成功",
                  type: "success"
                });
              }}>
              保存
            </Button>
          </FormItem>
        </div>
      </Wrapper>
    );
  }
})

const Wrapper = styled.div`
  .keywords {
    .el-tag {
      margin-right: 10px;
      margin-bottom: 10px;
    }
    .input-new-tag {
      width: 99px;
    }
  }
  .el-upload__input {
    display: none;
  }
`;

const InputItem = defineComponent({
  props: {
    label: {
      type: String,
      required: true
    },
    value: [String, Number],
    type: String
  },
  setup(props) {
    return {
      content: props.value
    }
  },
  watch: {
    content(val) {
      this.$emit("input", val)
    }
  },
  render() {
    return (
      <FormItem label={this.label}>
        <Input
          size="medium"
          vModel={this.content}
          type={this.type || "text"}
          rows={this.type? 3 : null}>
        </Input>
      </FormItem>
    )
  }
});

const LinksTable = defineComponent({
  name: "LinksTable",
  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      required: true
    }
  },
  setup(props) {
    return {
      data: props.value
    };
  },
  data: () => ({
    editLinkForm: { name: "", url: "" },
    editLinkVisible: false,
    editLinkCallback: null
  }),
  updated() {
    const _this = this;
    const tbody = $(this.$refs.elTable.$refs.bodyWrapper).find("tbody")[0];
    Sortable.create(tbody, {
      draggable: ".el-table__row",
      animation: 500,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      onEnd: (event) => {
        const { oldIndex, newIndex } = event;
        const target = _this.data.splice(oldIndex, 1).shift();
        _this.data.splice(newIndex, 0, target);
      }
    });
  },
  render() {
    return (
      <div style="margin-top: 30px">
        <h4>{this.name}</h4>
        <Table
          ref="elTable"
          key={this.data.map(item => item.name).join("")}
          data={this.data}
          border
          style="width: 100%">
          <TableColumn
            label="显示名称"
            scopedSlots={{
              default: scoped => (
                <span>{scoped.row.name}</span>
              )
            }}>
          </TableColumn>
          <TableColumn
            label="链接"
            scopedSlots={{
              default: scoped => (
                <span>{scoped.row.url}</span>
              )
            }}>
          </TableColumn>
          <TableColumn
            label="操作"
            scopedSlots={{
              default: scoped => (
                <div slot="default">
                  <Button
                    size="mini"
                    onClick={() => {
                      this.editLinkForm = { ...scoped.row };
                      this.editLinkVisible = true;
                      this.editLinkCallback = function() {
                        const form = { ...this.editLinkForm };
                        if(form.name && form.url) {
                          this.data.splice(scoped.$index, 1, { ...this.editLinkForm })
                        } else {
                          this.$message({
                            message: "编辑失败,表单填写不完整",
                            type: "warning"
                          });
                        }
                      }
                    }}>
                    编辑
                  </Button>
                  <Popconfirm
                    style="margin-left: 14px"
                    confirm-button-text="确认"
                    cancel-button-text="取消"
                    icon="el-icon-info"
                    icon-color="red"
                    title="确定移除此链接吗？"
                    onConfirm={() => this.data.splice(scoped.$index, 1)}
                  >
                    <Button
                      slot="reference"
                      size="mini"
                      type="danger">
                      移除
                    </Button>
                  </Popconfirm>
                </div>
              ),
              header: _ => (
                <Button
                  size="mini"
                  type="primary"
                  round
                  onClick={() => {
                    this.editLinkVisible = true;
                    this.editLinkCallback = function() {
                      const form = { ...this.editLinkForm };
                      if(form.name && form.url) {
                        this.data.push(form);
                        this.$message({
                          message: "添加成功",
                          type: "success"
                        });
                      } else {
                        this.$message({
                          message: "添加失败,表单填写不完整",
                          type: "warning"
                        });
                      }
                    }
                  }}>
                  新建链接
                </Button>
              )
            }}>
          </TableColumn>
        </Table>
        <Dialog
          title="编辑链接"
          visible={this.editLinkVisible}
          show-close={false}>
          <Form>
            <ElFormItem
              label="名称">
              <Input
                size="medium"
                type="text"
                vModel={this.editLinkForm.name}>
              </Input>
            </ElFormItem>
            <ElFormItem
              label="链接">
              <Input
                size="medium"
                type="text"
                vModel={this.editLinkForm.url}>
              </Input>
            </ElFormItem>
          </Form>
          <div slot="footer" class="dialog-footer">
            <Button
              onClick={() => {
                this.editLinkVisible = false;
                this.editLinkForm.name = "";
                this.editLinkForm.url = "";
              }}>
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => {
                this.editLinkVisible = false;
                if(this.editLinkCallback && typeof this.editLinkCallback === "function") {
                  this.editLinkCallback.call(this);
                  this.editLinkCallback = null;
                }
                this.editLinkForm.name = "";
                this.editLinkForm.url = "";
              }}>
              确定
            </Button>
          </div>
        </Dialog>
      </div>
    );
  }
});

const FormItem = ({ props, children }) => (
  <div class="form-group">
    <label class="col-sm-2 control-label">{props.label}</label>
    <div class="col-sm-8">
      {children}
    </div>
  </div>
);

vueApp.mount("#vueApp");
