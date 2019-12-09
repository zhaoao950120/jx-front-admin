import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import "normalize.css";
import Element from "element-ui";
import "./element-variables.scss";
import VueClipboard from "vue-clipboard2";
import "./assets/icon/iconfont.css";
import TitleGuard from "./title.guard";
import AuthGuard from "./auth.guard";
import AxiosConfig from "./axios.config";
import ImgFallback from "./imgFallback";
import FormatDate from "./formatDate";
import ConfirmPopup from "./components/confirm-popup";

import Quill from "quill";
import VueQuillEditor from "vue-quill-editor";
import { container, ImageExtend, QuillWatch } from "quill-image-extend-module";
// require styles
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

Vue.config.productionTip = false;
Vue.use(Element, { size: "small" });
VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);
Vue.use(TitleGuard);
Vue.use(AuthGuard);
Vue.use(AxiosConfig);
Vue.use(ImgFallback);
Vue.use(FormatDate);
Vue.use(ConfirmPopup);

Quill.register("modules/ImageExtend", ImageExtend);
Vue.use(VueQuillEditor, {
  modules: {
    ImageExtend: {
      loading: true,
      size: 1,
      name: "file",
      action: `${process.env.VUE_APP_BASE_URL}/oss`,
      response: res => {
        return res.url;
      }
    },
    toolbar: {
      container: container,
      handlers: {
        image: function() {
          QuillWatch.emit(this.quill.id);
        }
      }
    }
  },
  placeholder: ""
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
