<template>
  <div class="file-manager">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <el-menu default-active="1">
          <el-menu-item index="1">
            <i class="el-icon-folder"></i>
            <span>收藏夹</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-document"></i>
            <span>文档</span>
          </el-menu-item>
          <el-menu-item index="3">
            <i class="el-icon-picture"></i>
            <span>图片</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="main-container">
        <!-- 工具栏 -->
        <el-header height="50px">
          <!-- 添加面包屑导航 -->
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <!-- 添加根目录项 -->
              <el-breadcrumb-item @click.native="navigateToPath(-1)">
                <el-icon class="el-icon-s-home"></el-icon>
              </el-breadcrumb-item>
              <!-- 显示第一级路径 -->
              <template v-if="currentPathArray.length > 0">
                <el-breadcrumb-item @click.native="navigateToPath(0)">
                  {{ currentPathArray[0] }}
                </el-breadcrumb-item>
              </template>

              <!-- 中间路径省略 -->
              <template v-if="currentPathArray.length > 3">
                <el-breadcrumb-item>
                  <el-dropdown @command="navigateToPath">
                    <span class="el-dropdown-link"> ... </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item
                        v-for="(path, index) in middlePaths"
                        :key="index"
                        :command="index + 1"
                      >
                        {{ path }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </el-breadcrumb-item>
              </template>

              <!-- 显示最后两级路径 -->
              <template v-if="currentPathArray.length > 2">
                <el-breadcrumb-item
                  v-for="(path, index) in lastTwoPaths"
                  :key="index"
                  @click.native="navigateToPath(getLastPathsIndex(index))"
                >
                  {{ path }}
                </el-breadcrumb-item>
              </template>

              <!-- 只有2个或更少路径时的显示 -->
              <template v-else-if="currentPathArray.length > 1">
                <el-breadcrumb-item @click.native="navigateToPath(1)">
                  {{ currentPathArray[1] }}
                </el-breadcrumb-item>
              </template>
            </el-breadcrumb>
          </div>
          <el-button-group>
            <el-button
              size="small"
              icon="el-icon-back"
              :disabled="!canGoBack"
              @click="goBack"
            ></el-button>
            <el-button
              size="small"
              icon="el-icon-right"
              :disabled="!canGoForward"
              @click="goForward"
            ></el-button>
          </el-button-group>
          <el-input
            v-model="searchQuery"
            size="small"
            placeholder="搜索"
            prefix-icon="el-icon-search"
            style="width: 200px; margin-left: 20px"
            clearable
          ></el-input>
          <el-button-group style="margin-left: 20px">
            <el-button
              size="small"
              :type="viewType === 'list' ? 'primary' : ''"
              @click="switchView('list')"
            >
              <icon-list />
            </el-button>
            <el-button
              size="small"
              :type="viewType === 'grid' ? 'primary' : ''"
              @click="switchView('grid')"
            >
              <i class="el-icon-menu"></i>
            </el-button>
          </el-button-group>
        </el-header>

        <!-- 文件列表 -->
        <el-main>
          <!-- 列表视图 -->
          <el-table
            v-if="viewType === 'list'"
            :data="fileList"
            style="width: 100%"
            @row-dblclick="handleRowDblClick"
          >
            <el-table-column width="50">
              <template slot-scope="scope">
                <i :class="getFileIcon(scope.row.type)"></i>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column
              prop="modifiedDate"
              label="修改日期"
              width="180"
            ></el-table-column>
            <el-table-column
              prop="size"
              label="大小"
              width="100"
            ></el-table-column>
            <el-table-column
              prop="type"
              label="类型"
              width="100"
            ></el-table-column>
            <!-- 新增操作列 -->
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button
                  v-if="scope.row.type !== 'folder'"
                  size="mini"
                  type="text"
                  icon="el-icon-download"
                  @click="handleDownload(scope.row)"
                  >下载</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <!-- 网格视图 -->
          <div v-else class="grid-view">
            <div
              v-for="file in fileList"
              :key="file.name"
              class="grid-item"
              @dblclick="handleRowDblClick(file)"
            >
              <div class="grid-item-content">
                <i :class="getFileIcon(file.type)" class="grid-icon"></i>
                <div class="file-name">{{ file.name }}</div>
                <div class="file-info">
                  {{ file.size }} · {{ file.modifiedDate }}
                </div>
                <!-- 添加悬浮下载按钮 -->
                <div v-if="file.type !== 'folder'" class="hover-actions">
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-download"
                    circle
                    @click.stop="handleDownload(file)"
                  ></el-button>
                </div>
              </div>
            </div>
          </div>
        </el-main>

        <!-- 状态栏 -->
        <el-footer height="30px">
          <span>{{ fileList.length }} 个项目</span>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
// import fileSystem from "../data/mockFileSysPath";
import IconList from "./icons/IconList.vue";
import { debounce } from "lodash";
import { getFileSystem } from "../services/fileSystemService";

export default {
  name: "FileManager",
  components: {
    IconList,
  },
  data() {
    return {
      searchQuery: "",
      viewType: "list", // 添加视图类型状态
      currentPath: "", // 当前路径
      fileSystem: null,
      history: [""], // 历史记录数组，初始包含根目录
      currentHistoryIndex: 0, // 当前位置索引
      debouncedSearch: null,
    };
  },
  computed: {
    currentPathArray() {
      return this.currentPath
        ? this.currentPath.split("/").filter(Boolean)
        : [];
    },
    fileList() {
      if (!this.fileSystem) return [];
      const currentFiles = this.fileSystem[this.currentPath] || [];
      if (!this.searchQuery) {
        return currentFiles;
      }

      const searchTerm = this.searchQuery.toLowerCase();
      return currentFiles.filter((file) =>
        file.name.toLowerCase().includes(searchTerm)
      );
    },
    middlePaths() {
      if (this.currentPathArray.length <= 3) return [];
      return this.currentPathArray.slice(1, -2);
    },
    lastTwoPaths() {
      if (this.currentPathArray.length <= 2) return [];
      return this.currentPathArray.slice(-2);
    },
    canGoBack() {
      return this.currentHistoryIndex > 0;
    },
    canGoForward() {
      return this.currentHistoryIndex < this.history.length - 1;
    },
  },
  watch: {
    searchQuery(newVal) {
      if (this.debouncedSearch) {
        this.debouncedSearch(newVal);
      }
    },
  },
  created() {
    // 创建防抖的搜索方法
    this.debouncedSearch = debounce((searchTerm) => {
      console.log("Searching for:", searchTerm);
      // 这里可以添加额外的搜索相关逻辑
    }, 300);
  },
  mounted() {
    getFileSystem().then((data) => {
      this.fileSystem = data;
    });
  },
  beforeDestroy() {
    // 清理防抖函数
    if (this.debouncedSearch) {
      this.debouncedSearch.cancel();
    }
  },
  methods: {
    getFileIcon(type) {
      const iconMap = {
        folder: "el-icon-folder",
        pdf: "el-icon-document",
        image: "el-icon-picture",
        default: "el-icon-document",
      };
      return iconMap[type] || iconMap.default;
    },
    switchView(type) {
      this.viewType = type;
    },
    async handleDownload(file) {
      try {
        const filePath = this.currentPath
          ? `${this.currentPath}/${file.name}`
          : file.name;

        const response = await fetch(
          `http://localhost:3000/api/download?path=${encodeURIComponent(
            filePath
          )}`
        );

        if (!response.ok) {
          throw new Error("Download failed");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.$message({
          message: `Successfully downloaded: ${file.name}`,
          type: "success",
        });
      } catch (error) {
        console.error("Download error:", error);
        this.$message({
          message: `Failed to download: ${file.name}`,
          type: "error",
        });
      }
    },
    handleRowDblClick(row) {
      if (row.type === "folder") {
        const newPath = this.currentPath
          ? `${this.currentPath}/${row.name}`
          : row.name;
        this.navigateTo(newPath);
      }
    },
    navigateTo(path) {
      // 当通过导航改变路径时，需要处理历史记录
      this.currentPath = path;

      // 如果不是通过前进后退按钮导航，需要清除当前位置之后的历史
      this.history = this.history.slice(0, this.currentHistoryIndex + 1);
      // 添加新路径到历史记录
      this.history.push(path);
      // 更新当前位置
      this.currentHistoryIndex = this.history.length - 1;
    },
    goBack() {
      if (this.canGoBack) {
        this.currentHistoryIndex--;
        this.currentPath = this.history[this.currentHistoryIndex];
      }
    },
    goForward() {
      if (this.canGoForward) {
        this.currentHistoryIndex++;
        this.currentPath = this.history[this.currentHistoryIndex];
      }
    },
    // 修改现有的导航相关方法
    navigateToPath(index) {
      if (index === -1) {
        this.navigateTo("");
      } else {
        const pathArray = this.currentPathArray.slice(0, index + 1);
        this.navigateTo(pathArray.join("/"));
      }
    },
    getLastPathsIndex(index) {
      return this.currentPathArray.length - 2 + index;
    },
  },
};
</script>

<style scoped>
.file-manager {
  /* height: 100vh; */
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}

.el-aside {
  background-color: #f5f7fa;
  border-right: 1px solid #e6e6e6;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.el-footer {
  background-color: #f5f7fa;
  border-top: 1px solid #e6e6e6;
  padding: 0 20px;
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.el-main {
  padding: 20px;
  background-color: #fff;
  height: 500px;
}

.el-menu {
  border-right: none;
}

.el-menu-item i {
  margin-right: 5px;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  padding: 20px;
}

.grid-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.grid-item-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hover-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 5px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.grid-item:hover .hover-actions {
  opacity: 1;
}

.grid-item:hover .grid-icon,
.grid-item:hover .file-name,
.grid-item:hover .file-info {
  opacity: 0.5;
}

.grid-icon {
  font-size: 40px;
  color: #909399;
  margin-bottom: 10px;
}

.file-name {
  font-size: 14px;
  text-align: center;
  margin-bottom: 5px;
  word-break: break-all;
}

.file-info {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.breadcrumb {
  margin-right: 20px;
}

.el-breadcrumb__item {
  cursor: pointer;
}

.el-breadcrumb__inner:hover {
  color: #409eff;
}

.el-dropdown-link {
  cursor: pointer;
  color: #909399;
}

.el-dropdown-link:hover {
  color: #409eff;
}

.el-table__empty-text {
  color: #909399;
}

.no-results {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>
