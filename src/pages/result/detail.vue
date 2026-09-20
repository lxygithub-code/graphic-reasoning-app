<template>
	<view class="detail-container">
		<!-- ① 汇总卡片 -->
		<view class="summary-card">
			<view class="summary-seal">录</view>
			<view class="summary-stat">
				<view class="stat-item">
					<text class="stat-num">{{ data.correctCount }} / {{ data.totalCount }}</text>
					<text class="stat-label">正确题数</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ data.accuracy }}%</text>
					<text class="stat-label">正确率</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ data.totalDuration }}s</text>
					<text class="stat-label">总耗时</text>
				</view>
			</view>
			<view class="summary-time">{{ data.createTime }}</view>
		</view>

		<!-- ② 答题卡 -->
		<view class="answer-sheet">
			<view class="sheet-title">
				<text>答题卡</text>
				<text class="sheet-progress">第 {{ currentIndex + 1 }} / {{ data.items.length }} 题</text>
			</view>
			<view class="sheet-grid">
				<view v-for="(item, idx) in data.items" :key="idx" class="sheet-item" :class="{
            'sheet-correct': item.isCorrect,
            'sheet-wrong': !item.isCorrect,
            'sheet-active': idx === currentIndex
          }" @click="switchQuestion(idx)">{{ idx + 1 }}</view>
			</view>
		</view>

		<!-- ③ 当前题详情 -->
		<view v-if="currentItem" class="question-card" :class="currentItem.isCorrect ? 'card-ok' : 'card-no'">
			<!-- 头部 -->
			<view class="card-head">
				<view class="card-index">
					第 {{ currentIndex + 1 }} 题
					<text class="card-tag" :class="currentItem.isCorrect ? 'tag-ok' : 'tag-no'">
						{{ currentItem.isCorrect ? '✓ 正确' : '✗ 错误' }}
					</text>
				</view>

				<view class="card-head-right">
					<text class="card-time">耗时 {{ currentItem.duration }}s</text>
					<!-- ★ 收藏按钮 -->
					<view class="fav-btn" :class="{ active: isFavorited }" @click="onToggleFavorite">
						<text>{{ isFavorited ? '★' : '☆' }}</text>
					</view>
				</view>
			</view>

			<!-- 题干 -->
			<view class="card-content">{{ currentItem.content }}</view>

			<!-- 题干图片 -->
			<image v-if="currentItem.imageUrl" :src="picUrl(currentItem.imageUrl)" class="card-image" mode="widthFix"
				referrer-policy="no-referrer" @click="previewImage(picUrl(currentItem.imageUrl))" />

			<!-- 选项 -->
			<view class="card-options">
				<view v-for="(opt, oi) in currentItem.options" :key="oi" class="card-option" :class="{
            correct: opt.key === currentItem.correctOption,
            wrong: opt.key === currentItem.userOption && !currentItem.isCorrect
          }">
					<text class="opt-key">{{ opt.key }}.</text>
					<text v-if="opt.type === 'text'" class="opt-text">{{ opt.value }}</text>
					<image v-else :src="picUrl(opt.value)" class="opt-image" mode="widthFix"
						referrer-policy="no-referrer" @click.stop="previewImage(picUrl(opt.value))" />
					<text v-if="opt.key === currentItem.correctOption" class="opt-mark">✓</text>
					<text v-if="opt.key === currentItem.userOption && !currentItem.isCorrect"
						class="opt-mark wrong-mark">✗</text>
				</view>
			</view>

			<!-- 解析（默认解析 + 分平台解析） -->
			<view class="card-analysis">
				<view class="analysis-title">解析</view>

				<!-- 默认解析 -->
				<view v-if="currentItem.analysis" class="analysis-content">{{ currentItem.analysis }}</view>

				<!-- 分平台解析 -->
				<view v-for="(a, ai) in currentItem.analyses || []" :key="ai" class="platform-analysis">
					<view class="platform-tag">{{ platformLabel(a.platform) }}</view>

					<view v-if="a.type !== 'image'" class="platform-content">{{ a.content }}</view>
					<image v-else :src="picUrl(a.content)" class="platform-image" mode="widthFix"
						referrer-policy="no-referrer" @click.stop="previewImage(picUrl(a.content))" />
				</view>

				<view v-if="!currentItem.analysis && (!currentItem.analyses || !currentItem.analyses.length)"
					class="analysis-empty">暂无解析</view>
			</view>

			<!-- 评论 -->
			<view class="card-comments">

				<view class="comments-title">
					精彩评论
					<text class="comments-count">（{{ comments.length }}）</text>
				</view>

				<view v-if="commentLoading" class="comment-loading">加载中...</view>
				<view v-else-if="!comments.length" class="comment-empty">还没有评论~</view>
				<view v-else>
					<view v-for="(c, ci) in comments" :key="ci" class="comment-item">
						<view class="comment-user">{{ c.nickname || '匿名' }}</view>
						<view class="comment-content">{{ c.content }}</view>
					</view>
				</view>

				<!-- 评论输入 -->
				<view class="comment-form">
					<textarea v-model="commentInput" class="comment-textarea" placeholder="分享你的解题思路...（200 字以内）"
						maxlength="200" :disabled="commentSubmitting" auto-height />
					<view class="comment-form-footer">
						<text class="comment-length">{{ commentInput.length }}/200</text>
						<view class="comment-btn" :class="{ disabled: !commentInput.trim() || commentSubmitting }"
							@click="handleComment">{{ commentSubmitting ? '发送中...' : '发表评论' }}</view>
					</view>
				</view>
			</view>
		</view>

		<!-- ④ 上一题 / 下一题 -->
		<view class="nav-btn-row">
			<view class="ink-btn ink-btn-ghost" :class="{ disabled: currentIndex === 0 }" @click="prevQuestion">上一题
			</view>

			<view class="ink-btn" :class="{ disabled: currentIndex >= data.items.length - 1 }" @click="nextQuestion">下一题
			</view>
		</view>

		<view class="bottom-space"></view>
	</view>
