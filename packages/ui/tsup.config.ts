import path from "node:path";
import { copyFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const root = path.resolve(process.cwd());

/** Load CSS ourselves so tsup doesn't run PostCSS from the repo root (which fails here). */
const cssLoadPlugin = {
  name: "css-load",
  setup(build: {
    onLoad: (
      o: { filter: RegExp },
      fn: (args: { path: string }) => { contents: string; loader: string },
    ) => void;
  }) {
    build.onLoad({ filter: /\.css$/ }, (args) => ({
      contents: readFileSync(args.path, "utf8"),
      loader: "css",
    }));
  },
};

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: { tsconfig: path.join(root, "tsconfig.json") },
  outDir: "dist",
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    options.keepNames = true;
    options.plugins = [cssLoadPlugin, ...(options.plugins ?? [])];
  },
  onSuccess: async () => {
    const dist = path.join(root, "dist");
    if (!existsSync(dist)) mkdirSync(dist, { recursive: true });

    copyFileSync(path.join(root, "src/styles.css"), path.join(dist, "styles.css"));
    copyFileSync(
      path.join(root, "src/components/toast/Toast.css"),
      path.join(dist, "Toast.css"),
    );
  },
});
