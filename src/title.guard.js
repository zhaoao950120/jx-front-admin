import router from "@/router";

export default {
  install() {
    router.beforeEach((to, from, next) => {
      if (to.meta.title) {
        document.title = to.meta.title + " - 汽车问答";
      }
      next();
    });
  }
};
