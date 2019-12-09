<template>
  <el-card v-loading="loading" :header="$route.meta.title" shadow="never">
    <el-form ref="dataForm" :rules="rules" :model="dataForm" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="dataForm.title"
          placeholder="请输入文章标题"
        ></el-input>
      </el-form-item>
      <el-form-item label="来源" prop="copyFrom">
        <el-input
          v-model="dataForm.copyFrom"
          placeholder="请输入文章来源"
        ></el-input>
      </el-form-item>
      <el-form-item label="简介" prop="intro">
        <el-input
          v-model="dataForm.intro"
          placeholder="请输入文章简介"
        ></el-input>
      </el-form-item>
      <el-form-item label="缩略图" prop="thumb">
        <el-input
          v-model="dataForm.thumb"
          placeholder="请输入图片地址或上传图片"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-upload
          class="avatar-uploader"
          name="file"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="dataForm.thumb" :src="dataForm.thumb" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>

      <el-form-item label="页面内容" prop="content">
        <quill-editor
          v-model="dataForm.content"
          style="line-height: normal"
        ></quill-editor>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('dataForm')">
          发布
        </el-button>
        <el-button @click="resetForm('dataForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
export default {
  name: "publishNews",
  data() {
    const form = {
      title: "",
      copyFrom: "",
      intro: "",
      content: "",
      thumb: ""
    };
    return {
      loading: false,
      uploadUrl: `${process.env.VUE_APP_BASE_URL}/oss`,
      dataForm: form,
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "change" }],
        content: [{ required: true, message: "请输入内容", trigger: "change" }]
      }
    };
  },
  mounted() {
    const id = this.$route.params.id;
    if (id) {
      this.loading = true;
      this.$http.get(`/admin/news/${id}`).then(
        res => {
          const item = res.data;
          this.dataForm = {
            id: item.id,
            title: item.title,
            copyFrom: item.copyFrom,
            intro: item.intro,
            content: item.content,
            thumb: item.thumb
          };

          this.loading = false;
        },
        () => (this.loading = false)
      );
    }
  },
  methods: {
    handleAvatarSuccess(res) {
      this.dataForm.thumb = res.url;
    },
    beforeAvatarUpload(file) {
      const isImg = file.type === "image/jpeg" || "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImg) {
        this.$message.error("上传图片只能是 JPG、PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isImg && isLt2M;
    },
    submitForm(formName) {
      console.log("提交", this.dataForm);
      this.$refs[formName].validate(
        function(valid) {
          if (valid) {
            (this.dataForm.id
              ? this.$http.put(`/admin/news/${this.dataForm.id}`, this.dataForm)
              : this.$http.post("/admin/news", this.dataForm)
            )
              .then(() =>
                this.$notify({
                  title: "成功",
                  message: "发布成功",
                  type: "success",
                  duration: 2000,
                  onClose: () => {
                    this.$router.back();
                  }
                })
              )
              .catch(err =>
                this.$notify({
                  title: "失败",
                  message:
                    (err.response && err.response.data.message) || "删除失败",
                  type: "error",
                  duration: 2000
                })
              );
          } else {
            console.log("error submit!!");
            return false;
          }
        }.bind(this)
      );
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 288px;
  height: 178px;
  line-height: 178px !important;
  text-align: center;
}

.avatar {
  width: 288px;
  height: 178px;
  display: block;
}
</style>
