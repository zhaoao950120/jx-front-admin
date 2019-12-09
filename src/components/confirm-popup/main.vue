<template>
  <el-popover placement="top" width="160" v-model="visible">
    <p>{{ message }}</p>
    <div style="text-align: right; margin: 0">
      <el-button size="mini" type="text" @click="cancel">
        {{ cancelButtonText }}
      </el-button>
      <el-button type="primary" size="mini" @click="confirm">
        {{ confirmButtonText }}
      </el-button>
    </div>
    <slot slot="reference" name="reference"></slot>
  </el-popover>
</template>

<script>
export default {
  name: "KtlConfirmPopup",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ""
    },
    cancelButtonText: {
      type: String,
      default: "取消"
    },
    confirmButtonText: {
      type: String,
      default: "确定"
    }
  },
  data() {
    return {
      visible: this.value
    };
  },
  watch: {
    value(val) {
      this.visible = val;
    },
    visible(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    cancel() {
      this.visible = false;
      this.$emit("cancel");
    },
    confirm() {
      this.visible = false;
      this.$emit("confirm");
    }
  }
};
</script>

<style scoped></style>
