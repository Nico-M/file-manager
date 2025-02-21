<template>
  <div
    class="el-flex"
    :style="{
      display: 'flex',
      justifyContent,
      alignItems,
      flexDirection,
      flexWrap,
      gap: typeof gap === 'number' ? `${gap}px` : gap,
    }"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "ElFlex",
  props: {
    justify: {
      type: String,
      default: "start",
      validator: (value) =>
        [
          "start",
          "end",
          "center",
          "space-around",
          "space-between",
          "space-evenly",
        ].includes(value),
    },
    align: {
      type: String,
      default: "center",
      validator: (value) =>
        ["start", "end", "center", "baseline", "stretch"].includes(value),
    },
    direction: {
      type: String,
      default: "row",
      validator: (value) =>
        ["row", "row-reverse", "column", "column-reverse"].includes(value),
    },
    wrap: {
      type: String,
      default: "nowrap",
      validator: (value) => ["nowrap", "wrap", "wrap-reverse"].includes(value),
    },
    gap: {
      type: [String, Number],
      default: 0,
    },
  },
  computed: {
    justifyContent() {
      const map = {
        start: "flex-start",
        end: "flex-end",
      };
      return map[this.justify] || this.justify;
    },
    alignItems() {
      const map = {
        start: "flex-start",
        end: "flex-end",
      };
      return map[this.align] || this.align;
    },
    flexDirection() {
      return this.direction;
    },
    flexWrap() {
      return this.wrap;
    },
  },
};
</script>

<style scoped>
.el-flex {
  display: flex;
}
</style>
