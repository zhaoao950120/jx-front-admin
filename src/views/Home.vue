<template>
  <el-container style="height: 100vh">
    <el-aside width="auto">
      <div class="brand" :style="{ width: isCollapse ? '64px' : '256px' }">
        <img class="brand__logo" src="../assets/img/logo-white.png" alt="logo" />
        <h1 class="brand__text" :style="{ opacity: isCollapse ? 0 : 1 }">汽车问答</h1>
      </div>

      <el-menu
        router
        :default-active="$route.path"
        unique-opened
        background-color="#001529"
        text-color="rgba(255, 255, 255, 0.65)"
        active-text-color="#ffd04b"
        :collapse="isCollapse"
      >
        <template v-for="nav in navList">
          <!-- 不存在子菜单 -->
          <el-menu-item :key="nav.name" v-if="!nav.children" :index="nav.path">
            <i :class="'el-icon-' + nav.icon"></i>
            <span slot="title">{{ nav.title }}</span>
          </el-menu-item>
          <!-- 存在子带单 -->
          <el-submenu v-else :key="nav.name" :index="nav.name">
            <template slot="title">
              <i :class="'el-icon-' + nav.icon"></i>
              <span>{{ nav.title }}</span>
            </template>
            <el-menu-item v-for="child in nav.children" :key="child.name" :index="child.path">
              <span slot="title">{{ child.title }}</span>
            </el-menu-item>
          </el-submenu>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header" height="64px">
        <i
          :class="[isCollapse ? 'el-icon-3rd-indent' : 'el-icon-3rd-outdent']"
          class="header__button"
          @click="isCollapse = !isCollapse"
        ></i>
        <el-dropdown>
          <div>
            <div class="header__user">
              <img class="header__user-avatar" :src="user.avatar" v-fallback="'avatar'" />
              <div class="header__user-name">
                {{ user.name }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </div>
            </div>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <div>修改密码</div>
            </el-dropdown-item>
            <el-dropdown-item divided>
              <div @click="logout">退出</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "home",
  data() {
    return {
      isCollapse: false
    };
  },
  computed: {
    ...mapGetters(["user", "navList"])
  },
  created() {
    this.$store.dispatch("FilterNavList", this.user);
  },
  methods: {
    logout() {
      this.$store.dispatch("Logout").then(() => {
        location.reload();
      });
    }
  }
};
</script>

<style scoped>
.brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 256px;
  height: 64px;
  background-color: #002140;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  color: #fff;
  transition: width 0.3s;
}

.brand__logo {
  margin-left: 12px;
  width: 40px;
  height: 40px;
}

.brand__text {
  margin-left: 12px;
  font-size: 24px;
  font-weight: bold;
  line-height: 64px;
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.3s;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.header__button {
  box-sizing: border-box;
  margin-left: -20px;
  padding: 22px 24px;
  height: 64px;
  font-size: 20px;
  transition: all 0.3s, padding 0s;
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
}

.header__button:hover {
  background: rgba(0, 0, 0, 0.025);
}

.header__user {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.header__user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.header__user-name {
  padding: 0 12px;
}
</style>

<style lang="scss">
.el-menu {
  border-right-width: 0 !important;
}

.el-submenu {
  .el-submenu__title {
    background-color: #001529 !important;
    color: rgba(255, 255, 255, 0.65) !important;
  }

  .el-menu-item {
    background-color: #000c17 !important;
    color: rgba(255, 255, 255, 0.65) !important;
  }

  .el-submenu__icon-arrow,
  i {
    color: rgba(255, 255, 255, 0.65) !important;
  }

  .el-submenu__title:hover,
  .el-submenu__title:hover > .el-submenu__icon-arrow,
  .el-submenu__title:hover > i,
  .el-menu-item:hover {
    color: #fff !important;
  }

  &.is-active > .el-submenu__title,
  &.is-active > .el-submenu__title > .el-submenu__icon-arrow,
  &.is-active > .el-submenu__title > i {
    color: #fff !important;
  }

  .el-menu-item.is-active {
    background-color: #1890ff !important;
    color: #fff !important;
  }
}

.el-header {
  position: relative;
  line-height: 64px;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.65);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;
}

.el-aside {
  position: relative;
  background-color: #001529;
  color: rgba(255, 255, 255, 0.65);
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 20;
}

.el-main {
  background-color: #f0f2f5 !important;
}
</style>
