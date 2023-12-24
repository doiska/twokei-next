import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  bundle: true,
  dts: false,
  entry: ["src/**/*.ts", "!src/**/*.d.ts"],
  format: ["cjs"],
  platform: "node",
  minify: false,
  tsconfig: "tsconfig.json",
  target: "es2020",
  splitting: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  shims: false,
  keepNames: true,
});
