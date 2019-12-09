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
        prop="userId"
        label="评论人"
        width="100"
      ></el-table-column>
      <el-table-column
        prop="topicId"
        label="评论对象"
        width="100"
      ></el-table-column>
      <el-table-column prop="topicType" label="评论类型" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.topicType | topicTypeColor">{{
            scope.row.topicType | topicTypeText
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="内容"
        min-width="400"
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
  </el-card>
</template>

<style scoped></style>

<script>
import util from "@/utils/util";

export default {
  name: "comment",
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
    topicTypeText(topicType) {
      return {
        NEWS: "资讯",
        INFO: "信息",
        SELLER: "商家"
      }[topicType];
    },
    topicTypeColor(topicType) {
      return {
        NEWS: "",
        INFO: "info",
        SELLER: "danger"
      }[topicType];
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList(params) {
      this.listLoading = true;
      const input = Object.assign({}, this.listQuery, params);

      this.$http.get("/admin/comments", { params: input }).then(
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
    filterCategory(value, row) {
      return row.category === value;
    },
    // handleCreate() {},
    // handleUpdate(row) {},
    handleDelete(row) {
      this.$http.delete(`/admin/comments/${row.id}`).then(
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
