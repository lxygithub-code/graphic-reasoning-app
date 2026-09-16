import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      // 关键：让 Sass 里的 'uview-ui/xxx' 能找到 uview-plus 包
      "uview-ui": "uview-plus",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 屏蔽 @import 弃用警告
        silenceDeprecations: ["import", "legacy-js-api"],
      },
    },
  },
});