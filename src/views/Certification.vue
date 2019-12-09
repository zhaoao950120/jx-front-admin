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
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left">
            <el-form-item label="证明图">
              <el-image
                v-for="(url, index) in props.row.proofs"
                :key="index"
                style="margin-left: 12px; width: 100px; height: auto"
                :src="url"
                :preview-src-list="props.row.proofs"
              >
              </el-image>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusColor">
            {{ scope.row.status | statusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="userId"
        label="用户ID"
        width="100"
      ></el-table-column>
      <el-table-column
        prop="user.name"
        label="用户昵称"
        width="200"
      ></el-table-column>
      <el-table-column prop="status" label="类型" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type | typeColor">
            {{ scope.row.type | typeText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="category"
        label="问题分类"
        width="100"
      ></el-table-column>
      <el-table-column
        prop="carBrand"
        label="认证品牌"
        min-width="200"
      ></el-table-column>
      <el-table-column
        prop="carType"
        label="认证车型"
        width="200"
      ></el-table-column>
      <el-table-column
        prop="intro"
        label="个人介绍"
        min-width="200"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="comment"
        label="备注"
        width="200"
      ></el-table-column>
      <el-table-column label="日期" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{
            scope.row.createTime | formatDate
          }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" fixed="right" width="200">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 'APPLYING'"
            size="mini"
            type="primary"
            @click="handleAgree(scope.row, scope.$index)"
            >同意</el-button
          >
          <el-button
            v-if="scope.row.status === 'APPLYING'"
            size="mini"
            type="danger"
            @click="handleRefuse(scope.row, scope.$index)"
            >拒绝</el-button
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
  </el-card>
</template>

<style scoped></style>

<script>
import util from "@/utils/util";

export default {
  name: "certification",
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
        username: "",
        name: "",
        password: undefined,
        checkPassword: undefined,
        gender: "男",
        userLevel: "普通用户",
        birthday: undefined,
        status: "可用"
      },
      downloadLoading: false
    };
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return util.formatDate(date, "yyyy-MM-dd hh:mm:ss");
    },
    statusText(status) {
      return {
        NORMAL: "已通过",
        APPLYING: "申请中",
        REJECTED: "已拒绝"
      }[status];
    },
    statusColor(status) {
      return {
        NORMAL: "success",
        APPLYING: "warning",
        REJECTED: "danger"
      }[status];
    },
    typeText(type) {
      return {
        DRIVER: "达人认证",
        SELLER: "行业认证",
        VEHICLEOWNER: "车主认证"
      }[type];
    },
    typeColor(type) {
      return {
        DRIVER: "success",
        SELLER: "danger"
      }[type];
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList(params) {
      this.listLoading = true;
      const input = Object.assign({}, this.listQuery, params);

      this.$http.get("/admin/certification/list", { params: input }).then(
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
    filterStatus(value, row) {
      return row.status === value;
    },
    handleCreate() {},
    handleAgree(row) {
      this.$http
        .post(`/admin/certification/agree`, {
          id: row.id,
          pass: true
        })
        .then(
          () => {
            this.$message.success("操作成功");
            this.getList();
          },
          err =>
            this.$message.error(
              (err.response && err.response.data.message) ||
                JSON.stringify(err) + "操作失败"
            )
        );
    },
    handleRefuse(row) {
      this.$prompt("请输入原因", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(({ value }) => {
        this.$http
          .post(`/admin/certification/refuse`, {
            id: row.id,
            pass: false,
            reason: value
          })
          .then(
            res => {
              this.$message.success("操作成功");

              for (const v of this.list) {
                if (v.id === row.id) {
                  const index = this.list.indexOf(v);
                  this.list.splice(index, 1, res.data);
                  break;
                }
              }
            },
            err =>
              this.$message.error(
                (err.response && err.response.data.message) ||
                  JSON.stringify(err) + "操作失败"
              )
          );
      });
    },
    handleDownload() {}
  }
};
</script>
