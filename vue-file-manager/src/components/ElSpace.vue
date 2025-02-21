<template>
  <div
    class="el-space"
    :class="[`el-space--${direction}`, `el-space--alignment-${alignment}`]"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="el-space-item"
      :style="getItemStyle(index)"
    >
      <slot v-if="!item" />
      <template v-else>
        <component :is="item" v-bind="$attrs" v-on="$listeners" />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "ElSpace",
  props: {
    direction: {
      type: String,
      default: "horizontal",
      validator: (val) => ["horizontal", "vertical"].includes(val),
    },
    alignment: {
      type: String,
      default: "center",
      validator: (val) => ["start", "end", "center", "baseline"].includes(val),
    },
    size: {
      type: [String, Number, Array],
      default: "small",
      validator: (val) => {
        if (typeof val === "string") {
          return ["mini", "small", "medium", "large"].includes(val);
        }
        return true;
      },
    },
    wrap: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    items() {
      return this.$slots.default;
    },
    sizeMap() {
      return {
        mini: 4,
        small: 8,
        medium: 16,
        large: 24,
      };
    },
    actualSize() {
      const size = this.size;
      if (Array.isArray(size)) {
        return size.map((item) =>
          typeof item === "number"
            ? item
            : this.sizeMap[item] || this.sizeMap.small
        );
      }
      return typeof size === "number"
        ? size
        : this.sizeMap[size] || this.sizeMap.small;
    },
  },
  methods: {
    getItemStyle(index) {
      const style = {};
      const [horizontalSize, verticalSize] = Array.isArray(this.actualSize)
        ? this.actualSize
        : [this.actualSize, this.actualSize];

      if (this.direction === "horizontal") {
        if (this.wrap) {
          style.marginBottom = verticalSize + "px";
        }
        if (index < this.items.length - 1) {
          style.marginRight = horizontalSize + "px";
        }
      } else {
        if (index < this.items.length - 1) {
          style.marginBottom = verticalSize + "px";
        }
      }

      return style;
    },
  },
};
</script>

<style scoped>
.el-space {
  display: inline-flex;
}

.el-space--horizontal {
  flex-direction: row;
}

.el-space--vertical {
  flex-direction: column;
}

.el-space--alignment-center {
  align-items: center;
}

.el-space--alignment-start {
  align-items: flex-start;
}

.el-space--alignment-end {
  align-items: flex-end;
}

.el-space--alignment-baseline {
  align-items: baseline;
}

.el-space-item {
  flex-shrink: 0;
}
</style>
