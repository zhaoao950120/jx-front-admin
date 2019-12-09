<template>
  <el-card v-loading="loading" :header="$route.meta.title" shadow="never">
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="200px"
      style="width: 600px"
      hide-required-asterisk
    >
      <el-form-item label="服务名称:" prop="name">
        <el-input v-model="form.name" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="服务图标:" prop="icon">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleIconSuccess"
          :before-upload="beforeImageUpload"
        >
          <img
            v-if="form.icon"
            :src="form.icon"
            class="avatar-uploader__image"
          />
          <i v-else class="el-icon-plus avatar-uploader__icon"></i>
          <div slot="tip" class="el-upload__tip">
            只能上传jpg/png文件，且不超过8M。建议尺寸：400×400像素
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="类型:" prop="type">
        <el-select v-model="form.type" placeholder="请选择">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="搜索关键词:" prop="keyword">
        <el-input v-model="form.keyword" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item
        v-if="form.type === 'NORMAL' || form.type === 'THIRD'"
        label="搜索过滤条件:"
        prop="filter"
      >
        <el-input v-model="form.filter" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item v-if="form.type === 'WE_APP'" label="App ID:" prop="appId">
        <el-input v-model="form.appId" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="启用:" prop="disabled">
        <el-switch
          v-model="form.disabled"
          :active-value="false"
          :inactive-value="true"
        ></el-switch>
      </el-form-item>
      <el-form-item label="排序(越大越靠前):" prop="sortOrder">
        <el-slider v-model="form.sortOrder" :min="-100" :max="100"></el-slider>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('form')"> 保存 </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
export default {
  name: "serviceCategoryEdit",
  data() {
    return {
      typeOptions: [
        { label: "普通", value: "NORMAL" },
        { label: "本地", value: "LOCAL" },
        { label: "第三方", value: "THIRD" },
        { label: "小程序", value: "WE_APP" }
      ],

      uploadUrl: process.env.VUE_APP_BASE_URL + "/oss",
      loading: false,
      searching: false,
      form: {
        id: undefined,
        name: "",
        icon: "",
        keyword: "",
        filter: "",
        appId: "",
        type: "NORMAL",
        disabled: false,
        sortOrder: 0
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "change" }],
        icon: [
          { required: true, message: "请选择上传图标", trigger: "change" }
        ],
        type: [
          { required: true, message: "请选择服务类型", trigger: "change" }
        ],
        keyword: [
          { required: true, message: "请输入搜索关键词", trigger: "change" }
        ],
        appId: [{ required: true, message: "请输入App ID", trigger: "change" }],
        disabled: [
          { required: true, message: "请选择是否启用", trigger: "change" }
        ],
        sortOrder: [
          { required: true, message: "请选择排序", trigger: "change" }
        ]
      }
    };
  },
  created() {
    const id = this.$route.query.id;
    if (id) {
      this.form.id = id;
      this.load();
    }
  },
  methods: {
    beforeImageUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isPNG = file.type === "image/png";
      const isLt8M = file.size / 1024 / 1024 < 8;

      if (!isJPG && !isPNG) {
        this.$message.error("上传图片只能是 JPG/PNG 格式!");
        return false;
      }
      if (!isLt8M) {
        this.$message.error("上传图片大小不能超过 8MB!");
        return false;
      }
      return true;
    },
    handleIconSuccess(res) {
      this.form.icon = res.url;
    },
    load() {
      this.loading = true;
      this.$http
        .get("/admin/service_category/get", {
          params: { id: this.form.id }
        })
        .then(
          res => {
            const data = res.data;
            this.form = {
              id: data.id,
              name: data.name,
              icon: data.icon,
              keyword: data.keyword,
              filter: data.filter,
              appId: data.appId,
              type: data.type,
              disabled: data.disabled,
              sortOrder: data.sortOrder
            };

            this.loading = false;
          },
          () => (this.loading = false)
        );
    },
    onSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http
            .post(
              this.form.id
                ? "/admin/service_category/update"
                : "/admin/service_category/create",
              this.form
            )
            .then(() => {
              this.$message.success("保存成功");
              this.$router.push("/service_category");
            });
        }
      });
    }
  }
};
</script>

<style>
.map-container {
  width: 600px;
  height: 400px;
}
</style>
