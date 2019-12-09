<template>
  <el-card :header="$route.meta.title" shadow="never">
    <el-form
      inline
      :model="listQuery"
      @submit.native="search"
      @submit.native.prevent
    >
      <el-form-item>
        <el-radio-group v-model="listQuery.role" @change="search">
          <el-radio-button>全部</el-radio-button>
          <el-radio-button label="USER">用户</el-radio-button>
          <el-radio-button label="ADMIN">管理员</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <!--      <el-form-item>-->
      <!--        <el-radio-group v-model="listQuery.robot" @change="search">-->
      <!--          <el-radio-button>全部</el-radio-button>-->
      <!--          <el-radio-button :label="false">普通</el-radio-button>-->
      <!--          <el-radio-button :label="true">机器人</el-radio-button>-->
      <!--        </el-radio-group>-->
      <!--      </el-form-item>-->
      <el-form-item>
        <el-input placeholder="请输入用户名" v-model="listQuery.username">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="请输入昵称" v-model="listQuery.name"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" icon="el-icon-search">
          查询
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleCreate" icon="el-icon-edit">
          添加
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 查询结果 -->
    <el-table
      size="small"
      :data="list"
      v-loading="listLoading"
      element-loading-text="正在查询中..."
      fit
      highlight-current-row
      max-height="640"
    >
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column
        align="center"
        width="100"
        label="用户ID"
        prop="id"
        sortable
      ></el-table-column>
      <el-table-column align="center" width="80" label="头像" prop="avatar">
        <template slot-scope="scope">
          <img
            class="table-avatar"
            :src="scope.row.avatar || '/static/images/avatar-default.png'"
          />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        width="100"
        label="用户名"
        prop="username"
      ></el-table-column>
      <el-table-column prop="role" label="角色" align="center" width="160">
        <template slot-scope="scope">
          <el-tag :type="scope.row.role | roleColor">
            {{ scope.row.role | roleText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        width="100"
        label="昵称"
        prop="name"
      ></el-table-column>
      <el-table-column
        align="center"
        label="特长"
        prop="intro"
      ></el-table-column>
      <el-table-column
        align="center"
        width="120"
        label="经验值"
        prop="bonusPoints"
      ></el-table-column>
      <el-table-column
        align="center"
        width="120"
        label="提问价格"
        prop="askingPrice"
      ></el-table-column>
      <el-table-column
        align="center"
        width="120"
        label="余额"
        prop="balance"
      ></el-table-column>
      <el-table-column align="center" width="80" label="性别" prop="gender">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.gender | genderText }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="操作"
        width="300"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            :disabled="scope.row.robot"
            type="success"
            size="mini"
            @click="handleAllocateRobot(scope.row)"
          >
            分配小号
          </el-button>
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >
            编辑
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">
            删除
          </el-button>
          <el-button
            v-if="scope.row.disabled"
            type="warning"
            size="mini"
            @click="handleEnable(scope.row)"
          >
            解禁
          </el-button>
          <el-button v-else size="mini" @click="handleDisable(scope.row)">
            封禁
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="listQuery.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="listQuery.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <!-- 分配小号对话框 -->
    <el-dialog title="分配小号" :visible.sync="robotFormVisible">
      <el-form
        :rules="robotRules"
        ref="robotForm"
        :model="robotForm"
        status-icon
        label-position="left"
        label-width="64px"
        style="width: 600px"
      >
        <el-form-item prop="robots">
          <el-transfer
            v-model="robotForm.robots"
            :titles="['全部', '已分配']"
            :data="availableRobots"
          ></el-transfer>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="robotFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUserRobots">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        :rules="rules"
        ref="form"
        :model="form"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择">
            <el-option label="未知" value="未知"> </el-option>
            <el-option label="男" value="MALE"> </el-option>
            <el-option label="女" value="FEMALE"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="form.avatar"></el-input>
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
            <img v-if="form.avatar" :src="form.avatar" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="特长" prop="intro">
          <el-input v-model="form.intro"></el-input>
        </el-form-item>
        <el-form-item label="经验值" prop="bonusPoints">
          <el-input-number
            v-model="form.bonusPoints"
            controls-position="right"
            :precision="2"
            :min="0"
            :max="100000000"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="提问价格" prop="askingPrice">
          <el-input-number
            v-model="form.askingPrice"
            controls-position="right"
            :precision="2"
            :min="0"
            :max="100000000"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="余额" prop="balance">
          <el-input type="number" v-model="form.balance" disabled></el-input>
        </el-form-item>
        <el-form-item label="小号" prop="robot">
          <el-switch v-model="form.robot"> </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          v-if="dialogStatus === 'create'"
          type="primary"
          @click="createData"
          >确定</el-button
        >
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

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
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
}
</style>

