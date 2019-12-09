<template>
  <el-card :header="$route.meta.title" shadow="always">
    <el-form inline :model="listQuery" @submit.native="search" @submit.native.prevent>
      <el-form-item label="关卡：">
        <el-input placeholder="请输入关卡" v-model="listQuery.keyword"></el-input>
      </el-form-item>
      <el-form-item label="用户名：">
        <el-input placeholder="请输入用户名" v-model="listQuery.keyword"></el-input>
      </el-form-item>
      <el-form-item label="状态：">
        <el-input placeholder="请输入状态" v-model="listQuery.keyword"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" icon="el-icon-search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table
      size="small"
      :data="list"
      v-loading="listLoading"
      element-loading-text="正在查询中..."
      fit="true"
      highlight-current-row="true"
      max-height="640"
      stripe="true"
    >
      <el-table-column label="序号" type="index" width="50"></el-table-column>
      <el-table-column label="用户" width="120" prop="userId"></el-table-column>
      <el-table-column label="位置" width="200" prop="location"></el-table-column>
      <el-table-column label="类别" width="120" prop="category">
        <template slot-scope="scope">
          <el-tag :type="scope.row.category | categoryColor">
            {{
            scope.row.category | categoryText
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" min-width="400" prop="content"></el-table-column>
      <el-table-column label="日期" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">
            {{
            scope.row.createTime | formatDate
            }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" fixed="right" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleUpdate(scope.row, scope.$index)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row, scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页123 -->
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="listQuery.page + 1"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="listQuery.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        :rules="rules"
        ref="dataForm"
        :model="dataForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="类别" prop="category">
          <el-radio-group v-model="dataForm.category" size="small">
            <el-radio label="JOB_RECRUITMENT">招聘</el-radio>
            <el-radio label="JOB_SEEKER">求职</el-radio>
            <el-radio label="SECOND_HAND_CAR">二手车</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户" prop="userId">
          <el-input type="number" v-model="dataForm.userId" disabled auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input type="text" v-model="dataForm.location" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input type="text" v-model="dataForm.content" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus === 'create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<style scoped></style>

<script>
import util from "@/utils/util";

export default {
  name: "info",
  data() {
    return {
      list: [],
      total: null,
      listLoading: true,
      listQuery: {
        page: 0,
        size: 10,
        keyword: undefined,
        sort: "id,desc"
      },
      dataForm: {
        id: undefined,
        category: undefined,
        userId: undefined,
        location: undefined,
        content: undefined
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "创建"
      },
      rules: {
        category: [
          { required: true, message: "类别不能为空", trigger: "change" }
        ],
        userId: [
          { required: true, message: "用户不能为空", trigger: "change" }
        ],
        location: [
          { required: true, message: "位置不能为空", trigger: "blur" }
        ],
        content: [{ required: true, message: "内容不能为空", trigger: "blur" }]
      },
      downloadLoading: false
    };
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return util.formatDate(date, "yyyy-MM-dd hh:mm:ss");
    },
    categoryText(targetType) {
      return {
        JOB_RECRUITMENT: "招聘",
        JOB_SEEKER: "求职",
        SECOND_HAND_CAR: "二手车"
      }[targetType];
    },
    categoryColor(targetType) {
      return {
        JOB_RECRUITMENT: "danger",
        JOB_SEEKER: "warning",
        SECOND_HAND_CAR: ""
      }[targetType];
    }
  },
  created() {
    console.log(this.$route);
    this.getList();
  },
  methods: {
    getList(params) {
      this.listLoading = true;
      const input = Object.assign({}, this.listQuery, params);

      this.$http.get("/admin/info", { params: input }).then(
        res => {
          this.listQuery.page = input.page;
          this.listQuery.size = input.size;

          this.list = res.data.content;
          this.total = res.data.totalElements;
          this.listLoading = false;
        },
        () => {
          this.list = [];
          this.total = 0;
          this.listLoading = false;
        }
      );
    },
    search() {
      this.listQuery.page = 0;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.size = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val - 1;
      this.getList();
    },
    filterStatus(value, row) {
      return row.status === value;
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        category: undefined,
        userId: undefined,
        location: undefined,
        content: undefined
      };
    },
    handleCreate() {
      this.resetForm();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$http.post("/admin/info", this.dataForm).then(res => {
            this.list.unshift(res.data);
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
      this.dataForm = Object.assign({}, row);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$http
            .put(`/admin/info/${this.dataForm.id}`, this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v);
                  this.list.splice(index, 1, this.dataForm);
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
    handleDelete(row) {
      this.$http.delete(`/admin/info/${row.id}`).then(
        () => {
          this.$notify({
            title: "成功",
            message: "删除成功",
            type: "success",
            duration: 2000
          });
          const index = this.list.indexOf(row);
          this.list.splice(index, 1);
        },
        err =>
          this.$notify({
            title: "失败",
            message: (err.response && err.response.data.message) || "删除失败",
            type: "error",
            duration: 2000
          })
      );
    },
    handleDownload() {}
  }
};
</script>
