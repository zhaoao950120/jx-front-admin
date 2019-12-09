import Vue from "vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import VueAxios from "vue-axios";
import { Message } from "element-ui";

export default {
  install() {
    Vue.use(VueAxios, axios);

    Vue.axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;
    Vue.axios.defaults.timeout = 60000;
    Vue.axios.defaults.headers.common["Content-Type"] = "application/json";
    Vue.axios.defaults.headers.common["Accept"] = "application/json";
    if (process.env.VUE_APP_SPEC) {
      Vue.axios.defaults.headers.common["X-App-Version"] =
        process.env.VUE_APP_SPEC;
    }

    Vue.axios.interceptors.request.use(
      config => {
        const token = store.getters.token;
        if (token) {
          config.headers["authorization"] = "Bearer " + token;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    Vue.axios.interceptors.response.use(
      res => {
        const authHeader = res.headers["authorization"];
        if (authHeader && authHeader.length > 7) {
          const authToken = authHeader.substring(7);
          store.commit("SET_TOKEN", authToken);
        }
        if (res.data.code === 401) {
          router.push({ name: "login" });

          return Promise.reject(res);
        } else if (res.data.code >= 400 && res.data.code < 600) {
          Message.error(res.data.message || "操作失败");

          return Promise.reject(res);
        }

        return res;
      },
      err => {
        if (err.response) {
          if (err.response.status === 401) {
            router.push({ name: "login" });
          } else if (err.response.data.message) {
            Message.error(err.response.data.message);
          } else {
            Message.error("无法连接服务器");
          }

          return Promise.reject(err);
        } else {
          Message.error("无法连接服务器");
        }

        return Promise.reject(err);
      }
    );
  }
};
