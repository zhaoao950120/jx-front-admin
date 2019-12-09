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
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left">
            <el-form-item label="手机号">
              <span>{{ props.row.mobile }}</span>
            </el-form-item>
            <el-form-item label="行业分类">
              <span>{{ props.row.industry }}</span>
            </el-form-item>
            <el-form-item label="行业关键字">
              <span>{{ props.row.industryKeyword }}</span>
            </el-form-item>
            <el-form-item label="商家轮播图">
              <img
                v-for="(url, index) in props.row.gallery"
                :key="index"
                :src="url"
                alt="轮播图"
                style="margin-left: 12px; width: 64px; height: 32px"
              />
            </el-form-item>
            <el-form-item label="商家介绍图">
              <img
                v-for="(url, index) in props.row.introImages"
                :key="index"
                :src="url"
                alt="介绍图"
                style="margin-left: 12px; width: 64px; height: 32px"
              />
            </el-form-item>
            <el-form-item label="服务时间">
              <span>{{
                `${props.row.openingTime}-${props.row.closingTime}`
              }}</span>
            </el-form-item>
            <el-form-item label="服务电话">
              <span>{{ props.row.contactNumber }}</span>
            </el-form-item>
            <el-form-item label="商家设施">
              <span>{{ props.row.attributes }}</span>
            </el-form-item>
            <el-form-item label="商家公告">
              <span>{{ props.row.announcement }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column label="状态" width="120" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusColor">{{
            scope.row.status | statusText
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="徽标" align="center" width="80">
        <template slot-scope="scope">
          <img
            :src="scope.row.thumb || '/static/images/news-default.jpg'"
            style="width: 48px; height: 48px"
          />
        </template>
      </el-table-column>
      <el-table-column label="名称" width="200" prop="name"></el-table-column>
      <el-table-column
        label="位置"
        width="200"
        prop="location"
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
        label="简介"
        min-width="200"
        prop="intro"
      ></el-table-column>
      <el-table-column
        label="是否热门"
        align="center"
        width="80"
        prop="hotSeller"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.hotSeller | hotSellerColorFilter">
            {{ scope.row.hotSeller | hotSellerTextFilter }}
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
  name: "seller",
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
        NORMAL: "正常",
        DISABLED: "禁用",
        APPLYING: "申请入驻",
        REFUSED: "拒绝入驻"
      }[status];
    },
    statusColor(status) {
      return {
        NORMAL: "success",
        DISABLED: "info",
        APPLYING: "danger",
        REFUSED: "warning"
      }[status];
    },
    hotSellerColorFilter(hotSeller) {
      return hotSeller ? "danger" : "";
    },
    hotSellerTextFilter(hotSeller) {
      return hotSeller ? "热门" : "普通";
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList(params) {
      this.listLoading = true;
      const input = Object.assign({}, this.listQuery, params);

      this.$http.get("/admin/seller/list", { params: input }).then(
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
    handleCreate() {
      this.$router.push("/seller/add");
    },
    handleUpdate(row) {
      this.$router.push(`/seller/edit?id=${row.id}`);
    },
    handleDelete(row, index) {
      this.$http.get("/admin/seller/delete", { params: { id: row.id } }).then(
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
    handleAgree(row) {
      this.$http.post("/admin/seller/agree", { params: { id: row.id } }).then(
        () => {
          this.$message.success("同意申请成功");
          this.getList();
        },
        err =>
          this.$message.error(
            (err.response && err.response.data.message) ||
              JSON.stringify(err) + "同意申请失败"
          )
      );
    },
    handleRefuse(row) {
      this.$prompt("请输入原因", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(({ value }) => {
        this.$http
          .post("/admin/seller/refuse", {
            params: { id: row.id, reason: value }
          })
          .then(
            res => {
              this.$message.success("拒绝申请成功");

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
                (err.response && err.response.data.message) || "拒绝申请失败"
              )
          );
      });
    },
    handleDownload() {}
  }
};
</script>
