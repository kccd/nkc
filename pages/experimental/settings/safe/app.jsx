import { createApp, reactive } from "@vue/composition-api";
import styled from "vue-styled-components";
import data from "../../../lib/data";
import "element-ui/lib/theme-chalk/index.css";
import {
  Button, Row, Col, Tabs, TabPane, Switch, Input, Tooltip
} from "element-ui";
import ModifyPasswordDialog from "./components/ModifyPasswordDialog";
import WeakPasswordCheck from "./components/WeakPasswordCheck";

// @vue/component
const App = {
  data: () => ({
    form: { ...data.safeSettings },
    isSmallScreen: false,
    inModifyPassword: false,
    inWeakPasswordCheck: false
  }),
  render() {
    return (
      <Layout>
        <Tabs tab-position={this.isSmallScreen? "top":"right"} style="height: 200px;">
          <TabPane label="安全设置">
            <SettingItem title="后台二次密码验证">
              <Switch vModel={this.form.experimentalVerifyPassword}></Switch>
            </SettingItem>
            <SettingItem title="后台会话过期时间">
              <Tooltip
                effect="light"
                content={"登陆后台之后的" + this.form.experimentalTimeout + "分钟内无任何操作，将自动退出登陆"}
                placement="right"
                open-delay={1000}>
                <Input placeholder="请输入数字" size="medium" vModel={this.form.experimentalTimeout} style="max-width: 200px">
                  <span slot="append">分钟</span>
                </Input>
              </Tooltip>
            </SettingItem>
            <SettingItem title="后台密码">
              <span>{this.form.hasPassword? "已设置后台密码" : "无密码"}</span>
              <span style="margin-left: 10px; color: #409EFF; cursor: pointer;" onClick={() => this.inModifyPassword = true}>修改</span>
              <ModifyPasswordDialog
                visible={this.inModifyPassword}
                onCancel={() => this.inModifyPassword = false}
                onConfirm={password => this.modifyPassword(password)} />
            </SettingItem>
          </TabPane>

          <TabPane label="手机号验证">
            <SettingItem title="定时手机号验证">
              <Switch vModel={this.form.phoneVerify.enable}></Switch>
            </SettingItem>
            <SettingItem title="间隔时间">
              <Tooltip
                effect="light"
                content={"每" + this.form.phoneVerify.interval + "小时需要重新进行手机号验证，否则发表新内容会送审"}
                placement="right"
                open-delay={1000}>
                <Input size="medium" vModel={this.form.phoneVerify.interval} style="max-width: 200px">
                  <span slot="append">小时</span>
                </Input>
              </Tooltip>
            </SettingItem>
          </TabPane>

          <TabPane label="安全工具">
            <SettingItem title="弱密码检测">
              <Button size="small" onClick={() => this.inWeakPasswordCheck = true}>打开工具</Button>
              <WeakPasswordCheck visible={this.inWeakPasswordCheck} onClose={() => this.inWeakPasswordCheck = false} />
            </SettingItem>
          </TabPane>
        </Tabs>
      </Layout>
    );
  },
  created() {
    const checkScreen = () => this.isSmallScreen = document.body.clientWidth < 765;
    window.addEventListener("resize", checkScreen);
    checkScreen();
  },
  computed: {
    formObject() {
      return deepCloneUnsafe(this.form)
    }
  },
  watch: {
    formObject: {
      handler: debounce(function(val, oldVal) {
        this.save(val)
          .catch(err => {
            this.$message.error(
              err
                ? err.error ?? err.message ?? err
                : "未知错误"
            );
            Vue.set(this, "form", oldVal);
          })
      }, 1000),
      deep: true
    }
  },
  methods: {
    async save(safeSettings) {
      if(safeSettings.experimentalTimeout < 5) {
        throw this.$message.error("后台密码过期时间不能小于5分钟");
      }
      return await nkcAPI("/e/settings/safe", "PUT", { safeSettings });
    },
    modifyPassword(newPassword) {
      nkcAPI("/e/settings/safe/modifyPassword", "POST", { newPassword })
        .then(() => {
          this.inModifyPassword = false;
          this.$message.success("修改成功");
        })
        .catch(err => this.$message.error(err.error || err.message || err));
    },
    runWeakPasswordCheck: function() {
      nkcAPI("/e/settings/safe/weakPasswordCheck", "GET")
        .then(function() {
          sweetAlert("检测已启动，将在后台执行，请大概5分钟后查看结果")
        })
        .catch(sweetError)
    }
  }
};

// @vue/component
const SettingItem = ({ props, children }) => (
  <Row gutter={20}>
    <Col span={6}>
      <SettingItemTitle>
        {props.title}
      </SettingItemTitle>
    </Col>
    <Col span={18}>
      {children}
    </Col>
  </Row>
);

const SettingItemTitle = styled.div`
  text-align: right;
  font-weight: 400;
  font-size: 1.1em;
`;

const Layout = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 15px;
  box-sizing: border-box;
  .el-row + .el-row {
    margin-top: 20px;
  }
`;

function noop() {}

function deepCloneUnsafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function debounce(fn = noop, interval = 50) {
  let timer = null;
  return function debouncedFn(...inputs) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.call(this, ...inputs), interval);
  }
}

createApp(App).mount("#app");