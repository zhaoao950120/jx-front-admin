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
        <el-button type="primary" icon="el-icon-edit" @click="handleCreate">
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
      <el-table-column label="徽标" align="center" width="80">
        <template slot-scope="scope">
          <img
            :src="scope.row.icon || '/static/images/news-default.jpg'"
            style="width: 48px; height: 48px"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="名称"
        width="min-200"
        prop="name"
      ></el-table-column>
      <el-table-column
        label="关键字"
        width="200"
        prop="keyword"
      ></el-table-column>
      <el-table-column label="日期" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{
            scope.row.createTime | formatDate
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="disabled" label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.disabled | statusColor">
            {{ scope.row.disabled | statusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleUpdate(scope.row, scope.$index)">
            编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row, scope.$index)"
          >
            删除
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
  name: "serviceCategory",
  data() {
    return {
      list: [],
      total: null,
      listLoading: true,
      listQuery: {
        page: 0,
        size: 10,
        keyword: undefined
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
        false: "显示",
        true: "隐藏"
      }[status];
    },
    statusColor(status) {
      return {
        false: "success",
        true: "info"
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

      this.$http.get("/admin/service_category/list", { params: input }).then(
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
    handleCreate() {
      this.$router.push("/service_category/add");
    },
    handleUpdate(row) {
      this.$router.push(`/service_category/edit?id=${row.id}`);
    },
    handleDelete(row, index) {
      this.$http
        .get("/admin/service_category/delete", { params: { id: row.id } })
        .then(
          () => {
            this.$message.success("删除成功");
            this.list.splice(index, 1);
          },
          err =>
            this.$message.error(
              (err.response && err.response.data.message) || "删除失败"
            )
        );
    },
    handleDownload() {}
  }
};
</script>
