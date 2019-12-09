<template>
  <el-dialog :title="title" :visible.sync="opened" width="600px">
    <el-table size="small" :data="list" v-loading="listLoading">
      <el-table-column
        v-if="!props.thumb.hide"
        :label="props.thumb.label"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          <img
            slot="reference"
            class="table-icon"
            :src="resolvePathValue(scope.row, props.thumb.key)"
            v-fallback
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="!props.name.hide"
        :prop="props.name.key"
        :label="props.name.label"
        min-width="100"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        v-if="!props.createTime.hide"
        :prop="props.createTime.key"
        :label="props.createTime.label"
        width="120"
      >
        <template slot-scope="scope">
          {{
            resolvePathValue(scope.row, props.createTime.key)
              | formatDate("hh:mm:ss")
          }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="160">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="listQuery.keyword"
            size="mini"
            placeholder="输入关键字搜索"
          />
        </template>
        <template slot-scope="scope">
          <el-button type="success" plain @click="chooseTarget(scope.row)">
            选取
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="listQuery.page + 1"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="listQuery.size"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </el-dialog>
</template>

<script>
import _get from "lodash/get";
import _debounce from "lodash/debounce";

async function noop() {}

export default {
  name: "KtlChooseDialog",
  props: {
    title: {
      type: String,
      default: "选取"
    },
    visible: {
      type: Boolean,
      default: false
    },
    keywordType: {
      type: String
    },
    props: {
      type: Object,
      default() {
        return {
          name: {
            hide: false,
            key: "name",
            label: "名称"
          },
          thumb: {
            hide: false,
            key: "thumb",
            label: "缩略图"
          },
          createTime: {
            hide: false,
            key: "createTime",
            label: "日期"
          }
        };
      }
    },
    onSearch: {
      type: Function,
      default: noop
    }
  },
  data() {
    return {
      opened: this.visible,

      total: 0,
      listLoading: true,
      list: [],
      listQuery: {
        keywordType: "NAME",
        keyword: undefined,
        page: 0,
        size: 10
      }
    };
  },
  watch: {
    visible(val) {
      this.opened = val;
      if (val) {
        this.reset();
        this.loadList();
      }
    },
    opened(val) {
      this.$emit("update:visible", val);
    },
    keywordType(val) {
      this.listQuery.keywordType = val;
    },
    "listQuery.keyword"() {
      this.search();
    }
  },
  methods: {
    reset() {
      this.total = 0;
      this.listLoading = true;
      this.list = [];
      this.listQuery = {
        keywordType: "NAME",
        keyword: undefined,
        page: 0,
        size: 10
      };
    },
    resolvePathValue(obj, key) {
      return _get(obj, key);
    },
    handleSizeChange(val) {
      this.listQuery.size = val;
      this.loadList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val - 1;
      this.loadList();
    },
    search: _debounce(function() {
      this.loadList();
    }, 300),
    async loadList(params) {
      const input = Object.assign({}, this.listQuery, params);

      this.listLoading = true;
      try {
        const res = await this.onSearch(input);
        this.listQuery.page = input.page;
        this.listQuery.size = input.size;

        this.list = res.data.data;
        this.total = res.data.total;
        this.listLoading = false;
      } catch (e) {
        this.listLoading = false;
      }
    },
    chooseTarget(row) {
      this.opened = false;
      this.$emit("choose", row);
    }
  }
};
</script>
