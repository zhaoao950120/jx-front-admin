<template>
  <el-card v-loading="loading" :header="$route.meta.title" shadow="never">
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="200px"
      style="width: 600px"
      hide-required-asterisk
    >
      <el-form-item label="商家名称:" prop="name">
        <el-input v-model="form.name" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="服务分类:" prop="categoryId">
        <el-select
          v-model="form.categoryId"
          clearable
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="店内设施:" prop="attributes">
        <el-select v-model="form.attributes" multiple placeholder="请选择">
          <el-option
            v-for="item in attributeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="详细地址:" prop="location">
        <el-input v-model="form.location" placeholder="请输入">
          <el-button
            slot="append"
            icon="el-icon-location"
            @click="handleShowMapDialog"
          ></el-button>
        </el-input>
      </el-form-item>
      <el-form-item>
        <div style="display: inline-flex">
          <el-input v-model="form.latitude" placeholder="纬度"></el-input>
          <el-input
            style="margin-left: 10px"
            v-model="form.longitude"
            placeholder="经度"
          ></el-input>
        </div>
      </el-form-item>
      <el-form-item label="营业时间:" prop="businessHours">
        <el-time-picker
          is-range
          v-model="businessHours"
          value-format="HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          placeholder="选择时间范围"
        >
        </el-time-picker>
      </el-form-item>
      <el-form-item label="联系电话:" prop="categoryId">
        <el-input v-model="form.contactNumber" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="商家徽标:" prop="thumb">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleThumbSuccess"
          :before-upload="beforeImageUpload"
        >
          <img
            v-if="form.thumb"
            :src="form.thumb"
            class="avatar-uploader__image"
          />
          <i v-else class="el-icon-plus avatar-uploader__icon"></i>
          <div slot="tip" class="el-upload__tip">
            只能上传jpg/png文件，且不超过8M。建议尺寸：400×400像素
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="商家轮播图" prop="gallery">
        <el-upload
          :action="uploadUrl"
          :on-remove="handleGalleryRemove"
          :on-preview="handlePreview"
          :on-success="handleGallerySuccess"
          :before-upload="beforeImageUpload"
          multiple
          :limit="9"
          :on-exceed="handleGalleryExceed"
          :file-list="galleryFileList"
          list-type="picture-card"
        >
          <i class="el-icon-plus"></i>
          <div slot="tip" class="el-upload__tip">
            只能上传jpg/png文件，且不超过8M。建议尺寸：750×750像素
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="商家介绍:" prop="intro">
        <el-input v-model="form.intro" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="商家详情图" prop="introImages">
        <el-upload
          :action="uploadUrl"
          :on-remove="handleDetailsRemove"
          :on-preview="handlePreview"
          :on-success="handleDetailsSuccess"
          :before-upload="beforeImageUpload"
          multiple
          :limit="9"
          :on-exceed="handleDetailsExceed"
          :file-list="detailsFileList"
          list-type="picture-card"
        >
          <i class="el-icon-plus"></i>
          <div slot="tip" class="el-upload__tip">
            只能上传jpg/png文件，且不超过8M。建议尺寸：宽750像素，高不限
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="推荐:" prop="hotSeller">
        <el-switch v-model="form.hotSeller"></el-switch>
      </el-form-item>
      <el-form-item label="启用:" prop="disabled">
        <el-switch
          v-model="form.disabled"
          :active-value="false"
          :inactive-value="true"
        ></el-switch>
      </el-form-item>
      <el-form-item label="排序(越大越靠前):" prop="sortOrder">
        <el-slider v-model="form.sortOrder" :min="-100" :max="100"></el-slider>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('form')"> 保存 </el-button>
      </el-form-item>
    </el-form>

    <el-dialog :visible.sync="previewDialogVisible">
      <img width="100%" :src="previewDialogImageUrl" alt="" />
    </el-dialog>

    <el-dialog
      :visible.sync="mapDialogVisible"
      @open="onMapDialogOpen"
      @close="onMapDialogClose"
    >
      <div ref="map-container" class="map-container"></div>
    </el-dialog>
  </el-card>
