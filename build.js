import { build } from "esbuild"

await build({
  entryPoints: ["./src/index.ts", "./assets/index.css"],
  outdir: "./dist",
  outExtension: {
    '.js': '.min.js', 
    '.css': '.min.css', 
  },
  bundle: true,
  minify: true,
  allowOverwrite: true,
})
