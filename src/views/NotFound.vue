<template>
  <div class="not-fount">
    <div class="exception-index">
      <div class="exception-index-image"></div>
      <div>
        <h1 class="exception-index-name">404</h1>
        <div class="exception-index-desc">抱歉，你访问的页面不存在</div>
        <el-button type="primary" size="small" @click="$router.replace('/')">
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "notFound"
};
</script>

<style scoped>
.not-fount {
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
}

.exception-index {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 80%;
  min-height: 500px;
}

.exception-index-image {
  flex-grow: 1;
  padding-right: 152px;
  height: 360px;
  max-width: 430px;
  float: right;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: contain;
  background-image: url(https://gw.alipayobjects.com/zos/rmsportal/KpnpchXsobRgLElEozzI.svg);
}

.exception-index-name {
  margin-bottom: 24px;
  font-size: 72px;
  font-weight: 600;
  color: #434e59;
}

.exception-index-desc {
  color: rgba(0, 0, 0, 0.45);
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 16px;
}
</style>
