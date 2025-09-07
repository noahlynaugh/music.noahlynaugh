import { defineConfig } from "vite";
import { resolve } from 'path';
import fs from 'fs';

// helper function to recursively find HTML files
function findHtmlFiles(dir) {
  // Check if "pages" exists directly under dir
  const pagesPath = resolve(dir, "pages");
  if (!fs.existsSync(pagesPath) || !fs.statSync(pagesPath).isDirectory()) {
    console.warn(`No "pages/" directory found in ${dir}.`);
    return {}; // early exit
  }

  let htmlFiles = {};
  const files = fs.readdirSync(pagesPath);

  if (files.length === 0) {
    console.warn(`"pages/" directory is empty in ${dir}.`);
    return {}; // early exit if empty
  }

  for (const file of files) {
    const fullPath = resolve(pagesPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subFiles = findHtmlFiles(fullPath);
      htmlFiles = { ...htmlFiles, ...subFiles };
    } else if (file.endsWith(".html")) {
      const name = file === "index.html"
        ? "index"
        : file.replace(".html", "");
      htmlFiles[name] = fullPath;
    }
  }
  return htmlFiles;
}

// automatically find all html files
const input = {
  index: resolve(__dirname, './index.html'),
  ...findHtmlFiles(resolve(__dirname, './Pages'))
};

export default defineConfig({
    root: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input
        }
    },
})