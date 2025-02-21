const fs = require("fs");
const path = require("path");

function getFileInfo(filePath) {
  const stats = fs.statSync(filePath);
  const name = path.basename(filePath);

  return {
    name,
    type: stats.isDirectory()
      ? "folder"
      : path.extname(name).slice(1) || "file",
    size: stats.isDirectory()
      ? "--"
      : `${(stats.size / (1024 * 1024)).toFixed(1)} MB`,
    modifiedDate: new Date(stats.mtime)
      .toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/\//g, "-"),
  };
}

function convertToFileSystem(rootPath) {
  const result = {};

  function traverse(currentPath, relativePath = "") {
    const items = fs.readdirSync(currentPath)
      .filter(item => !item.includes('node_modules')) // Filter out node_modules
      .filter(item => !item.startsWith('.')); // Filter out hidden files
    const relativeKey = relativePath || "";

    result[relativeKey] = [];

    items.forEach((item) => {
      const fullPath = path.join(currentPath, item);
      const fileInfo = getFileInfo(fullPath);
      result[relativeKey].push(fileInfo);

      if (fileInfo.type === "folder") {
        const newRelativePath = relativePath ? `${relativePath}/${item}` : item;
        traverse(fullPath, newRelativePath);
      }
    });
  }

  traverse(rootPath);
  return result;
}

module.exports = { convertToFileSystem };
