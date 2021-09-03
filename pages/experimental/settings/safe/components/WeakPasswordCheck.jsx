import { Dialog, Steps, Step, Button, Row, Col, Progress } from "element-ui";
import styled from "vue-styled-components";
import loader from "@monaco-editor/loader";
import ProcessHitUsers from "./ProcessHitUsers";

// @vue/component
export default {
  name: "WeakPasswordCheck",
  props: {
    visible: Boolean
  },
  data: () => ({
    isSmallScreen: false,
    active: 0,
    editor: null,
    saving: false,
    worker: null,
    process: {
      percent: 0,
      hits: []
    }
  }),
  render() {
    return (
      <Dialog
        title="弱密码检测"
        visible={this.visible}
        width={this.isSmallScreen ? "94%" : "800px"}
        close-on-press-escape={false}
        close-on-click-modal={false}
        onClose={() => this.$emit("close")}
        onClosed={() => this.initData()}
        onOpen={() => this.initEditor()}>
        <Steps
          active={this.active}
          finish-status="success"
          align-center>
          <Step title="编辑脚本"></Step>
          <Step title="执行检测"></Step>
          <Step title="处理用户"></Step>
        </Steps>
        <Wrapper>
          <div vShow={this.active === 0}>
            <div class="editor" ref="editor">
              {this.editor === null ? <p class="editor-tips">正在初始化编辑器...</p> : null}
            </div>
            <div class="controls">
              <Button
                class="save-and-execite"
                type="primary"
                loading={this.saving}
                onClick={this.saveAndExecute}
                disabled={!this.editor}>保存并执行</Button>
              <Button class="cancel" onClick={() => this.$emit("close")}>取消</Button>
            </div>
          </div>
          <div vShow={this.active === 1}>
            <p>正在检测...</p>
            <Progress text-inside={true} stroke-width={24} percentage={this.process.percent} status="success"></Progress>
            <p>已检测到<span style="color:red;">{this.process.hits.length}</span>个弱密码</p>
          </div>
          <div vShow={this.active === 2}>
            <ProcessHitUsers
              users={this.process.hits.map(info => info.uid)}
              onExecuted={() => {
                this.$emit("close");
              }} />
          </div>
        </Wrapper>
      </Dialog>
    );
  },
  created() {
    window.addEventListener("resize", () => this.isSmallScreen = document.body.clientWidth < 800);
    window.dispatchEvent(new Event("resize"));
  },
  computed: {
    code: {
      get() {
        return this.editor.getValue();
      },
      set(val) {
        this.editor.setValue(val);
      }
    }
  },
  methods: {
    async getCode() {
      return nkcAPI("/e/settings/safe/weak_password_check/get_code", "POST")
        .then(res => res.sourceCode)
        .catch(err => (err.error || err.message || err).split("\n").map(line => "// " + line).join("\n"));
    },
    async initEditor() {
      if(this.editor) return;
      const sourceCode = await this.getCode();
      loader.init().then(monaco => {
        this.editor = monaco.editor.create(this.$refs.editor, {
          value: sourceCode,
          language: "javascript",
          theme: "vs-dark"
        });
      });
    },
    saveAndExecute() {
      this.saving = true;
      const code = this.editor.getValue();
      nkcAPI("/e/settings/safe/weak_password_check/save_code", "POST", { code })
        .then(() => {
          this.active = 1;
          this.launchWorker();
        })
        .catch(err => this.$messages.error(err.error || err.message || err))
        .then(() => this.saving = false);
    },
    async launchWorker() {
      if(!this.worker) {
        this.worker = new Worker("/e/settings/safe/weak_password_check_worker_script", { name: "Weak Password Checker" });
      }
      const { count } = await nkcAPI("/e/settings/safe/weak_password_check/data_count", "POST");
      console.log("总任务数: ", count);
      let index = 0;
      while(index < count) {
        const { sliceData } = await nkcAPI("/e/settings/safe/weak_password_check/get_data_slice", "POST", { slice: { start: index, length: 3000 }});
        if(!this.visible) return;
        await new Promise((resolve, reject) => {
          this.worker.onmessage = ({ data }) => {
            if(!data.isError) {
              this.process.hits.push(...data);
            } else {
              console.log("出错: ", data);
            }
            index += 3000;
            const ratio = index / count * 100;
            this.process.percent = ratio > 100 ? 100 : Number(ratio.toFixed());
            resolve();
          }
          this.worker.postMessage(sliceData);
        });
      }
      console.log("结束");
      this.active = 2;
    },
    initData() {
      this.active = 0;
      this.process.percent = 0;
      this.process.hits = [];
    }
  }
}

const Wrapper = styled.div`
  .editor {
    height: 300px;
    margin: 18px 0;
    .editor-tips {
      text-align: center;
      line-height: 300px;
    }
  }
  .controls::after {
    content: "";
    display: block;
    clear: both;
  }
  .controls {
    .save-and-execite {
      float: right;
    }
  }
`;