</template>

<script>
let qq = window.qq;
let map = null;
let region = null;
let listener = null;
let cityService = null;
let searchService = null;
let markers = [];
let markerListeners = [];

export default {
  name: "sellerEdit",
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_URL + "/oss",
      categoryOptions: [],
      attributeOptions: [],

      loading: false,
      searching: false,
      form: {
        id: undefined,
        name: "",
        categoryId: undefined,
        contactNumber: "",
        location: "",
        latitude: 0,
        longitude: 0,
        thumb: "",
        gallery: [],
        introImages: [],
        attributes: [],
        openingTime: "08:00:00",
        closingTime: "22:00:00",
        intro: "",
        hotSeller: false,
        disabled: false,
        sortOrder: 0
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "change" }],
        contactNumber: [
          { required: true, message: "请输入联系电话", trigger: "change" }
        ],
        thumb: [
          { required: true, message: "请选择上传缩略图", trigger: "change" }
        ],
        gallery: [
          { required: true, message: "请上传宣传画廊", trigger: "change" }
        ],
        introImages: [
          { required: true, message: "请上传详情图片", trigger: "change" }
        ],
        hotSeller: [
          { required: true, message: "请选择是否推荐", trigger: "change" }
        ],
        disabled: [
          { required: true, message: "请选择是否启用", trigger: "change" }
        ],
        sortOrder: [
          { required: true, message: "请选择排序", trigger: "change" }
        ]
      },

      galleryFileList: [],
      detailsFileList: [],
      previewDialogImageUrl: "",
      previewDialogVisible: false,

      mapDialogVisible: false
    };
  },
  created() {
    const id = this.$route.query.id;
    this.loadCategoryList();
    this.loadAttributeList();
    if (id) {
      this.form.id = id;
      this.load();
    }
  },
  mounted() {},
  destroyed() {},
  computed: {
    businessHours: {
      get() {
        return [
          this.form.openingTime || "08:00:00",
          this.form.closingTime || "22:00:00"
        ];
      },
      set(val) {
        if (val) {
          this.form.openingTime = val[0];
          this.form.closingTime = val[1];
        } else {
          this.form.openingTime = "";
          this.form.closingTime = "";
        }
      }
    }
  },
  watch: {
    galleryFileList: {
      handler(val) {
        this.form.gallery = val.map(item => {
          if (item.response) {
            return item.response.url;
          } else {
            return item.url;
          }
        });
      },
      deep: true
    },
    detailsFileList: {
      handler(val) {
        this.form.introImages = val.map(item => {
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
    handlePreview(file) {
      this.previewDialogImageUrl = file.url;
      this.previewDialogVisible = true;
    },
    handleThumbSuccess(res) {
      this.form.thumb = res.url;
    },
    handleGallerySuccess(response, file, fileList) {
      this.galleryFileList = fileList;
    },
    handleGalleryRemove(file, fileList) {
      this.galleryFileList = fileList;
    },
    handleGalleryExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 9 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    handleDetailsSuccess(response, file, fileList) {
      this.detailsFileList = fileList;
    },
    handleDetailsRemove(file, fileList) {
      this.detailsFileList = fileList;
    },
    handleDetailsExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 9 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    handleShowMapDialog() {
      this.mapDialogVisible = true;
      this.$nextTick(() => {
        map = new qq.maps.Map(this.$refs["map-container"], {
          zoom: 13
        });

        listener = qq.maps.event.addListener(map, "click", event => {
          this.form.longitude = event.latLng.getLng();
          this.form.latitude = event.latLng.getLat();

          this.mapDialogVisible = false;
        });

        this.initCityService();

        if (this.form.latitude && this.form.longitude) {
          this.clearOverlay();

          let region = new qq.maps.LatLng(
            this.form.latitude,
            this.form.longitude
          );

          let marker = new qq.maps.Marker({
            map: map,
            position: region
          });
          markers.push(marker);

          markerListeners.push(
            qq.maps.event.addListener(marker, "click", event => {
              this.form.longitude = event.latLng.getLng();
              this.form.latitude = event.latLng.getLat();

              this.mapDialogVisible = false;
            })
          );

          map.setCenter(region);
        } else {
          cityService.searchLocalCity();
        }
      });
    },
    searchKeyword() {
      let keyword = this.form.location;

      searchService.setPageCapacity(5);
      if (keyword) {
        searchService.search(keyword);
      } else {
        searchService.searchNearBy(keyword, region, 2000); //根据中心点坐标、半径和关键字进行周边检索。
      }
    },
    initCityService() {
      cityService = new qq.maps.CityService({
        map: map,
        complete: results => {
          region = results.detail.latLng;

          map.setCenter(results.detail.latLng);

          this.initSearchService();
          this.searchKeyword();
        }
      });
    },
    initSearchService() {
      searchService = new qq.maps.SearchService({
        complete: results => {
          let pois = results.detail.pois;

          this.clearOverlay();

          for (let i = 0, l = pois.length; i < l; i++) {
            let poi = pois[i];
            let marker = new qq.maps.Marker({
              map: map,
              position: poi.latLng
            });

            marker.setTitle(i + 1);

            markerListeners.push(
              qq.maps.event.addListener(marker, "click", event => {
                this.form.longitude = event.latLng.getLng();
                this.form.latitude = event.latLng.getLat();

                this.mapDialogVisible = false;
              })
            );

            markers.push(marker);

            if (i === 0) {
              map.setCenter(poi.latLng);
            }
          }
        }
      });
    },
    clearOverlay() {
      for (let i in markers) {
        markers[i].setMap(null);
        qq.maps.event.removeListener(markerListeners[i]);
      }
      markers = [];
      markerListeners = [];
    },
    onMapDialogOpen() {},
    onMapDialogClose() {
      qq.maps.event.removeListener(listener);
    },
    loadCategoryList() {
      this.$http.get("/admin/service_category/list_all").then(res => {
        this.categoryOptions = res.data;
      });
    },
    loadAttributeList() {
      this.$http.get("/admin/seller_attribute/list_all").then(res => {
        this.attributeOptions = res.data;
      });
    },
    load() {
      this.loading = true;
      this.$http
        .get("/admin/seller/get", {
          params: { id: this.form.id }
        })
        .then(
          res => {
            const data = res.data;
            this.form = {
              id: data.id,
              name: data.name,
              categoryId: data.categoryId,
              contactNumber: data.contactNumber,
              location: data.location,
              latitude: data.latitude,
              longitude: data.longitude,
              thumb: data.thumb,
              gallery: data.gallery,
              introImages: data.introImages,
              attributes: data.attributes,
              openingTime: data.openingTime,
              closingTime: data.closingTime,
              intro: data.intro,
              hotSeller: data.hotSeller,
              disabled: data.disabled,
              sortOrder: data.sortOrder,
              status: data.status
            };

            if (data.gallery) {
              this.galleryFileList = data.gallery.map(item => ({ url: item }));
            }
            if (data.introImages) {
              this.detailsFileList = data.introImages.map(item => ({
                url: item
              }));
            }

            this.loading = false;
          },
          () => (this.loading = false)
        );
    },
    onSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http
            .post(
              this.form.id ? "/admin/seller/update" : "/admin/seller/create",
              this.form
            )
            .then(() => {
              this.$message.success("保存成功");
              this.$router.push("/seller");
            });
        }
      });
    }
  }
};
</script>

<style>
.map-container {
  width: 600px;
  height: 400px;
}
</style>
