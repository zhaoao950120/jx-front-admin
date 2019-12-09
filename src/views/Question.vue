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
        prop="category"
        label="类别"
        width="120"
        :filters="[
          { text: '用车问题', value: 'USING' },
          { text: '养车问题', value: 'KEEPING' },
          { text: '修车问题', value: 'REPAIRING' }
        ]"
        :filter-multiple="true"
        :filter-method="filterCategory"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.category | categoryColor">{{
            scope.row.category | categoryText
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="questioner.name"
        label="提问人"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="content"
        label="内容"
        min-width="240"
      ></el-table-column>
      <el-table-column label="日期" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">
            {{ scope.row.createTime | formatDate }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="carBrand" label="汽车品牌/型号" width="140">
        <template slot-scope="scope">
          <el-tag type="info">{{ scope.row.carBrand }}</el-tag>
          <el-tag type="info">{{ scope.row.carType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="140">
        <template slot-scope="scope">
          {{ scope.row.answererCount }} 位车神 ·
          {{ scope.row.answerCount }} 条回答
        </template>
      </el-table-column>
      <el-table-column prop="reward" label="悬赏" width="120"></el-table-column>

      <el-table-column align="center" fixed="right" label="操作" width="240">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleViewAnswer(scope.row, scope.$index)"
          >
            答案
          </el-button>
          <el-button
            size="mini"
            type="primary"
            @click="handleUpdate(scope.row, scope.$index)"
          >
            编辑
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
        <el-form-item label="类别" prop="category">
          <el-radio-group v-model="form.category" size="small">
            <el-radio label="USING">用车问题</el-radio>
            <el-radio label="KEEPING">养车问题</el-radio>
            <el-radio label="REPAIRING">修车问题</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="提问人" prop="questionerId">
          <el-select
            v-model="form.questionerId"
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
        </el-form-item>
        <el-form-item label="向TA提问" prop="atUserId">
          <el-select
            v-model="form.atUserId"
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
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            v-model="form.content"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="图片" prop="images">
          <el-upload
            :action="uploadUrl"
            :on-remove="handleImageRemove"
            :on-preview="handlePreview"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
            multiple
            :limit="3"
            :on-exceed="handleImageExceed"
            :file-list="imageFileList"
            list-type="picture-card"
          >
            <i class="el-icon-plus"></i>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过8M。建议尺寸：750×750像素
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="汽车品牌/型号" prop="carBrand">
          <el-select
            v-model="carBrandId"
            filterable
            clearable
            reserve-keyword
            placeholder="请输入汽车品牌"
            :loading="carBrandRestaurantsLoading"
            @change="onCarBrandChange"
          >
            <el-option
              v-for="item in carBrandRestaurants"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
          <el-select
            v-model="carTypeId"
            filterable
            clearable
            remote
            reserve-keyword
            placeholder="请输入汽车型号"
            :loading="carTypeRestaurantsLoading"
            @change="onCarTypeChange"
          >
            <el-option
              v-for="item in carTypeRestaurants"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="悬赏" prop="reward">
          <el-input-number
            disabled
            v-model="form.reward"
            controls-position="right"
            :precision="2"
            :min="0"
            :max="100000000"
          ></el-input-number>
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
  name: "question",
  data() {
    return {
      uploadUrl: `${process.env.VUE_APP_BASE_URL}/oss`,
      list: [],
      total: null,
      listLoading: true,
      listQuery: {
        page: 0,
        size: 10,
        keyword: undefined,
        sort: "id,desc"
      },
      carBrandId: undefined,
      carTypeId: undefined,
      form: {
        id: undefined,
        category: undefined,
        questionerId: undefined,
        atUserId: undefined,
        content: undefined,
        images: [],
        carBrand: undefined,
        carType: undefined,
        reward: 0
      },

      imageFileList: [],

      carBrandRestaurants: [],
      carBrandRestaurantsParams: {},
      carBrandRestaurantsLoading: false,
      carTypeRestaurants: [],
      carTypeRestaurantsParams: {},
      carTypeRestaurantsLoading: false,

      userRestaurants: [],
      userRestaurantsParams: {},
      userRestaurantsLoading: false,

      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "创建"
      },
      rules: {
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" }
        ]
      },
      downloadLoading: false
    };
  },
  filters: {
    categoryText(category) {
      return {
        USING: "用车问题",
        BUYING: "买车问题",
        SELLING: "卖车问题",
        KEEPING: "养车问题",
        REPAIRING: "修车问题"
      }[category];
    },
    categoryColor(category) {
      return {
        USING: "",
        BUYING: "danger",
        SELLING: "warning",
        KEEPING: "success",
        REPAIRING: "danger"
      }[category];
    },
    formatDate(time) {
      let date = new Date(time);
      return util.formatDate(date, "yyyy-MM-dd hh:mm:ss");
    }
  },
  computed: {
    car: {
      get() {
        return [this.form.carBrand, this.form.carType];
      },
      set(val) {
        if (val) {
          this.form.carBrand = val[0];
          this.form.carType = val[1];
        } else {
          this.form.carBrand = [];
          this.form.carType = [];
        }
      }
    }
  },
  watch: {
    imageFileList: {
      handler(val) {
        this.form.images = val.map(item => {
          if (item.response) {
            return item.response.url;
          } else {
            return item.url;
          }
        });
      },
      deep: true
    }
  },
  created() {
    this.loadList();
    this.remoteMethod("");
    this.remoteCarBrandMethod();
  },
  methods: {
    beforeImageUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isPNG = file.type === "image/png";
      const isLt8M = file.size / 1024 / 1024 < 8;

      if (!isJPG && !isPNG) {
        this.$message.error("上传图片只能是 JPG/PNG 格式!");
        return false;
      }
      if (!isLt8M) {
        this.$message.error("上传图片大小不能超过 8MB!");
        return false;
      }
      return true;
    },
    // handlePreview(file) {},
    handleImageSuccess(response, file, fileList) {
      this.imageFileList = fileList;
    },
    handleImageRemove(file, fileList) {
      this.imageFileList = fileList;
    },
    handleImageExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 3 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    remoteCarBrandMethod() {
      this.carBrandRestaurantsLoading = true;
      this.$http.get("/admin/cars/brands").then(
        res => {
          this.carBrandRestaurants = res.data;
          this.carBrandRestaurantsLoading = false;
        },
        () => (this.carBrandRestaurantsLoading = false)
      );
    },
    remoteCarTypeMethod() {
      this.carTypeRestaurantsLoading = true;
      this.$http
        .get("/admin/cars/types", { params: { brandId: this.carBrandId } })
        .then(
          res => {
            this.carTypeRestaurants = res.data;
            this.carTypeRestaurantsLoading = false;
          },
          () => (this.carTypeRestaurantsLoading = false)
        );
    },
    onCarBrandChange(id) {
      this.form.carBrand = undefined;
      this.carTypeId = undefined;
      this.form.carType = undefined;
      this.carTypeRestaurants = [];

      if (id) {
        for (const item of this.carBrandRestaurants) {
          if (item.id === id) {
            this.form.carBrand = item.name;
            break;
          }
        }
        this.remoteCarTypeMethod();
      }
    },
    onCarTypeChange(id) {
      this.form.carType = undefined;

      if (id) {
        for (const item of this.carTypeRestaurants) {
          if (item.id === id) {
            this.form.carType = item.name;
            break;
          }
        }
      }
    },
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
        this.$http.get("/admin/users/robots", { params: { name: query } }).then(
          res => {
            this.userRestaurants = res.data.map(item => item.robot);
            this.userRestaurantsLoading = false;
          },
          () => (this.userRestaurantsLoading = false)
        );
      }
    },
    loadList(params) {
      this.listLoading = true;
      const input = Object.assign({}, this.listQuery, params);

      this.$http.get("/admin/questions", { params: input }).then(
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
      this.loadList();
    },
    handleSizeChange(val) {
      this.listQuery.size = val;
      this.loadList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val - 1;
      this.loadList();
    },
    resetForm() {
      this.form = {
        id: undefined,
        category: undefined,
        questionerId: undefined,
        atUserId: undefined,
        content: undefined,
        images: undefined,
        carBrand: undefined,
        carType: undefined,
        reward: 0
      };
    },
    filterCategory(value, row) {
      return row.category === value;
    },
    handleViewAnswer(row) {
      this.$router.push(
        `/dialog?questionId=${row.id}&questionerId=${row.questioner.id}`
      );
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
          this.$http.post("/admin/questions", this.form).then(res => {
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
          this.$http.put("/admin/questions", this.form).then(() => {
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
      this.$http.delete(`/admin/questions/${row.id}`).then(
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
