<template>
	<view class="history-container">
		<!-- 顶部汇总 -->
		<view class="summary-bar" v-if="list.length">
			<view class="summary-item">
				<text class="summary-num">{{ totalRecords }}</text>
				<text class="summary-label">总练习</text>
			</view>
			<view class="summary-divider"></view>
			<view class="summary-item">
				<text class="summary-num">{{ avgAccuracy }}%</text>
				<text class="summary-label">平均正确率</text>
			</view>
			<view class="summary-divider"></view>
			<view class="summary-item">
				<text class="summary-num">{{ totalQuestions }}</text>
				<text class="summary-label">累计题数</text>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-if="!loading && !list.length" class="empty">
			<text class="empty-icon">📝</text>
			<text class="empty-text">还没有练习记录</text>
			<text class="empty-tip">去刷题，开启你的进步之旅</text>
		</view>

		<!-- 记录列表 -->
		<view v-for="(item, idx) in list" :key="item.id" class="record-card" :class="getAccuracyClass(item.accuracy)"
			@click="goDetail(item)">
			<!-- 左侧色条 -->
			<view class="record-bar"></view>

			<view class="record-body">
				<!-- 第一行：分类 + 时间 -->
				<view class="record-head">
					<view class="record-category">
						<text class="category-icon">📖</text>
						<text class="category-text">{{ formatCategory(item.category) }}</text>
					</view>
					<text class="record-time">{{ formatTime(item.createTime) }}</text>
				</view>

				<!-- 第二行：正确率大字 -->
				<view class="record-main">
					<view class="accuracy-block">
						<text class="accuracy-num" :class="getAccuracyClass(item.accuracy)">
							{{ item.accuracy }}%
						</text>
						<!-- 绿色（≥80%）、金色（60-80%）、红色（<60%），一眼看出成绩 -->
						<text class="accuracy-label">正确率</text>
					</view>

					<view class="stats-block">
						<view class="stat-row">
							<text class="stat-name">答对</text>
							<text class="stat-value">{{ item.correctCount }} / {{ item.totalCount }} 题</text>
						</view>
						<view class="stat-row">
							<text class="stat-name">耗时</text>
							<text class="stat-value">{{ formatDuration(item.totalDuration) }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载/没有更多 -->
		<view v-if="loading" class="loading">
			<text>加载中...</text>
		</view>
		<view v-else-if="noMore && list.length" class="no-more">
			<text>— 没有更多了 —</text>
		</view>
	</view>
</template>

<script>
	import {
		listMyRecords
	} from '@/api/practice'
	import {
		listDict
	} from '@/api/dict'

	export default {
		data() {
			return {
				list: [],
				pageNum: 1,
				pageSize: 10,
				loading: false,
				noMore: false,
				categoryMap: {}
			}
		},
		computed: {
			totalRecords() {
				return this.list.length
			},
			avgAccuracy() {
				if (!this.list.length) return 0
				const sum = this.list.reduce((s, it) => s + (it.accuracy || 0), 0)
				return Math.round(sum / this.list.length)
			},
			totalQuestions() {
				return this.list.reduce((s, it) => s + (it.totalCount || 0), 0)
			}
		},
		async onShow() {
			this.pageNum = 1
			this.noMore = false
			this.list = []
			await this.loadCategoryMap() 
			this.loadData()
		},
		onReachBottom() {
			if (!this.noMore && !this.loading) {
				this.pageNum++
				this.loadData()
			}
		},
		methods: {
			async loadCategoryMap() {
				try {
					// 用 exam_type 字典翻译
					const list = await listDict('exam_type') || []
					const map = {}
					list.forEach(o => {
						map[o.dictValue] = o.dictLabel
					})
					this.categoryMap = map
				} catch (e) {}
			},

			formatCategory(val) {
				return this.categoryMap[val] || val || '综合练习'
			},
			async loadData() {
				if (this.loading) return
				this.loading = true
				try {
					const res = await listMyRecords(this.pageNum, this.pageSize)
					const records = res.records || []
					if (this.pageNum === 1) {
						this.list = records
					} else {
						this.list = this.list.concat(records)
					}
					if (this.list.length >= res.total) {
						this.noMore = true
					}
				} catch (e) {
					// 忽略
				} finally {
					this.loading = false
				}
			},

			/** 根据正确率返回颜色 class */
			getAccuracyClass(accuracy) {
				const a = Number(accuracy) || 0
				if (a >= 80) return 'is-good'
				if (a >= 60) return 'is-ok'
				return 'is-bad'
			},

			/** 格式化时间：只显示 月-日 时:分 */
			formatTime(t) {
				if (!t) return ''
				// 兼容 "2026-09-22 16:22:45" 或 ISO 格式
				const s = String(t).replace('T', ' ')
				const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ ](\d{2}):(\d{2})/)
				if (!m) return s
				const [, , mo, day, hh, mm] = m
				return `${mo}-${day} ${hh}:${mm}`
			},

			/** 格式化耗时 */
			formatDuration(seconds) {
				const s = Number(seconds) || 0
				if (s < 60) return `${s} 秒`
				const m = Math.floor(s / 60)
				const r = s % 60
				return r ? `${m} 分 ${r} 秒` : `${m} 分钟`
			},

			goDetail(item) {
				uni.navigateTo({
					url: `/pages/result/detail?recordId=${item.id}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.history-container {
		min-height: 100vh;
		padding: 30rpx;
		background: #f6f1e4;
		box-sizing: border-box;
	}

	/* ============ 顶部汇总 ============ */
	.summary-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 40rpx;
		background: linear-gradient(135deg, #3a322c 0%, #2a241f 100%);
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 24rpx rgba(58, 50, 44, 0.25);
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.summary-num {
		font-size: 44rpx;
		font-weight: 700;
		color: #f6f1e4;
		letter-spacing: 1rpx;
	}

	.summary-label {
		font-size: 22rpx;
		color: #b3a98f;
		margin-top: 8rpx;
		letter-spacing: 2rpx;
	}

	.summary-divider {
		width: 1rpx;
		height: 60rpx;
		background: rgba(255, 255, 255, 0.15);
	}

	/* ============ 空状态 ============ */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 200rpx 0;
	}

	.empty-icon {
		font-size: 100rpx;
		margin-bottom: 24rpx;
		opacity: 0.5;
	}

	.empty-text {
		font-size: 32rpx;
		color: #3a322c;
		font-weight: 600;
		letter-spacing: 2rpx;
	}

	.empty-tip {
		font-size: 24rpx;
		color: #8a8278;
		margin-top: 16rpx;
		letter-spacing: 1rpx;
	}

	/* ============ 记录卡片 ============ */
	.record-card {
		position: relative;
		display: flex;
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 20rpx;
		margin-bottom: 24rpx;
		overflow: hidden;
		transition: all 0.2s;
	}

	.record-card:active {
		transform: scale(0.99);
		box-shadow: 0 4rpx 12rpx rgba(58, 50, 44, 0.1);
	}

	/* 左侧色条 */
	.record-bar {
		width: 8rpx;
		flex-shrink: 0;
		background: #8a8278;
	}

	.record-card.is-good .record-bar {
		background: linear-gradient(180deg, #4e6e58, #7ba889);
	}

	.record-card.is-ok .record-bar {
		background: linear-gradient(180deg, #b08d3a, #d4b064);
	}

	.record-card.is-bad .record-bar {
		background: linear-gradient(180deg, #b03a2e, #d6655a);
	}

	.record-body {
		flex: 1;
		padding: 24rpx 28rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	/* 头部：分类 + 时间 */
	.record-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.record-category {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.category-icon {
		font-size: 26rpx;
	}

	.category-text {
		font-size: 28rpx;
		font-weight: 700;
		color: #3a322c;
		letter-spacing: 2rpx;
	}

	.record-time {
		font-size: 22rpx;
		color: #8a8278;
		letter-spacing: 1rpx;
	}

	/* 主体：正确率大字 + 统计 */
	.record-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.accuracy-block {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.accuracy-num {
		font-size: 52rpx;
		font-weight: 700;
		letter-spacing: 1rpx;
		line-height: 1;
	}

	.accuracy-num.is-good {
		color: #4e6e58;
	}

	.accuracy-num.is-ok {
		color: #b08d3a;
	}

	.accuracy-num.is-bad {
		color: #b03a2e;
	}

	.accuracy-label {
		font-size: 22rpx;
		color: #8a8278;
		margin-top: 8rpx;
		letter-spacing: 2rpx;
	}

	.stats-block {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		align-items: flex-end;
	}

	.stat-row {
		display: flex;
		align-items: baseline;
		gap: 12rpx;
	}

	.stat-name {
		font-size: 22rpx;
		color: #8a8278;
		letter-spacing: 1rpx;
	}

	.stat-value {
		font-size: 26rpx;
		color: #3a322c;
		font-weight: 600;
	}

	/* ============ 加载/没有更多 ============ */
	.loading,
	.no-more {
		text-align: center;
		font-size: 24rpx;
		color: #8a8278;
		padding: 40rpx 0;
		letter-spacing: 2rpx;
	}
</style>