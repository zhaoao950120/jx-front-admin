import Vue from "vue";
import Vuex from "vuex";
import nav from "./nav";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: "",
    user: null,
    redirectUrl: null
  },
  getters: {
    token(state) {
      if (state.token === "") {
        const authToken = localStorage.getItem("auth-token");
        let result = JSON.parse(authToken);
        if (result) {
          if (Date.now() - result.timestamp > 3600 * 2000) {
            localStorage.removeItem("auth-token");
            state.token = "";
          } else {
            state.token = result.token;
          }
        } else {
          state.token = "";
        }

        console.log("load token", state.token);
      }

      return state.token;
    },
    user(state) {
      if (state.user === null) {
        state.user = JSON.parse(sessionStorage.getItem("auth-user"));

        console.log("load user", state.user);
      }

      return state.user;
    },
    redirectUrl(state) {
      if (state.redirectUrl === null) {
        state.redirectUrl = JSON.parse(localStorage.getItem("redirect-url"));

        console.log("load redirect url", state.user);
      }
      if (state.redirectUrl === null) {
        state.redirectUrl = "/";
      }

      return state.redirectUrl;
    }
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem(
        "auth-token",
        JSON.stringify({ token: token, timestamp: Date.now() })
      );

      console.log("SET_TOKEN", token);
    },
    SET_USER(state, user) {
      state.user = user;
      sessionStorage.setItem("auth-user", JSON.stringify(user));

      console.log("SET_USER", user);
    },
    SET_REDIRECT_URL(state, redirectUrl) {
      state.redirectUrl = redirectUrl;
      localStorage.setItem("redirect-url", JSON.stringify(redirectUrl));

      console.log("SET_REDIRECT_URL", redirectUrl);
    }
  },
  actions: {
    Login({ commit }, loginInfo) {
      return Vue.axios.post("/admin/login", loginInfo).then(res => {
        commit("SET_USER", res.data);
        commit("FILTER_NAV_LIST", res.data);
        return res.data;
      });
    },
    Logout({ commit }) {
      return Vue.axios.post("/logout").then(
        () => {
          commit("SET_TOKEN", "");
          commit("SET_USER", []);
          commit("FILTER_NAV_LIST");
        },
        () => {
          commit("SET_TOKEN", "");
          commit("SET_USER", []);
          commit("FILTER_NAV_LIST");
        }
      );
    },
    SetToken({ commit }, token) {
      commit("SET_TOKEN", token);
    },
    SetRedirectUrl({ commit }, redirectUrl) {
      commit("SET_REDIRECT_URL", redirectUrl);
    },
    GetUser({ commit }) {
      return Vue.axios.get("/get_auth_info").then(res => {
        commit("SET_USER", res.data);
        commit("FILTER_NAV_LIST", res.data);
        return res.data;
      });
    }
  },
  modules: {
    nav
  }
});
