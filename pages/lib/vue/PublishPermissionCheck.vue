<template lang="pug">
  div(:class="$style.container" v-if="showPanel").m-b-1.bg-danger.p-a-05
    div(:class="$style.tasksContainer" v-if="showTask")
      h5 请完成以下任务，获取完整发表权限。
      div(:class="$style.taskContainer" v-for="task in tasks")
        div
          <check-one :class="$style.icon" class='text-success' theme="outline" v-if='task.completed'/>
          <close-one :class="$style.icon" class='text-danger' theme="outline" v-else/>
        div {{task.name}}
        div(v-if="type !== 'moment' || task.type !== 'momentCount'")
          a.btn.btn-xs.btn-default(v-if='!task.completed' :href="task.link" target="_blank") {{task.title}}
    div(:class="$style.warningContainer")
      div(:class="$style.countLimitContainer" v-if="permissionStatus.examCountWarning.show")
        <info theme="outline" :class="$style.icon + ' text-danger'" />
        div.text-danger {{permissionStatus.examCountWarning.desc}}
      div(:class="$style.countLimitContainer" v-if="permissionStatus.countLimit.limited")
        <info theme="outline" :class="$style.icon + ' text-danger'" />
        div.text-danger {{permissionStatus.countLimit.reason}}
      div(:class="$style.timeLimitContainer" v-if="timeTill")
        <info theme="outline" :class="$style.icon + ' text-danger'" />
        div.text-danger 您当前的账号等级（{{permissionStatus.userGradeName}}）限定发表间隔时间不能小于 {{formatDuration(permissionStatus.timeLimit.interval)}}，请在 {{timeTill}} 后再试。
</template>

<script>
import { nkcAPI } from '../js/netAPI';
import { sweetError } from '../js/sweetAlert';
import CheckOne from '@icon-park/vue/es/icons/CheckOne';
import CloseOne from '@icon-park/vue/es/icons/CloseOne';
import Info from '@icon-park/vue/es/icons/Info';
import { formatDuration } from '../js/time';
import { publishPermissionTypes } from '../js/publish';

export default {
  data: () => ({
    permissionStatus: null,
    timeTill: '',
    timer: 0,
  }),
  components: {
    info: Info,
    'check-one': CheckOne,
    'close-one': CloseOne,
  },
  props: ['type'],
  beforeDestroy() {
    clearTimeout(this.timer);
  },
  mounted() {
    this.getPermission();
  },
  computed: {
    showPanel() {
      if (!this.permissionStatus) return false;
      const { tasks, countLimit, timeLimit, examCountWarning } =
        this.permissionStatus;
      return (
        (tasks.username && !tasks.username.completed) ||
        (tasks.avatar && !tasks.avatar.completed) ||
        (tasks.authLevel && !tasks.authLevel.completed) ||
        (tasks.exam && !tasks.exam.completed) ||
        (tasks.moment && !tasks.moment.completed) ||
        (tasks.verifyPhoneNumber && !tasks.verifyPhoneNumber.completed) ||
        countLimit.limited ||
        this.timeTill ||
        examCountWarning.show
      );
    },
    tasks() {
      return Object.values(this.permissionStatus.tasks).filter((item) => {
        return item.completed === false;
      });
    },
    showTask() {
      for (const task of this.tasks) {
        if (!task.completed) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    formatDuration,
    resetTimeTill() {
      this.timer = setTimeout(() => {
        if (!this.permissionStatus.timeLimit.limited) {
          return;
        }
        const timeTillNumber =
          this.permissionStatus.timeLimit.till - Date.now();
        if (timeTillNumber > 0) {
          this.timeTill = formatDuration(timeTillNumber);
          this.resetTimeTill();
        } else {
          this.timeTill = '';
        }
      }, 1000);
    },
    getPermission() {
      nkcAPI(`/api/v1/settings/publish/permission?type=${this.type}`, 'GET')
        .then((res) => {
          this.permissionStatus = res.data.permissionStatus;
          this.resetTimeTill();
        })
        .catch(sweetError);
    },
  },
};
</script>

<style lang="less" scoped module>
.container {
  border-radius: 3px;
}
.warningContainer {
  & > div:last-child {
    margin-bottom: 0;
  }
}
.tasksContainer {
  margin-bottom: 0.5rem;
}
.taskContainer {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  & > div {
    display: flex;
    align-items: center;
  }
  & > div:first-child {
    //margin-right: 0.3rem;
  }
  & > div:nth-child(2) {
    margin-right: 0.5rem;
  }
}
.timeLimitContainer {
  display: flex;
  margin-bottom: 0.5rem;
}
.countLimitContainer {
  display: flex;
  margin-bottom: 0.5rem;
}
.icon {
  font-size: 1.4rem;
  height: 1.4rem;
  margin-right: 0.5rem;
}
</style>
