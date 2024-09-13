import { templateCompilerOptions } from "@tresjs/core";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { defineConfig, loadEnv } from "vite";

const path = require("path");
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Load app-level env vars to node-level env vars.
  //
  return {
    plugins: [
      vue({ ...templateCompilerOptions }),
      Components({
        dirs: ["@/ui/core/components"],
        dts: true,
        extensions: ["vue"],
        deep: true,
        resolvers: [
          (componentName) => {
            if (componentName.startsWith("Core")) {
              return { name: componentName, from: "@/ui/core/components" };
            }
          },
        ],
      }),
    ],
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
