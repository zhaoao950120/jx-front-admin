<template>
  <el-card class="transaction-page" :header="$route.meta.title" shadow="never">
    <el-tabs slot="header" v-model="activeName" @tab-click="search">
      <el-tab-pane
        v-for="item in tabs"
        :key="item.name"
        :label="item.label"
        :name="item.name"
      ></el-tab-pane>
    </el-tabs>
    <el-form
      inline
      :model="listQuery"
      @submit.native="search"
      @submit.native.prevent
    >
      <el-form-item>
        <el-input
          class="input-with-select"
          placeholder="请输入内容"
          v-model="listQuery.keyword"
        >
          <el-select
            v-model="listQuery.keywordType"
            slot="prepend"
            placeholder="请选择"
          >
            <el-option label="标题" value="TITLE"></el-option>
            <el-option label="用户ID" value="USER_ID"></el-option>
          </el-select>
          <el-button
            slot="append"
            native-type="submit"
            icon="el-icon-search"
          ></el-button>
        </el-input>
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
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="user.name"
        label="用户昵称"
        min-width="100"
      ></el-table-column>
      <el-table-column
        prop="user.balance"
        label="账户余额"
        width="100"
        align="right"
      ></el-table-column>
      <el-table-column
        prop="title"
        label="标题"
        min-width="200"
      ></el-table-column>
      <el-table-column
        prop="amount"
        label="操作金额"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="balance"
        label="操作后余额"
        width="100"
        align="right"
      ></el-table-column>
      <el-table-column
        prop="description"
        label="说明"
        width="200"
      ></el-table-column>
      <el-table-column
        prop="account"
        label="打款信息"
        width="200"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="日期" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{
            scope.row.createTime | formatDate
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="comment"
        label="备注"
        width="200"
      ></el-table-column>

      <el-table-column label="操作" align="center" fixed="right" width="200">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 'PENDING_WITHDRAWAL'"
            size="mini"
            type="primary"
            @click="handleWithdraw(scope.row, scope.$index)"
            >同意</el-button
          >
          <el-button
            v-if="scope.row.status === 'PENDING_WITHDRAWAL'"
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
  name: "transaction",
  data() {
    return {
      tabs: [
        { name: "ALL", label: "全部" },
        { name: "PENDING_WITHDRAWAL", label: "申请提现" },
        { name: "WITHDREW", label: "已提现" },
        { name: "WITHDRAWAL_REFUSED", label: "提现被拒" },
        { name: "PENDING_PAYMENT", label: "待付款" },
        { name: "PAID", label: "已付款" }
      ],

      list: [],
      total: null,
      listLoading: true,
      listQuery: {
        page: 0,
        size: 10,
        keywordType: "TITLE",
        keyword: undefined,
        status: undefined,
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
  computed: {
    activeName: {
      get() {
        return this.listQuery.status || "ALL";
      },
      set(val) {
        this.listQuery.status = val === "ALL" ? undefined : val;
      }
    }
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return util.formatDate(date, "yyyy-MM-dd hh:mm:ss");
    },
    statusText(status) {
      return {
        PENDING_PAYMENT: "待付款",
        PAID: "已付款",
        PENDING_WITHDRAWAL: "申请提现",
        WITHDREW: "已提现",
        WITHDRAWAL_REFUSED: "提现被拒绝"
      }[status];
    },
    statusColor(status) {
      return {
        PENDING_PAYMENT: "info",
        PAID: "success",
        PENDING_WITHDRAWAL: "danger",
        WITHDREW: "",
        WITHDRAWAL_REFUSED: "warning"
      }[status];
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList(params) {
      this.listLoading = true;
      const input = Object.assign({}, this.listQuery, params);

      this.$http.get("/admin/transactions", { params: input }).then(
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
    handleCreate() {},
    handleWithdraw(row) {
      this.$http.post(`/admin/transactions/${row.id}/withdraw`).then(
        () => {
          this.$notify({
            title: "成功",
            message: "同意提现成功",
            type: "success",
            duration: 2000
          });
          this.getList();
        },
        err =>
          this.$notify({
            title: "失败",
            message:
              (err.response && err.response.data.message) ||
              JSON.stringify(err) + "同意提现失败",
            type: "error",
            duration: 2000
          })
      );
    },
    handleRefuse(row) {
      this.$prompt("请输入原因", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(({ value }) => {
        this.$http
          .post(`/admin/transactions/${row.id}/refuse`, { reason: value })
          .then(
            res => {
              this.$notify({
                title: "成功",
                message: "拒绝提现成功",
                type: "success",
                duration: 2000
              });

              for (const v of this.list) {
                if (v.id === row.id) {
                  const index = this.list.indexOf(v);
                  this.list.splice(index, 1, res.data);
                  break;
                }
              }
            },
            err =>
              this.$notify({
                title: "失败",
                message:
                  (err.response && err.response.data.message) || "拒绝提现失败",
                type: "error",
                duration: 2000
              })
          );
      });
    },
    handleDownload() {}
  }
};
</script>
<style lang="scss">
.transaction-page {
  .el-card__header {
    padding-top: 0;
    padding-bottom: 0;
  }

  .el-tabs__header {
    margin: 0;
  }

  .el-tabs__item {
    height: 55px;
    line-height: 55px;
    font-size: 16px;
  }
}
</style>
