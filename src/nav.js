export default {
  state: {
    fullNavList: [
      {
        name: "dashboard",
        title: "概览",
        icon: "3rd-dashboard",
        path: "/dashboard"
      },
      {
        name: "contentManager",
        title: "内容管理",
        icon: "3rd-read",
        children: [
          {
            name: "info",
            title: "信息管理",
            path: "/info"
          },
          {
            name: "seller",
            title: "商家管理",
            path: "/seller"
          },
          {
            name: "question",
            title: "提问管理",
            path: "/question"
          },
          {
            name: "news",
            title: "资讯管理",
            path: "/news"
          }
        ]
      },
      {
        name: "userManager",
        title: "用户管理",
        icon: "3rd-user",
        children: [
          {
            name: "user",
            title: "会员管理",
            path: "/user"
          },
          {
            name: "comment",
            title: "评论管理",
            path: "/comment"
          },
          {
            name: "follow",
            title: "关注管理",
            path: "/follow"
          },
          {
            name: "collect",
            title: "收藏管理",
            path: "/collect"
          },
          {
            name: "certification",
            title: "答主认证",
            path: "/Certification"
          }
        ]
      },
      {
        name: "systemManager",
        title: "系统管理",
        icon: "3rd-setting",
        children: [
          {
            name: "search_term",
            title: "搜索词",
            path: "/search_term"
          },
          {
            name: "service_category",
            title: "车主服务",
            path: "/service_category"
          },
          {
            name: "notice",
            title: "系统消息",
            path: "/notice"
          },
          {
            name: "transaction",
            title: "交易管理",
            path: "/transaction"
          }
        ]
      },
      {
        name: "car_game",
        title: "关卡管理",
        icon: "s-flag",
        children: [
          {
            name: "car_add",
            title: "关卡管理",
            path: "/cargame_add"
          },
          {
            name: "cargame_userinfo",
            title: "用户列表",
            path: "/cargame_userinfo"
          },
          {
            name: "car_top",
            title: "排行榜",
            path: "/car_top"
          }
        ]
      }
    ],
    navList: []
  },
  getters: {
    navList: state => state.navList
  },
  mutations: {
    FILTER_NAV_LIST: (state, user) => {
      state.navList = state.fullNavList.filter(value => {
        if (!user) {
          return false;
        }
        if (value.roles && value.roles.indexOf(user.role) < 0) {
          return false;
        }
        if (value.children) {
          value.children = value.children.filter(
            value => !value.roles || value.roles.indexOf(user.role) >= 0
          );
        }
        if (value.children && value.children.length === 0) {
          delete value.children;
        }

        return true;
      });
    }
  },
  actions: {
    FilterNavList: ({ commit }, user) => {
      commit("FILTER_NAV_LIST", user);
    }
  }
};
