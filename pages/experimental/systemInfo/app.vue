<template>
  <div>
    <el-timeline class="col-xs-12 col-md-7">
      <el-timeline-item
        v-for="(msg, index) in list"
        :key="msg.id"
        :timestamp="msg.createAt + ' ' + translate(msg.mode) + '通知'"
        placement="top"
        :color="msg.mode === 'broadcast' ? '#ef5350' : msg.mode === 'filter' ? '#ffc107' : msg.mode === 'user' ? '#2196f3' : 'black'">
        <el-popover
          placement="right"
          width="400"
          trigger="click">
          <div>{{msg}}</div>
          <el-card shadow="never" class="message" slot="reference">{{msg.content}}</el-card>
        </el-popover>
        <el-row class="clearfix">
          <el-popconfirm
            title="确认删除吗？"
            class="message-control"
            @confirm="deleteMessage(index)">
            <el-button slot="reference" type="text">删除</el-button>
          </el-popconfirm>
          <el-button
            type="text"
            class="message-control"
            @click="editForm.id = msg.id; editForm.content = msg.content; editForm.index = index; showEditor = true;">
            编辑内容
          </el-button>
        </el-row>
      </el-timeline-item>
    </el-timeline>

    <el-dialog
      title="新建系统通知"
      :visible.sync="showForm"
      top="50px"
      :width="formDialogWidth + 'px'"
      :lock-scroll="false"
      :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="通知内容">
          <el-input
            type="textarea"
            v-model="form.content"
            :autosize="{ minRows: 4, maxRows: 20}">
          </el-input>
        </el-form-item>
        <el-form-item label="发送方式">
          <el-radio-group v-model="form.mode" size="small">
            <el-radio-button label="broadcast">全站广播</el-radio-button>
            <el-radio-button label="filter">过滤用户</el-radio-button>
            <el-radio-button label="user">指定用户</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="form.mode === 'filter'">
          <el-form-item label="最后访问时间">
            <el-date-picker
              v-model="form.lastVisit"
              type="datetimerange"
              :picker-options="lastVisitOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="left">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="角色">
            <el-checkbox-group v-model="form.roles">
              <el-checkbox v-for="role in roles" :label="role._id" :key="role.displayName">{{role.displayName}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="等级">
            <el-checkbox-group v-model="form.grades">
              <el-checkbox v-for="grade in grades" :label="grade._id" :key="grade.displayName">{{grade.displayName}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
        <div v-if="form.mode === 'user'">
          <el-form-item label="用户">
            <el-select
              v-model="form.uids"
              multiple
              filterable
              remote
              reserve-keyword
              placeholder="用户ID / 用户名 / 文章ID / 评论ID / 专栏ID"
              :remote-method="searchUser"
              :loading="selectUser.loading"
              style="width: 400px">
              <el-option
                v-for="user in selectUser.list"
                :key="user.label"
                :label="user.label"
                :value="user.uid">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm(); showForm = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit()">发送</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="编辑内容"
      :visible.sync="showEditor">
      <el-form :model="editForm">
        <el-form-item label="通知内容">
          <el-input
            type="textarea"
            v-model="editForm.content"
            :autosize="{ minRows: 4, maxRows: 20}">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditor = false">取消</el-button>
        <el-button type="primary" @click="updateMessage(); showEditor = false">确定</el-button>
      </div>
    </el-dialog>

    <el-button
      type="primary"
      icon="el-icon-plus"
      circle
      class="create-button"
      @click="showForm = true">
    </el-button>
  </div>
</template>

<script>
import moment from "moment";
import data from "../../lib/data";
console.log(data);
export default {
  data: () => ({
    list: [],
    form: {
      content: "",
      mode: "broadcast",
      lastVisit: [],
      roles: [],
      grades: [],
      uids: []
    },
    editForm: {
      index: null,
      id: "",
      content: ""
    },
    showForm: false,
    showEditor: false,
    lastVisitOptions: {
      shortcuts: [{
        text: '最近一周',
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          picker.$emit('pick', [start, end]);
        }
      }, {
        text: '最近一个月',
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          picker.$emit('pick', [start, end]);
        }
      }, {
        text: '最近三个月',
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
          picker.$emit('pick', [start, end]);
        }
      }]
    },
    roles: data.roles,
    grades: data.grades,
    selectUser: {
      loading: false,
      list: [],
      timer: null
    },
    submitting: false,
    updating: false,
    formDialogWidth: 0
  }),
  created() {
    this.list = data.systemMessages.map(msg => ({
      ...msg.c,
      createAt: moment(new Date(msg.tc)).format("YYYY年M月D日H点m分"),
      id: msg._id
    }));
    this.calculationFormDialogWidth();
    window.addEventListener("resize", this.calculationFormDialogWidth.bind(this));
  },
  methods: {
    async searchUser(query) {
      if(!query) return this.selectUser.list = [];
      clearTimeout(this.timer);
      this.selectUser.loading = true;
      this.timer = setTimeout(async () => {
        const res = await nkcAPI("/e/systemInfo/fuzzy_search_user?query=" + query, "GET");
        this.selectUser.list = res.result;
        this.selectUser.loading = false;
      }, 1000);
    },
    async submit() {
      this.submitting = true;
      try {
        const res = await nkcAPI("/e/systemInfo", "POST", { form: {...this.form} });
        this.$message.success("发送成功");
        const msg = res.message;
        this.list.unshift({
          ...msg.c,
          createAt: moment(new Date(msg.tc)).format("YYYY年M月D日H点m分"),
          id: msg._id
        });
        this.resetForm();
        this.showForm = false;
      } catch (error) {
        this.$message.error(error.error);
      } finally {
        this.submitting = false;
      }
    },
    async updateMessage() {
      this.updating = true;
      try {
        const form = {...this.editForm};
        const res = await nkcAPI("/e/systemInfo", "PUT", { form });
        this.$message.success("更新成功");
        const msg = res.content;
        if(this.list[form.index] && this.list[form.index].id === form.id) {
          this.list[form.index].content = form.content;
        }
        this.editForm = {
          index: null,
          id: "",
          content: ""
        },
        this.showEditor = false;
      } catch (error) {
        this.$message.error(error.error);
      } finally {
        this.showEditor = false;
      }
    },
    resetForm() {
      this.form = {
        content: "",
        mode: this.form.mode,
        lastVisit: [],
        roles: [],
        grades: [],
        uids: []
      }
    },
    translate(key) {
      return ({
        broadcast: "全站广播",
        filter: "过滤用户",
        user: "指定用户"
      })[key];
    },
    calculationFormDialogWidth() {
      const { clientWidth } = document.body;
      this.formDialogWidth = clientWidth > 800 ? 800 : clientWidth;
    },
    async deleteMessage(index) {
      try {
        const msg = this.list[index];
        await nkcAPI("/e/systemInfo?id=" + msg.id, "DELETE");
        this.$message({
          message: "已删除",
          type: 'success'
        });
        this.list.splice(index, 1);
      }catch(error) {
        this.$message.error(error.error);
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .clearfix::after {
    content: "";
    display: block;
    clear: both;
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .demonstration {
    display: block;
    color: #8492a6;
    font-size: 14px;
    margin-bottom: 20px;
  }
  .message + .message {
    margin-top: 20px;
  }
  .message:hover {
    cursor: pointer;
    border: 1px solid rgb(29, 172, 255);
  }
  .create-button {
    position: fixed;
    right: 50px;
    bottom: 50px;
    z-index: 9999;
  }
  .message-control {
    float: right;
  }
  .message-control + .message-control {
    margin-right: 12px;
  }
</style>