<script>
import _ from "lodash";

const GENDER_MAPPER = {
  MALE: "男",
  FEMALE: "女"
};

const ROLE_TEXT_MAPPER = {
  USER: "会员",
  ADMIN: "管理员"
};

const ROLE_COLOR_MAPPER = {
  USER: "info",
  ADMIN: "danger"
};

export default {
  name: "user",
  filters: {
    genderText(gender) {
      if (!gender) {
        return "保密";
      }
      return GENDER_MAPPER[gender];
    },
    roleText(role) {
      return ROLE_TEXT_MAPPER[role];
    },
    roleColor(role) {
      return ROLE_COLOR_MAPPER[role];
    }
  },
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.form.checkPassword !== "") {
          this.$refs.form.validateField("checkPassword");
        }
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.form.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      uploadUrl: `${process.env.VUE_APP_BASE_URL}/oss`,
      list: [],
      total: null,
      listLoading: true,
      listQuery: {
        page: 0,
        limit: 20,
        username: undefined,
        name: undefined,
        role: undefined,
        robot: undefined,
        sort: "id,desc"
      },
      form: {
        id: undefined,
        username: "",
        name: "",
        avatar: "",
        gender: "MALE",
        intro: "",
        bonusPoints: 0,
        askingPrice: 0,
        balance: 0,
        robot: false
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "创建"
      },
      rules: {
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { validator: validatePass, trigger: "blur" }
        ],
        checkPassword: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { validator: validatePass2, trigger: "blur" }
        ]
      },
      downloadLoading: false,

      availableRobots: [],
      robotFormVisible: false,
      robotForm: {
        userId: undefined,
        robots: []
      },
      robotRules: {}
    };
  },
  created() {
    this.loadList();
  },
  methods: {
    handleAvatarSuccess(res) {
      this.form.avatar = res.url;
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
    search: _.debounce(function() {
      this.loadList({ page: 0 });
    }, 300),
    loadList() {
      this.listLoading = true;
      this.$http
        .get("/admin/users", { params: this.listQuery })
        .then(res => {
          this.list = res.data.content;
          this.total = res.data.totalElements;
          this.listLoading = false;
        })
        .catch(() => {
          this.list = [];
          this.total = 0;
          this.listLoading = false;
        });
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.loadList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.loadList();
    },
    resetForm() {
      this.form = {
        id: undefined,
        username: "",
        name: "",
        avatar: "",
        gender: "MALE",
        intro: "",
        bonusPoints: 0,
        askingPrice: 0,
        balance: 0,
        robot: false
      };
    },
    filterStatus(value, row) {
      return row.status === value;
    },
    handleCreate() {
      this.resetForm();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["form"].clearValidate();
      });
    },
    createData() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.$http.post("/admin/users", this.form).then(response => {
            this.list.unshift(response.data);
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "创建成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleUpdate(row) {
      this.form = Object.assign({}, row);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["form"].clearValidate();
      });
    },
    updateData() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.$http.put(`/admin/users/${this.form.id}`, this.form).then(() => {
            for (const v of this.list) {
              if (v.id === this.form.id) {
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, this.form);
                break;
              }
            }
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleDelete() {
      this.$notify({
        title: "警告",
        message: "用户删除操作不支持！",
        type: "warning",
        duration: 3000
      });
    },
    handleDisable(row) {
      this.$http.post(`/admin/users/${row.id}/disable`).then(() => {
        row.disabled = true;
        this.$message.success("封禁成功");
      });
    },
    handleEnable(row) {
      this.$http.post(`/admin/users/${row.id}/enable`).then(() => {
        row.disabled = false;
        this.$message.success("解禁成功");
      });
    },
    handleDownload() {},
    handleAllocateRobot(row) {
      this.robotFormVisible = true;
      this.robotForm.userId = row.id;
      this.loadAllRobots();
      this.loadUserRobots(row);
    },
    loadAllRobots() {
      this.$http.get("/admin/users/robots").then(res => {
        this.availableRobots = res.data.map(item => ({
          key: item.robot.id,
          label: item.robot.name,
          disabled: item.userId && item.userId !== this.robotForm.userId
        }));
      });
    },
    loadUserRobots(row) {
      this.$http.get(`/admin/users/${row.id}/robots`).then(res => {
        this.robotForm.robots = res.data.map(item => item.robot.id);
      });
    },
    saveUserRobots() {
      this.$refs["robotForm"].validate(valid => {
        if (valid) {
          this.$http
            .post(
              `/admin/users/${this.robotForm.userId}/robots`,
              this.robotForm
            )
            .then(() => {
              this.robotFormVisible = false;
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000
              });
            });
        }
      });
    }
  }
};
</script>
