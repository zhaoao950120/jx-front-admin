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
          回答
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
        prop="firstAnswer.content"
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
          <el-button size="mini" @click="handleUpdate(scope.row, scope.$index)">
            对话
          </el-button>
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

    <el-dialog title="对话" :visible.sync="sessionDialogVisible" width="600px">
      <el-table size="small" :data="sessionList" v-loading="listLoading">
        <el-table-column label="头像" align="center" width="80">
          <template slot-scope="scope">
            <img
              slot="reference"
              class="table-icon"
              :src="scope.row.user.avatar"
              v-fallback
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="user.name"
          label="用户"
          min-width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120">
          <template slot-scope="scope">
            {{ scope.row.createTime | formatDate }}
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="140">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleViewAnswer(scope.row, scope.$index)"
            >
              对话
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSessionSizeChange"
          @current-change="handleSessionCurrentChange"
          :current-page="sessionListQuery.page + 1"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="sessionListQuery.size"
          layout="total, prev, pager, next, jumper"
          :total="sessionListTotal"
        >
        </el-pagination>
      </div>

      <el-form
        style="margin-top: 10px"
        ref="answerForm"
        :model="answerForm"
        label-width="40px"
      >
        <el-form-item label="内容">
          <el-input type="textarea" v-model="answerForm.content"></el-input>
        </el-form-item>
        <el-form-item label="用户">
          <el-select
            v-model="answerForm.userId"
            filterable
            clearable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="userRestaurantsLoading"
          >
            <el-option
              v-for="item in userRestaurants"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <div
                style="display: flex; flex-direction: row; align-items: center"
              >
                <img :src="item.avatar" style="width: 24px; height: 24px" />
                <div style="margin-left: 12px">{{ item.name }}</div>
              </div>
            </el-option>
          </el-select>
          <!--          <el-select v-model="answerForm.userId" placeholder="请选择">-->
          <!--            <el-option-->
          <!--              v-for="item in senderOptions"-->
          <!--              :key="item.id"-->
          <!--              :label="item.name"-->
          <!--              :value="item.id">-->
          <!--            </el-option>-->
          <!--          </el-select>-->
          <el-button type="primary" @click="onAnswerSubmit">发送</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-card>
</template>

<style scoped></style>

<script>
import util from "@/utils/util";

export default {
  name: "userDialog",
  data() {
    return {
      questionId: undefined,
      questionerId: undefined,

      list: [],
      total: null,
      listLoading: true,
      listQuery: {
        page: 0,
        size: 10,
        questionId: undefined,
        keyword: undefined,
        sort: "id,desc"
      },
      rules: {
        content: [
          { required: true, message: "通知内容不能为空", trigger: "blur" }
        ]
      },
      downloadLoading: false,

      userRestaurants: [],
      userRestaurantsParams: { robot: true },
      userRestaurantsLoading: false,

      sessionDialogVisible: false,
      sessionListLoading: false,
      sessionList: [],
      sessionListQuery: {
        page: 0,
        size: 10
      },
      sessionListTotal: 0,
      answerForm: {
        questionId: "",
        userId: "",
        otherUserId: "",
        content: ""
      },
      senderOptions: []
    };
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return util.formatDate(date, "yyyy-MM-dd hh:mm:ss");
    }
  },
  created() {
    this.listQuery.questionId = this.$route.query.questionId;
    this.questionId = this.$route.query.questionId;
    this.questionerId = this.$route.query.questionerId;

    this.answerForm.questionId = this.questionId;
    this.getList();
  },
  methods: {
    remoteMethod(query) {
      if (query !== "") {
        this.$http.get("/admin/users", { params: { name: query } }).then(
          res => {
            this.userRestaurants = res.data.content;
            this.userRestaurantsLoading = false;
          },
          () => (this.userRestaurantsLoading = false)
        );
      } else {
        this.$http
          .get("/admin/users", {
            params: { name: query, robot: true, size: 100 }
          })
          .then(
            res => {
              this.userRestaurants = res.data.content;
              this.userRestaurantsLoading = false;
            },
            () => (this.userRestaurantsLoading = false)
          );
      }
    },
    getList(params) {
      this.listLoading = true;
      const input = Object.assign({}, this.listQuery, params);

      this.$http.get("/admin/dialogs", { params: input }).then(
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
      this.sessionDialogVisible = true;
      this.remoteMethod("");

      // if (this.answerForm.userId === this.questionerId) {
      // }
      //
      // this.resetForm()
      // this.dialogStatus = 'create'
      // this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    handleUpdate() {
      this.sessionDialogVisible = true;
      this.remoteMethod("");

      // if (this.answerForm.userId === this.questionerId) {
      // }
      //
      // this.resetForm()
      // this.dialogStatus = 'create'
      // this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    handleDownload() {},
    handleSessionSizeChange(val) {
      this.sessionListQuery.size = val;
      this.loadSessionList();
    },
    handleSessionCurrentChange(val) {
      this.sessionListQuery.page = val - 1;
      this.loadSessionList();
    },
    handleViewAnswer(row) {
      this.sessionDialogVisible = true;

      this.loadSessionList({
        dialogId: row.dialogId
      });
      this.loadSessionUsers(row);
    },
    loadSessionList(params) {
      const input = Object.assign({}, this.sessionListQuery, params);

      this.sessionListLoading = true;
      this.$http.get("/admin/answers", { params: input }).then(
        res => {
          this.sessionListQuery.page = input.page;
          this.sessionListQuery.size = input.size;

          this.sessionList = res.data.content;
          this.sessionListTotal = res.data.totalElements;
          this.sessionListLoading = false;
        },
        () => (this.sessionListLoading = false)
      );
    },
    loadSessionUsers(params) {
      this.$http.get("/admin/dialog/" + params.dialogId).then(res => {
        this.senderOptions = [res.data.questioner, res.data.answer];
      });
    },
    onAnswerSubmit() {
      this.$http.post("/admin/answer/", {});
    }
  }
};
</script>
