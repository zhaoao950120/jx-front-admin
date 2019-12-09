<template>
  <div class="login">
    <el-card class="login-card" shadow="never">
      <div class="login-brand">
        <img
          class="login-brand__logo"
          src="../assets/img/logo.png"
          alt="logo"
        />
        <h1 class="login-brand__text">汽车问答</h1>
      </div>
      <el-form
        :model="form"
        status-icon
        :rules="rules"
        ref="ruleForm"
        @submit.native="submitForm('ruleForm')"
        @submit.native.prevent
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="el-icon-mobile-phone"
            auto-complete="off"
            spellcheck="false"
            maxlength="24"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="form.password"
            placeholder="密码"
            prefix-icon="el-icon-view"
            auto-complete="off"
            maxlength="24"
          >
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="submitting"
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      submitting: false,
      form: {
        username: "",
        password: ""
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "change" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "change" }]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.submitting = true;
          this.$store
            .dispatch("Login", this.form)
            .then(() => {
              this.submitting = false;

              const redirectUrl = this.$store.getters.redirectUrl;
              this.$store.dispatch("SetRedirectUrl", "/");

              this.$router.replace(redirectUrl);
            })
            .catch(() => (this.submitting = false));
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  background: #f0f2f5
    url(https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg)
    no-repeat center 110px;
  background-size: 100%;
}

.login-card {
  position: absolute;
  width: 400px;
  border: 0;
  background: transparent;
}

.login-brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: rgba(0, 0, 0, 0.85);
}

.login-brand__logo {
  width: 48px;
  height: 48px;
}

.login-brand__text {
  margin-left: 12px;
  font-size: 32px;
  font-weight: bold;
  line-height: 64px;
}

.login-button {
  width: 100%;
}
</style>
