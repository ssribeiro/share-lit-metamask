/* eslint-disable @typescript-eslint/no-var-requires */
import * as esbuild from "esbuild";
// import { readFileSync } from "fs";
// const { dependencies } = JSON.parse(readFileSync("./package.json").toString());
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
// import NodeResolve from "@esbuild-plugins/node-resolve";
// const cryptoBrowserify = require("crypto-browserify");
import * as fs from "fs";
import * as path from "path";
import recursive from "recursive-readdir";

if (fs.existsSync("src/browser.js")) {
  fs.rmSync("src/browser.js");
}

if (fs.existsSync("sdk-browser/dist/esbuild")) {
  fs.rmSync("sdk-browser/dist/esbuild", { recursive: true });
}

await esbuild.build({
  entryPoints: ["src-lit-price/index.ts"],
  format: "esm",
  platform: "browser",
  bundle: true,
  minify: true,
  sourcemap: "external",
  // external: Object.keys(dependencies),
  // external: ["crypto"],
  plugins: [
    // NodeResolve({
    //   extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    //   onResolved: (resolved) => {
    //     if (resolved.includes("node_modules")) {
    //       return {
    //         external: true,
    //       };
    //     }
    //     if (resolved.includes("crypto")) {
    //       return cryptoBrowserify;
    //     }
    //   },
    // }),
    // WasmPlugin,
    // wasmPlugin,
    NodeModulesPolyfillPlugin(),
  ],
  outfile: "dist/esbuild/browser.js",
  banner: {
    js: "/* eslint-disable */",
  },
  // loader: {
  //   ".wasm": "binary", // Loader to handle wasm files
  // },
});

fs.mkdirSync("dist/tsc", { recursive: true });

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

recursive("dist/tsc", function (err, files) {
  // `files` is an array of file paths
  const filteredFiles = files.filter((file) => file.includes(".d.ts"));

  for (const fn of filteredFiles) {
    const target = path.join("dist", "/esbuild", fn);
    ensureDirectoryExistence(target);
    fs.copyFileSync(fn, target);
  }
});

// copy file dist/esbuild/browser.js to src/browser.js

fs.copyFileSync("dist/esbuild/browser.js", "src/browser.js");

/*
plugins: [
    react(),
    nodePolyfills()
  ],
  resolve: {
    alias: {
      buffer: 'buffer/',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      vm: 'vm-browserify',
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer']
        })
      ]
    }
  }
    */
