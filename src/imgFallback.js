import Vue from "vue";
import placeholderAvatar from "@/assets/img/placeholder_avatar.png";
import placeholderImage from "@/assets/img/placeholder_image.png";

export default {
  install() {
    Vue.directive("fallback", {
      // 当被绑定的元素插入到 DOM 中时……
      inserted: function(el, binding) {
        const className = "default-" + (binding.value || "image");
        const image =
          binding.value === "avatar" ? placeholderAvatar : placeholderImage;
        el.classList.add(className);

        el.onload = function() {
          el.onload = null;
          el.onerror = null;
          el.classList.remove(className);
        };
        el.onerror = function() {
          el.onload = null;
          el.onerror = null;
          el.src = image;
          el.classList.remove(className);
        };
      }
    });
  }
};
