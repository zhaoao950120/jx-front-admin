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
        label="搜索词"
        prop="value"
        min-width="100"
      ></el-table-column>
      <el-table-column label="分类" prop="category" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.category | categoryColor">
            {{ scope.row.category | categoryText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="权重" prop="weight" width="100"></el-table-column>
      <el-table-column label="日期" width="160">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">
            {{ scope.row.createTime | formatDate }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="disabled" label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.disabled | statusColor">
            {{ scope.row.disabled | statusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" width="160" label="操作">
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
        ref="form"
        :model="form"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="搜索词" prop="value">
          <el-input
            type="text"
            v-model="form.value"
            auto-complete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="权重:" prop="weight">
          <el-slider v-model="form.weight" :min="0" :max="100"></el-slider>
        </el-form-item>
        <el-form-item label="分类:" prop="category">
          <el-select v-model="form.category" placeholder="请选择">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="启用:" prop="disabled">
          <el-switch
            v-model="form.disabled"
            :active-value="false"
            :inactive-value="true"
          ></el-switch>
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

const CATEGORY_TEXT_MAPPER = {
  AUTO_SERVICE: "车主服务",
  AUTO_QA: "汽车问答"
};

const CATEGORY_COLOR_MAPPER = {
  AUTO_SERVICE: "success",
  AUTO_QA: "primary"
};

export default {
  name: "searchTerm",
  data() {
    return {
      categoryOptions: [
        { label: "车主服务", value: "AUTO_SERVICE" },
        { label: "汽车问答", value: "AUTO_QA" }
      ],

      list: [],
      total: null,
      listLoading: true,
      listQuery: {
        page: 0,
        size: 10,
        keyword: undefined
      },
      form: {
        id: undefined,
        value: "",
        weight: 0,
        category: undefined,
        disabled: false
      },

      rules: {
        value: [
          { required: true, message: "搜索词不能为空", trigger: "blur" },
          {
            min: 1,
            max: 24,
            message: "搜索词长度在 1 到 24 个字符",
            trigger: "blur"
          }
        ],
        weight: [
          { required: true, message: "权重不能为空", trigger: "change" }
        ],
        category: [
          { required: true, message: "分类不能为空", trigger: "change" }
        ],
        disabled: [
          { required: true, message: "是否启用不能为空", trigger: "change" }
        ]
      },

      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "创建"
      },

      downloadLoading: false
    };
  },
  filters: {
    categoryText(category) {
      return CATEGORY_TEXT_MAPPER[category];
    },
    categoryColor(category) {
      return CATEGORY_COLOR_MAPPER[category];
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
    },
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

      this.$http.get("/admin/search_term/list", { params: input }).then(
        res => {
          this.listQuery.page = input.page;
          this.listQuery.size = input.size;

          this.list = res.data.content;
          this.total = res.data.totalElements;
          this.listLoading = false;
        },
        () => (this.listLoading = false)
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
      this.form = {
        id: undefined,
        value: "",
        weight: 0,
        category: undefined,
        disabled: false
      };
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
          this.$http.post("/admin/search_term/create", this.form).then(res => {
            this.list.unshift(res.data);
            this.dialogFormVisible = false;
            this.$message.success("创建成功");
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
          this.$http.post("/admin/search_term/update", this.form).then(() => {
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
    handleDelete(row) {
      this.$http.get("/admin/notices/delete", { params: { id: row.id } }).then(
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
