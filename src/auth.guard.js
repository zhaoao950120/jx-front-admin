import router from "@/router";
import store from "@/store";

export default {
  install() {
    router.beforeEach((to, from, next) => {
      if (!to.meta.whitelist) {
        checkLogin(from, to)
          .then(() => next())
          .then(() => checkPermission(from, to))
          .catch(err => {
            if (to.meta.canRedirect) {
              store.dispatch("SetRedirectUrl", to.path);
            }

            if (err && err.code === 403) {
              router.push({ name: "login" });
            } else {
              router.push({ name: "login" });
            }
          });
      } else {
        next();
      }
    });

    function checkLogin() {
      const isLoggedIn = !!store.getters.token;
      if (!isLoggedIn) {
        return Promise.reject({ code: 401, message: "未登录" });
      }

      if (store.getters.user === null) {
        return store.dispatch("GetUser");
      }

      return Promise.resolve();
    }

    function checkPermission(from, to) {
      if (to.meta.roles) {
        const user = store.getters.user;
        if (user) {
          if (to.meta.roles.indexOf(user.role) < 0) {
            return Promise.reject({ code: 403, message: "没有权限" });
          }
        }
      }

      return Promise.resolve();
    }
  }
};
