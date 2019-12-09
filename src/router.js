import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/login",
      name: "login",
      meta: {
        title: "登录",
        whitelist: true
      },
      component: () => import("./views/Login.vue")
    },
    {
      path: "/",
      component: Home,
      children: [
        {
          path: "/",
          name: "home",
          redirect: "/dashboard"
        },
        {
          path: "/dashboard",
          name: "dashboard",
          meta: {
            title: "概览"
          },
          component: () => import("./views/Dashboard.vue")
        },
        {
          path: "/info",
          name: "info",
          meta: {
            title: "信息管理"
          },
          component: () => import("./views/Info.vue")
        },
        {
          path: "/seller",
          name: "seller",
          meta: {
            title: "商家管理"
          },
          component: () => import("./views/Seller.vue")
        },
        {
          path: "/seller/add",
          name: "sellerAdd",
          meta: {
            title: "添加商家"
          },
          component: () => import("./views/SellerEdit.vue")
        },
        {
          path: "/seller/edit",
          name: "sellerEdit",
          meta: {
            title: "编辑商家"
          },
          component: () => import("./views/SellerEdit.vue")
        },
        {
          path: "/question",
          name: "question",
          meta: {
            title: "提问管理"
          },
          component: () => import("./views/Question.vue")
        },
        {
          path: "/dialog",
          name: "dialog",
          meta: {
            title: "对话管理"
          },
          component: () => import("./views/Dialog.vue")
        },
        {
          path: "/news",
          name: "news",
          meta: {
            title: "资讯管理"
          },
          component: () => import("./views/News.vue")
        },
        {
          path: "/news/publish",
          name: "publishNews",
          meta: {
            title: "发布资讯"
          },
          component: () => import("./views/PublishNews.vue")
        },
        {
          path: "/news/:id/edit",
          name: "editNews",
          meta: {
            title: "编辑资讯"
          },
          component: () => import("./views/PublishNews.vue")
        },
        {
          path: "/user",
          name: "user",
          meta: {
            title: "会员管理"
          },
          component: () => import("./views/User.vue")
        },
        {
          path: "/comment",
          name: "comment",
          meta: {
            title: "评论管理"
          },
          component: () => import("./views/Comment.vue")
        },
        {
          path: "/follow",
          name: "follow",
          meta: {
            title: "关注管理"
          },
          component: () => import("./views/Follow.vue")
        },
        {
          path: "/certification",
          name: "certification",
          meta: {
            title: "答主认证"
          },
          component: () => import("./views/Certification.vue")
        },
        {
          path: "/collect",
          name: "collect",
          meta: {
            title: "收藏管理"
          },
          component: () => import("./views/Collect.vue")
        },
        {
          path: "/search_term",
          name: "search_term",
          meta: {
            title: "搜索词"
          },
          component: () => import("./views/SearchTerm.vue")
        },
        {
          path: "/service_category",
          name: "service_category",
          meta: {
            title: "车主服务"
          },
          component: () => import("./views/ServiceCategory.vue")
        },
        {
          path: "/service_category/add",
          name: "serviceCategoryAdd",
          meta: {
            title: "添加车主服务"
          },
          component: () => import("./views/ServiceCategoryEdit.vue")
        },
        {
          path: "/service_category/edit",
          name: "serviceCategoryEdit",
          meta: {
            title: "编辑车主服务"
          },
          component: () => import("./views/ServiceCategoryEdit.vue")
        },
        {
          path: "/notice",
          name: "notice",
          meta: {
            title: "系统消息"
          },
          component: () => import("./views/Notice.vue")
        },
        {
          path: "/transaction",
          name: "transaction",
          meta: {
            title: "交易管理"
          },
          component: () => import("./views/Transaction.vue")
        },
        {
          path: "/cargame_add",
          name: "cargame_add",
          meta: {
            title: "关卡管理"
          },
          component: () => import("./views/cargame_add.vue")
        },
        {
          path: "/cargame_userinfo",
          name: "cargame_userinfo",
          meta: {
            title: "用户列表"
          },
          component: () => import("./views/cargame_userinfo.vue")
        },
        {
          path: "/car_top",
          name: "car_top",
          meta: {
            title: "排行榜"
          },
          component: () => import("./views/car_top.vue")
        },
      ]
    },
    {
      path: "/403",
      name: "forbidden",
      meta: {
        title: "禁止访问",
        whitelist: true
      },
      component: () => import("./views/Forbidden.vue")
    },
    {
      path: "/404",
      name: "notFound",
      meta: {
        title: "找不到页面",
        whitelist: true
      },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("./views/NotFound.vue")
    },
    {
      path: "*",
      redirect: "/404"
    }
  ]
});
