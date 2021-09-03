import { Table, TableColumn, Button, Select, Option, Dropdown, DropdownItem, DropdownMenu } from "element-ui";
import styled from "vue-styled-components";
import moment from "moment";

// @vue/components
export default {
  name: "ProcessHitUsers",
  props: {
    users: Array
  },
  data: (() => ({
    list: [],
    inExecution: false
  })),
  render() {
    return (
      <Wrapper>
        <p class="title">弱密码检测结果</p>
        <Table
          data={this.list}
          border
          style="width: 100%">
          <TableColumn
            label="用户名"
            scopedSlots={{
              default: (props) => (
                <a href={props.row.userHomeUrl} target="_blank">{props.row.username}</a>
              )
            }}>
          </TableColumn>
          <TableColumn
            prop="role"
            label="角色">
          </TableColumn>
          <TableColumn
            prop="lastVisit"
            label="最后访问时间">
          </TableColumn>
          <TableColumn
            prop="publish"
            label="发表数(文章/评论)">
          </TableColumn>
          <TableColumn
            label="操作"
            scopedSlots={{
              default: (props) => (
                <Select vModel={props.row.method} placeholder="请选择">
                  <Option label="发送修改密码通知" value="send" />
                  <Option label="封禁账号" value="ban" />
                  <Option label="不处理" value="noop" />
                </Select>
              ),
              header: (props) => (
                <Dropdown
                  trigger="click"
                  onCommand={command => this.list.forEach(user => user.method = command)}>
                  <span>
                    操作<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <DropdownMenu slot="dropdown">
                    <DropdownItem command="send">全选发送通知</DropdownItem>
                    <DropdownItem command="ban">全选封禁账号</DropdownItem>
                    <DropdownItem command="noop">全选不处理</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )
            }}>
          </TableColumn>
        </Table>
        <div class="clearfix controls">
          <Button
            class="float-right"
            type="primary"
            onClick={this.handleUser}
            loadding={this.inExecution}>
            执行
          </Button>
        </div>
      </Wrapper>
    );
  },
  watch: {
    users() {
      this.updateUserList();
    }
  },
  methods: {
    handleUser() {
      this.inExecution = true;
      nkcAPI("/e/settings/safe/weak_password_check/handle_user", "POST", { handleUsers: this.list.map(({ uid, method }) => ({ uid, method })) })
        .then(() => this.$message.success("执行成功"))
        .catch(err => this.$message.error(err.error || err.message || err))
        .then(() => {
          this.inExecution = false;
          this.$emit("executed");
        });
    },
    async updateUserList() {
      const list = [];
      const tools = new Tools();
      for(const uid of this.users) {
        const res = await nkcAPI("/u?uid=" + uid, "GET");
        const [user] = res.targetUsers;
        if(!user) continue;
        list.push({
          uid,
          userHomeUrl: tools.getUrl("userHome", uid),
          username: user.username,
          lastVisit: moment(user.tlv).format("YYYY-MM-DD h:m:s"),
          role: user.info.certsName,
          publish: `${user.threadCount} / ${user.postCount}`,
          method: "send"
        });
      }
      this.list = list;
    },
  }
}

const Wrapper = styled.div`
  padding-top: 18px;
  .title {
    font-size: 20px;
    margin-bottom: 12px;
  }
  .clearfix::after {
    content: "";
    display: block;
    clear: both;
  }
  .float-right {
    float: right;
  }
  .controls {
    margin-top: 20px;
  }
`;