</template>

<script>
	import {
		getRecordDetail,
		listComments,
		submitComment
	} from '@/api/practice'
	import {
		picUrl
	} from '@/utils/request'
	import {
		listDict
	} from '@/api/dict'
	import {
		checkFavorite,
		toggleFavorite
	} from '@/api/favorite'
	export default {
		data() {
			return {
				recordId: null,
				data: {
					recordId: null,
					totalCount: 0,
					correctCount: 0,
					accuracy: 0,
					totalDuration: 0,
					createTime: '',
					items: []
				},
				currentIndex: 0,
				comments: [],
				commentLoading: false,
				platformOptions: [],
				commentInput: '',
				commentSubmitting: false,
				isFavorited: false,
			}
		},
		computed: {
			currentItem() {
				return this.data.items[this.currentIndex] || null
			}
		},
		onLoad(options) {
			this.recordId = options.recordId
			this.loadDetail()
			this.loadPlatformOptions()
		},
		methods: {
			picUrl,
			async handleComment() {
				const content = (this.commentInput || '').trim()
				if (!content) {
					uni.showToast({
						title: '请输入评论内容',
						icon: 'none'
					})
					return
				}
				if (content.length < 2) {
					uni.showToast({
						title: '评论太短',
						icon: 'none'
					})
					return
				}

				const item = this.currentItem
				if (!item) return

				this.commentSubmitting = true
				try {
					const vo = await submitComment({
						questionId: item.questionId,
						content
					})

					// 新评论插到列表最前
					this.comments.unshift(vo)
					this.commentInput = ''
					uni.showToast({
						title: '评论成功',
						icon: 'success'
					})
				} catch (e) {
					// request 封装里已 toast 后端返回的 msg
				} finally {
					this.commentSubmitting = false
				}
			},
			async loadDetail() {
			  try {
			    uni.showLoading({ title: '加载中...' })
			    const res = await getRecordDetail(this.recordId)
			    this.data = res || this.data
			    if (this.data.items && this.data.items.length) {
			      this.loadComments(this.data.items[0].questionId)
			      this.loadFavoriteState(this.data.items[0].questionId)   // ★
			    }
			  } catch (e) {
			    uni.showToast({ title: '加载失败', icon: 'none' })
			  } finally {
			    uni.hideLoading()
			  }
			},
			async loadFavoriteState(questionId) {
			  if (!questionId) return
			  try {
			    this.isFavorited = await checkFavorite(questionId)
			  } catch (e) {
			    this.isFavorited = false
			  }
			},
			
			async onToggleFavorite() {
			  const item = this.currentItem
			  if (!item) return
			  try {
			    const res = await toggleFavorite(item.questionId)
			    this.isFavorited = res
			    uni.showToast({ title: res ? '已收藏' : '已取消收藏', icon: 'none' })
			  } catch (e) {}
			},
			
			async loadPlatformOptions() {
				try {
					const list = await listDict('analysis_platform')
					this.platformOptions = list || []
				} catch (e) {}
			},
			platformLabel(val) {
				const item = this.platformOptions.find(o => o.dictValue === val)
				return item ? item.dictLabel : (val || '解析')
			},
			async loadComments(questionId) {
				this.commentLoading = true
				this.comments = []
				try {
					const list = await listComments(questionId, 10)
					this.comments = list || []
				} catch (e) {
					// 忽略
				} finally {
					this.commentLoading = false
				}
			},

			switchQuestion(idx) {
				if (idx === this.currentIndex) return
				this.currentIndex = idx
				this.commentInput = ''
				const item = this.data.items[idx]
				if (item) {
					this.loadComments(item.questionId)
					this.loadFavoriteState(item.questionId)//切换时刷新收藏状态
					// 切换题目时滚动到顶部，方便查看
					uni.pageScrollTo({
						scrollTop: 0,
						duration: 200
					})
				}
			},

			prevQuestion() {
				if (this.currentIndex <= 0) return
				this.switchQuestion(this.currentIndex - 1)
			},

			nextQuestion() {
				if (this.currentIndex >= this.data.items.length - 1) return
				this.switchQuestion(this.currentIndex + 1)
			},

			previewImage(url) {
				if (!url) return
				uni.previewImage({
					urls: [url]
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.card-head-right {
	  display: flex;
	  align-items: center;
	  gap: 16rpx;
	}
	
	.fav-btn {
	  width: 56rpx;
	  height: 56rpx;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  border-radius: 50%;
	  background: #f6f1e4;
	  border: 2rpx solid #e2d8c0;
	  font-size: 32rpx;
	  color: #8a8278;
	  transition: all 0.2s;
	}
	
	.fav-btn.active {
	  color: #e6a23c;
	  border-color: #e6a23c;
	  background: #fff6e6;
	}
	
	.fav-btn:active {
	  transform: scale(0.92);
	}
	
	.detail-container {
		min-height: 100vh;
		padding: 30rpx;
		background: #f6f1e4;
		box-sizing: border-box;
	}

	/* ============ ① 汇总卡片 ============ */
	.summary-card {
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 20rpx;
		padding: 30rpx 24rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.summary-seal {
		width: 80rpx;
		height: 80rpx;
		border: 3rpx solid #b03a2e;
		border-radius: 12rpx;
		color: #b03a2e;
		font-size: 40rpx;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(-6deg);
		margin-bottom: 20rpx;
	}

	.summary-stat {
		display: flex;
		justify-content: space-around;
		width: 100%;
		margin-bottom: 16rpx;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-num {
		font-size: 36rpx;
		color: #3a322c;
		font-weight: 700;
	}

	.stat-label {
		font-size: 22rpx;
		color: #8a8278;
		margin-top: 6rpx;
	}

	.summary-time {
		font-size: 22rpx;
		color: #8a8278;
	}

	/* ============ ② 答题卡 ============ */
	.answer-sheet {
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
	}

	.sheet-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 28rpx;
		color: #3a322c;
		font-weight: 700;
		letter-spacing: 2rpx;
		margin-bottom: 20rpx;
	}

	.sheet-progress {
		font-size: 24rpx;
		color: #8a8278;
		font-weight: 400;
	}

	.sheet-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.sheet-item {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 700;
		border-radius: 12rpx;
		background: #f6f1e4;
		color: #8a8278;
		border: 2rpx solid transparent;
		transition: all 0.2s;
	}

	.sheet-correct {
		background: #eef5ee;
		color: #4e6e58;
		border-color: #c4d6c8;
	}

	.sheet-wrong {
		background: #f9e8e4;
		color: #b03a2e;
		border-color: #e8c0b8;
	}

	.sheet-active {
		border-color: #3a322c !important;
		transform: scale(1.08);
		box-shadow: 0 4rpx 12rpx rgba(58, 50, 44, 0.2);
	}

	/* ============ ③ 当前题详情 ============ */
	.question-card {
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 30rpx;
	}

	.card-ok {
		border-left: 6rpx solid #4e6e58;
	}

	.card-no {
		border-left: 6rpx solid #b03a2e;
	}

	.card-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.card-index {
		font-size: 26rpx;
		color: #3a322c;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.card-tag {
		font-size: 22rpx;
		font-weight: 700;
	}

	.tag-ok {
		color: #4e6e58;
	}

	.tag-no {
		color: #b03a2e;
	}

	.card-time {
		font-size: 22rpx;
		color: #8a8278;
	}

	.card-content {
		font-size: 28rpx;
		color: #3a322c;
		line-height: 1.7;
		margin-bottom: 16rpx;
	}

	.card-image {
		width: 100%;
		margin-bottom: 16rpx;
		border-radius: 8rpx;
		background: #fff;
	}

	/* 选项 */
	.card-options {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.card-option {
		display: flex;
		align-items: center;
		padding: 14rpx 18rpx;
		background: #f6f1e4;
		border-radius: 10rpx;
		font-size: 26rpx;
	}

	.card-option.correct {
		background: #eef5ee;
		border: 1rpx solid #4e6e58;
	}

	.card-option.wrong {
		background: #f9e8e4;
		border: 1rpx solid #b03a2e;
	}

	.opt-key {
		font-weight: 700;
		margin-right: 10rpx;
		color: #3a322c;
		flex-shrink: 0;
	}

	.opt-text {
		flex: 1;
		color: #4a4238;
		line-height: 1.6;
	}

	.opt-image {
		flex: 1;
		max-width: 320rpx;
		border-radius: 6rpx;
	}

	.opt-mark {
		color: #4e6e58;
		font-weight: 700;
		margin-left: 10rpx;
	}

	.wrong-mark {
		color: #b03a2e;
	}

	/* 解析 */
	.card-analysis {
		margin-top: 20rpx;
		padding: 20rpx;
		background: #f4ecdc;
		border-radius: 10rpx;
	}

	.analysis-title {
		font-size: 26rpx;
		font-weight: 700;
		color: #3a322c;
		margin-bottom: 12rpx;
		letter-spacing: 2rpx;
	}

	.analysis-content {
		font-size: 26rpx;
		color: #5c5348;
		line-height: 1.7;
		white-space: pre-wrap;
	}

	.analysis-empty {
		font-size: 24rpx;
		color: #8a8278;
	}

	.platform-analysis {
		margin-top: 16rpx;
		padding: 16rpx;
		background: #fbf7ec;
		border-radius: 10rpx;
	}

	.platform-tag {
		display: inline-block;
		padding: 2rpx 12rpx;
		font-size: 22rpx;
		color: #b03a2e;
		background: #fff;
		border: 1rpx solid #b03a2e;
		border-radius: 16rpx;
		margin-bottom: 8rpx;
	}

	.platform-content {
		font-size: 26rpx;
		color: #5c5348;
		line-height: 1.7;
		white-space: pre-wrap;
	}

	.platform-image {
		width: 100%;
		margin-top: 8rpx;
		border-radius: 8rpx;
		background: #fff;
	}

	/* 评论 */
	.card-comments {
		margin-top: 20rpx;
		padding: 20rpx;
		background: #fbf7ec;
		border-radius: 10rpx;
		border: 1rpx solid #e2d8c0;
	}

	.comments-title {
		font-size: 26rpx;
		font-weight: 700;
		color: #3a322c;
		margin-bottom: 16rpx;
		letter-spacing: 2rpx;
	}

	.comments-count {
		font-size: 22rpx;
		color: #8a8278;
		font-weight: 400;
	}

	.comment-loading,
	.comment-empty {
		font-size: 24rpx;
		color: #8a8278;
		text-align: center;
		padding: 20rpx 0;
	}

	.comment-item {
		padding: 16rpx 0;
		border-bottom: 1rpx dashed #e2d8c0;
	}

	.comment-item:last-child {
		border-bottom: none;
	}

	.comment-user {
		font-size: 24rpx;
		color: #8a8278;
		margin-bottom: 6rpx;
	}

	.comment-content {
		font-size: 28rpx;
		color: #5c5348;
		line-height: 1.6;
		word-break: break-all;
	}

	/* ============ ④ 上一题/下一题 ============ */
	.nav-btn-row {
		display: flex;
		justify-content: space-between;
		gap: 24rpx;
	}

	.ink-btn {
		flex: 1;
		padding: 20rpx 0;
		border-radius: 44rpx;
		background: #3a322c;
		color: #f6f1e4;
		font-size: 28rpx;
		letter-spacing: 2rpx;
		text-align: center;
		box-shadow: 0 6rpx 14rpx rgba(58, 50, 44, 0.2);
	}

	.ink-btn:active {
		opacity: 0.85;
	}

	.ink-btn-ghost {
		background: transparent;
		color: #3a322c;
		border: 2rpx solid #3a322c;
		box-shadow: none;
	}

	.ink-btn.disabled {
		opacity: 0.35;
		pointer-events: none;
	}

	.bottom-space {
		height: 60rpx;
	}

	/* 评论输入 */
	.comment-form {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx dashed #e2d8c0;
		/* ★ 加个分隔线 */
		background: transparent;
		/* 去掉原背景，跟卡片融合 */
	}

	.comment-textarea {
		width: 100%;
		min-height: 120rpx;
		padding: 16rpx;
		font-size: 28rpx;
		color: #3a322c;
		background: #fbf7ec;
		border-radius: 10rpx;
		box-sizing: border-box;
		line-height: 1.6;
	}

	.comment-form-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 16rpx;
	}

	.comment-length {
		font-size: 22rpx;
		color: #8a8278;
	}

	.comment-btn {
		padding: 12rpx 32rpx;
		background: #b03a2e;
		color: #f6f1e4;
		font-size: 26rpx;
		border-radius: 32rpx;
		letter-spacing: 2rpx;
	}

	.comment-btn.disabled {
		opacity: 0.5;
		pointer-events: none;
	}
</style>