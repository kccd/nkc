import {
  Button, Input, Dialog, FormItem, Form
} from "element-ui";

// @vue/component
export default {
  props: {
    visible: Boolean
  },
  data: () => ({
    newPassword: "",
    newPasswordAgain: "",
    isSmallScreen: false
  }),
  created() {
    window.addEventListener("resize", () => this.isSmallScreen = document.body.clientWidth < 600);
    window.dispatchEvent(new Event("resize"));
  },
  render() {
    return (
      <Dialog
        title="修改密码"
        visible={this.visible}
        width={this.isSmallScreen ? "94%" : "400px"}
        show-close={false}
        onClosed={() => {
          this.newPassword = "";
          this.newPasswordAgain = "";
        }}>
        <Form>
          <FormItem label="新密码">
            <Input placeholder="输入新密码" show-password vModel={this.newPassword}></Input>
          </FormItem>
          <FormItem label="重复新密码">
            <Input placeholder="再次输入新密码" show-password vModel={this.newPasswordAgain}></Input>
          </FormItem>
        </Form>
        <span slot="footer" class="dialog-footer">
          <Button onClick={() => this.$emit("cancel")}>取 消</Button>
          <Button
            type="primary"
            onClick={() => {
              const { newPassword, newPasswordAgain } = this;
              if([newPassword, newPasswordAgain].includes("")) {
                return this.$message.error("密码不能为空");
              }
              if(newPassword !== newPasswordAgain) {
                return this.$message.error("两次输入的新密码不一样");
              }
              this.$emit("confirm", this.newPassword);
            }}>
            确 定
          </Button>
        </span>
      </Dialog>
    )
  }
}