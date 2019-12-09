<template>
  <el-card :header="$route.meta.title" shadow="never">
    <el-form
      inline
      :model="listQuery"
      @submit.native="search"
      @submit.native.prevent
    >
      <el-form-item>
        <el-input placeholder="请输入关键字" v-model="listQuery.keyword">
        </el-input>
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
        label="内容"
        min-width="400"
        prop="content"
      ></el-table-column>
      <el-table-column label="日期" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{
            scope.row.createTime | formatDate
          }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" fixed="right" width="250" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleUpdate(scope.row, scope.$index)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row, scope.$index)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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
      >
      </el-pagination>
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
        <el-form-item label="内容" prop="content">
          <el-input
            type="text"
            v-model="dataForm.content"
            auto-complete="off"
          ></el-input>
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

<style scoped></style>

<script>
import util from "@/utils/util";

export default {
  name: "notice",
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
        content: undefined
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "创建"
      },
      rules: {
        content: [
          { required: true, message: "通知内容不能为空", trigger: "blur" }
        ]
      },
      downloadLoading: false
    };
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return util.formatDate(date, "yyyy-MM-dd hh:mm:ss");
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList(params) {
      this.listLoading = true;
      const input = Object.assign({}, this.listQuery, params);

      this.$http.get("/admin/notices", { params: input }).then(
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
    resetForm() {
      this.dataForm = {
        id: undefined,
        username: "",
        name: "",
        pass: undefined,
        checkPass: undefined,
        gender: "MALE",
        userLevel: "普通用户",
        birthday: undefined,
        status: "可用"
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
          this.$http.post("/admin/notices", this.dataForm).then(response => {
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
            .put(`/admin/notices/${this.dataForm.id}`, this.dataForm)
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
      this.$http.delete(`/admin/notices/${row.id}`).then(
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
