<template>
  <view class="tree-node">
    <view class="node-row" :class="{ 'is-leaf': !hasChildren }" @click="onClickNode">
      <view class="node-left">
        <text
          v-if="hasChildren"
          class="node-toggle"
          :class="{ rotated: expanded }"
        >▶</text>
        <text v-else class="node-toggle placeholder"></text>

        <text class="node-label">{{ node.dictLabel }}</text>
      </view>

      <view class="node-right">
        <text class="node-count">{{ node.count || 0 }} 题</text>
        <text
          class="node-practice"
          :class="{ disabled: !node.count }"
          @click.stop="onPractice"
        >练习</text>
      </view>
    </view>

    <view v-if="expanded && hasChildren" class="sub-list">
      <CategoryNode
        v-for="child in node.children"
        :key="child.dictValue"
        :node="child"
        :level="level + 1"
      />
    </view>
  </view>
</template>

<script>
export default {
  name: 'CategoryNode',
  props: {
    node: { type: Object, required: true },
    level: { type: Number, default: 1 }
  },
  data() {
    return {
      // 一级默认展开
      expanded: this.level === 1
    }
  },
  computed: {
    hasChildren() {
      return this.node.children && this.node.children.length > 0
    }
  },
  methods: {
    onClickNode() {
      if (this.hasChildren) {
        this.expanded = !this.expanded
      } else {
        this.onPractice()
      }
    },
    onPractice() {
      if (!this.node.count) {
        uni.showToast({ title: '该类型下暂无题目', icon: 'none' })
        return
      }
      // ★ path 是 value 路径，用于抽题
      // ★ labelPath 是 label 路径，用于练习页展示
      const path = this.node.path || ''
      const labelPath = this.node.labelPath || this.node.dictLabel || ''
      uni.navigateTo({
        url: `/pages/practice/practice?mode=1`
          + `&category=${encodeURIComponent(path)}`
          + `&categoryLabel=${encodeURIComponent(labelPath)}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-node {
  background: #fbf7ec;
  border: 2rpx solid #e2d8c0;
  border-radius: 16rpx;
  overflow: hidden;
}

.node-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 24rpx;
  transition: background 0.15s;
}

.node-row:active {
  background: #f6f1e4;
}

.node-row.is-leaf {
  /* 叶子节点也可以考虑视觉微调，保留默认即可 */
}

.node-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.node-toggle {
  font-size: 22rpx;
  color: #b03a2e;
  width: 24rpx;
  text-align: center;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.node-toggle.rotated {
  transform: rotate(90deg);
}

.node-toggle.placeholder {
  visibility: hidden;
}

.node-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #3a322c;
  letter-spacing: 1rpx;
  word-break: break-all;
}

.node-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
}

.node-count {
  font-size: 22rpx;
  color: #8a8278;
}

.node-practice {
  padding: 8rpx 24rpx;
  font-size: 24rpx;
  color: #f6f1e4;
  background: #b03a2e;
  border-radius: 28rpx;
  letter-spacing: 2rpx;
}

.node-practice:active {
  opacity: 0.8;
}

.node-practice.disabled {
  background: #c9bda3;
  pointer-events: none;
}

/* 子节点区 */
.sub-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 16rpx 16rpx 16rpx 48rpx;
  border-top: 1rpx dashed #e2d8c0;
  background: #f6f1e4;
}

.sub-list .tree-node {
  border-left: 4rpx solid #e2d8c0;
}
</style>