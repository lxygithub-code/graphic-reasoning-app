<template>
	<view class="practice-container">
		<!-- 组卷面板 -->
		<view v-if="!started" class="start-panel">
			<!-- 模式切换 tab -->
			<view class="mode-switch">
				<view class="mode-tab" :class="{ active: mode === 0 }" @click="switchMode(0)">
					<text class="tab-title">刷题模式</text>
					<text class="tab-desc">整组提交核分</text>
				</view>
				<view class="mode-tab" :class="{ active: mode === 1 }" @click="switchMode(1)">
					<text class="tab-title">背题模式</text>
					<text class="tab-desc">每题立即核对</text>
				</view>
			</view>
			<!-- ★ 事业单位子类选择 -->
			<view v-if="examType === 'shiye'" class="exam-sub-wrap">
				<view class="exam-sub-title">事业单位类别</view>
				<view class="exam-sub-options">
					<view v-for="item in examSubOptions" :key="item.dictValue" class="exam-sub-item"
						:class="{ active: examSubType === item.dictValue }" @click="examSubType = item.dictValue">
						{{ item.dictLabel }}
					</view>
				</view>
				<view class="exam-sub-tip">
					{{ examSubType ? '当前：' + examSubType + '类' : '不选则抽所有类别' }}
				</view>
			</view>
			<!-- 组卷题数 -->
			<view class="start-subtitle">
				{{ mode === 0 ? '选择本次组卷题数（1–15 题）' : '选择本次背题题数（5–30 题）' }}
			</view>
			<view class="slider-wrap">
				<slider v-if="mode === 0" :min="1" :max="15" :value="brushSize" activeColor="#b03a2e"
					backgroundColor="#e6ddc9" block-size="24" show-value @changing="onBrushSizeChange"
					@change="onBrushSizeChange" />
				<slider v-else :min="5" :max="30" :value="reciteSize" activeColor="#b03a2e" backgroundColor="#e6ddc9"
					block-size="24" show-value @changing="onReciteSizeChange" @change="onReciteSizeChange" />
			</view>
			<view class="pack-tip">共 {{ mode === 0 ? brushSize : reciteSize }} 题</view>

			<!-- 权重设置 -->
			<view class="weight-title">题目抽取权重（三者之和 100%）</view>
			<view class="weight-item">
				<text class="weight-label">未答</text>
				<slider :min="0" :max="100" :value="weightUnknown" activeColor="#3a322c" backgroundColor="#e6ddc9"
					block-size="20" show-value @changing="onWeightChange('unknown', $event)"
					@change="onWeightChange('unknown', $event)" />
			</view>
			<view class="weight-item">
				<text class="weight-label">已答对</text>
				<slider :min="0" :max="100" :value="weightCorrect" activeColor="#4e6e58" backgroundColor="#e6ddc9"
					block-size="20" show-value @changing="onWeightChange('correct', $event)"
					@change="onWeightChange('correct', $event)" />
			</view>
			<view class="weight-item">
				<text class="weight-label">已答错</text>
				<slider :min="0" :max="100" :value="weightWrong" activeColor="#b03a2e" backgroundColor="#e6ddc9"
					block-size="20" show-value @changing="onWeightChange('wrong', $event)"
					@change="onWeightChange('wrong', $event)" />
			</view>
			<view class="weight-sum" :class="{ error: weightSum !== 100 }">
				当前合计：{{ weightSum }}%
			</view>

			<view class="ink-btn ink-btn-primary start-btn" @click="startPractice">
				{{ mode === 0 ? '开始刷题' : '开始背题' }}
			</view>
		</view>

		<!-- 答题中 / 完成 -->
		<template v-else>
			<!-- 顶部：模式 + 计时 -->
			<view class="top-bar">
				<view class="mode-tag" :class="mode === 0 ? 'tag-brush' : 'tag-recite'">
					{{ mode === 0 ? '刷题模式' : '背题模式' }}
				</view>
				<text class="time-tag" :class="{ 'time-frozen': mode === 1 && showFeedback }">
					本题已用 {{ currentTimeUsed }}s
					<text v-if="mode === 1 && showFeedback">（已作答）</text>
				</text>
			</view>

			<!-- 进度条 -->
			<u-line-progress :percent="progress" activeColor="#3a322c" inactiveColor="#e6ddc9"
				:height="10"></u-line-progress>

			<!-- 答题区 -->
			<view class="question-area" v-if="!isFinished">

				<!-- 题号 + 收藏 同一行 -->
				<view class="question-header">
					<view class="question-number">
						第 {{ currentIndex + 1 }} / {{ questions.length }} 题
					</view>
					<view class="fav-btn" @click="onToggleFavorite">
						<text>{{ isFavorited ? '★' : '☆' }}</text>
						<text class="fav-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
					</view>
				</view>

				<!-- 题干 -->
				<view class="question-content">{{ currentQuestion.content }}</view>

				<!-- 题干图片 -->
				<image v-if="currentQuestion.imageUrl" :src="picUrl(currentQuestion.imageUrl)" class="question-image"
					mode="widthFix" referrer-policy="no-referrer"
					@click="previewImage(picUrl(currentQuestion.imageUrl))" />

				<!-- 选项 -->
				<view class="option-list">
					<view v-for="(opt, idx) in options" :key="idx" class="option-item" :class="{
              active: selected === opt.key,
              disabled: mode === 1 && showFeedback,
              correct: mode === 1 && showFeedback && opt.key === feedback.correctOption,
              wrong: mode === 1 && showFeedback && opt.key === selected && !feedback.isCorrect
            }" @click="onSelect(opt.key)">
						<view class="option-key">{{ opt.key }}.</view>
						<text v-if="opt.type === 'text'" class="option-text">{{ opt.value }}</text>
						<image v-else :src="picUrl(opt.value)" class="option-image" mode="widthFix"
							referrer-policy="no-referrer" @click.stop="previewImage(picUrl(opt.value))" />
					</view>
				</view>

				<!-- 背题模式：反馈 -->
				<view v-if="mode === 1 && showFeedback" class="feedback">
					<view class="feedback-head">
						<text class="feedback-tag" :class="feedback.isCorrect ? 'tag-ok' : 'tag-no'">
							{{ feedback.isCorrect ? '✓ 回答正确' : '✗ 回答错误' }}
						</text>
						<text class="correct-answer">正确答案：{{ feedback.correctOption }}</text>
					</view>

					<view class="source-line">
						<text class="source-label">来源</text>
						<text class="source-value">{{ currentQuestion.source || '未标注' }}</text>
					</view>

					<view class="analysis">
						<view class="analysis-title">解析</view>

						<!-- 默认解析（如果没有分平台解析时展示） -->
						<view v-if="!feedback.analyses || !feedback.analyses.length" class="analysis-content">
							{{ feedback.analysis || '暂无解析' }}
						</view>

						<!-- 分平台解析 -->
						<view v-for="(a, i) in feedback.analyses || []" :key="i" class="platform-analysis">
							<view class="platform-tag">{{ platformLabel(a.platform) }}</view>

							<!-- 文字解析 -->
							<view v-if="a.type !== 'image'" class="platform-content">{{ a.content }}</view>

							<!-- 图片解析 -->
							<image v-else :src="picUrl(a.content)" class="platform-image" mode="widthFix"
								referrer-policy="no-referrer" @click="previewImage(picUrl(a.content))" />
						</view>
					</view>

					<!-- 评论列表 -->
					<view class="comments">
						<view class="comments-title">
							精彩评论
							<text class="comment-count">
								（{{ feedback.comments ? feedback.comments.length : 0 }}）
							</text>
						</view>

						<view v-if="!feedback.comments || !feedback.comments.length" class="comment-empty">
							还没有评论，来说两句吧~
						</view>

						<view v-for="(c, i) in feedback.comments" :key="i" class="comment-item">
							<view class="comment-user">{{ c.nickname || '匿名' }}</view>
							<view class="comment-content">{{ c.content }}</view>
						</view>
					</view>

					<!-- 评论输入 -->
					<view v-if="feedback.canComment === 1" class="comment-form">
						<textarea v-model="commentInput" class="comment-textarea" placeholder="分享你的解题思路...（200 字以内）"
							maxlength="200" :disabled="commentSubmitting" auto-height />
						<view class="comment-form-footer">
							<text class="comment-length">{{ commentInput.length }}/200</text>
							<view class="comment-btn" :class="{ disabled: !commentInput.trim() || commentSubmitting }"
								@click="handleComment">
								{{ commentSubmitting ? '发送中...' : '发表评论' }}
							</view>
						</view>
					</view>
					<view v-else class="comment-disabled-tip">
						<text>您的评论权限已被关闭，如需开启请联系管理员</text>
					</view>
				</view>

				<!-- 上一题 / 下一题 -->
				<view class="nav-btn-row">
					<view class="ink-btn ink-btn-ghost" :class="{ disabled: currentIndex === 0 }" @click="prevQuestion">
						上一题</view>

					<view class="ink-btn" :class="{ 'ink-btn-primary': isLastQuestion && mode === 0 }"
						@click="nextQuestion">
						{{ isLastQuestion ? '完成' : '下一题' }}
					</view>
				</view>
			</view>

			<!-- 完成 -->
			<view v-else class="finish-area">
				<view class="finish-seal">完</view>
				<text class="finish-text">练习完成！</text>

				<view class="finish-stat">
					<text class="stat-line">共 {{ questions.length }} 题</text>
					<text class="stat-line">总耗时 {{ totalTimeUsed }} 秒</text>
				</view>

				<view v-if="mode === 0">
					<view class="ink-btn ink-btn-primary" @click="submitExam">交卷并查看结果</view>
				</view>
				<view v-else>
					<view class="ink-btn" @click="goHome">返回</view>
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	import request from '@/utils/request'
	import {
		submitComment
	} from '@/api/practice'
	import {
		safeBack
	} from '@/utils/nav'
	import {
		toggleFavorite,
		checkFavorite
	} from '@/api/favorite'
	const EXAMTYPE_TITLES = {
		guokao: '国考专题',
		shengkao: '省考专题',
		shiye: '事业编专题',
		custom: '自定义刷题'
	}

	export default {
		data() {
			return {
				started: false,
				mode: 0, // 0=刷题，1=背题
				examType: 'custom',
				examSubType: '',
				examSubOptions: [],
				// 两种模式各自的组卷题数
				brushSize: 10, // 刷题模式：1–15
				reciteSize: 20, // 背题模式：5–30
				// 权重
				weightUnknown: 60,
				weightCorrect: 20,
				weightWrong: 20,
				platformOptions: [],
				questions: [],
				currentIndex: 0,
				selected: '',
				isFinished: false,
				showFeedback: false,
				feedback: {
					isCorrect: false,
					correctOption: '',
					analysis: '',
					analyses: [],
					comments: [],
					canComment: 1
				},

				// 答题记录：{ [questionId]: { questionId, userAnswer, timeSpent, isCorrect, correctOption, feedback } }
				answersMap: {},
				// 当前这道题的计时起点（毫秒时间戳）
				currentTickStart: null,
				// UI 计时（仅用于展示）
				currentTimeUsed: 0,
				uiTimerId: null,

				// 评论
				commentInput: '',
				commentSubmitting: false,

				submitLoading: false,
				isFavorited: false
			}
		},

		onLoad(options) {
			this.mode = parseInt(options.mode) || 0
			this.examType = options.examType || 'custom'
			const title = EXAMTYPE_TITLES[this.examType] || '练习'
			uni.setNavigationBarTitle({
				title
			})
			this.loadPlatformOptions()
			this.loadExamSubOptions()
		},

		onUnload() {
			this.leaveQuestion()
		},

		computed: {
			weightSum() {
				return this.weightUnknown + this.weightCorrect + this.weightWrong
			},
			currentQuestion() {
				return this.questions[this.currentIndex] || {}
			},
			options() {
				const q = this.currentQuestion
				if (!q || !q.options) return []
				return q.options.map((o) => ({
					key: o.key,
					type: o.type || 'text',
					value: o.value
				}))
			},
			progress() {
				return this.questions.length ?
					((this.currentIndex + 1) / this.questions.length) * 100 :
					0
			},
			isLastQuestion() {
				return this.currentIndex === this.questions.length - 1
			},
			totalTimeUsed() {
				return Object.values(this.answersMap).reduce(
					(sum, a) => sum + (a.timeSpent || 0),
					0
				)
			}
		},

		methods: {
			/** ★ 加载事业单位子类（如果当前是 shiye） */
			async loadExamSubOptions() {
				if (this.examType !== 'shiye') return
				try {
					// 用 treeDict 拿树
					const tree = await request({
						url: '/api/dict/tree',
						method: 'GET',
						data: {
							dictType: 'exam_type'
						}
					})
					const shiyeNode = (tree || []).find(n => n.dictValue === 'shiye')
					this.examSubOptions = shiyeNode?.children || []
				} catch (e) {
					console.warn('加载事业单位子类失败', e)
				}
			},
			async loadFavoriteState() {
				const qid = this.currentQuestion?.id
				if (!qid) return
				try {
					this.isFavorited = await checkFavorite(qid)
				} catch (e) {
					this.isFavorited = false
				}
			},
			async onToggleFavorite() {
				const qid = this.currentQuestion?.id
				if (!qid) return
				try {
					const res = await toggleFavorite(qid)
					this.isFavorited = res
					uni.showToast({
						title: res ? '已收藏' : '已取消收藏',
						icon: 'none'
					})
				} catch (e) {}
			},
			async loadPlatformOptions() {
				try {
					const list = await request({
						url: '/api/dict/list',
						data: {
							dictType: 'analysis_platform'
						}
					})
					this.platformOptions = list || []
				} catch (e) {
					console.warn('加载平台字典失败', e)
				}
			},

			platformLabel(val) {
				const item = this.platformOptions.find(o => o.dictValue === val)
				return item ? item.dictLabel : (val || '解析')
			},
			// ==================== 权重联动 ====================
			onWeightChange(type, e) {
				const val = e.detail.value
				if (type === 'unknown') this.weightUnknown = val
				else if (type === 'correct') this.weightCorrect = val
				else this.weightWrong = val

				const rest = 100 - val
				let a, b
				if (type === 'unknown') {
					a = this.weightCorrect
					b = this.weightWrong
				} else if (type === 'correct') {
					a = this.weightUnknown
					b = this.weightWrong
				} else {
					a = this.weightUnknown
					b = this.weightCorrect
				}
				const sum = a + b
				let newA, newB
				if (sum === 0) {
					newA = Math.round(rest / 2)
					newB = rest - newA
				} else {
					newA = Math.round((rest * a) / sum)
					newB = rest - newA
				}

				if (type === 'unknown') {
					this.weightCorrect = newA
					this.weightWrong = newB
				} else if (type === 'correct') {
					this.weightUnknown = newA
					this.weightWrong = newB
				} else {
					this.weightUnknown = newA
					this.weightCorrect = newB
				}
			},

			// ==================== 组卷面板 ====================
			switchMode(newMode) {
				if (this.mode === newMode) return
				this.mode = newMode
			},
			onBrushSizeChange(e) {
				this.brushSize = e.detail.value
			},
			onReciteSizeChange(e) {
				this.reciteSize = e.detail.value
			},

			// ==================== 开始练习 ====================
			async startPractice() {
				const count = this.mode === 0 ? this.brushSize : this.reciteSize
				if (this.weightSum !== 100) {
					uni.showToast({
						title: '权重之和必须为100%',
						icon: 'none'
					})
					return
				}
				try {
					uni.showLoading({
						title: '加载中...'
					})
					const data = await request({
						url: '/api/question/random',
						method: 'POST',
						data: {
							count,
							examType: this.examType,
							examSubType: this.examSubType || undefined,
							weightUnknown: this.weightUnknown,
							weightCorrect: this.weightCorrect,
							weightWrong: this.weightWrong
						}
					})
					if (!data || data.length === 0) {
						uni.showToast({
							title: '暂无题目',
							icon: 'none'
						})
						return
					}
					this.questions = data
					this.currentIndex = 0
					this.isFinished = false
					this.answersMap = {}
					this.selected = ''
					this.showFeedback = false
					this.commentInput = ''
					this.feedback = {
						isCorrect: false,
						correctOption: '',
						analysis: '',
						comments: [],
						canComment: 1
					}
					this.started = true

					this.$nextTick(() => {
						this.enterQuestion()
					})
				} finally {
					uni.hideLoading()
				}
			},

			// ==================== 计时 ====================
			enterQuestion() {
				const qid = this.currentQuestion?.id
				if (!qid) return

				const rec = this.answersMap[qid]

				// 背题模式下，已核对过的题不再计时（显示已用时间即可）
				if (this.mode === 1 && rec && rec.feedback) {
					this.currentTickStart = null
					this.currentTimeUsed = rec.timeSpent || 0
					this.stopUiTimer()
					return
				}

				// 未核对 / 刷题模式：正常开始/继续计时
				this.currentTickStart = Date.now()
				const r = this.ensureAnswer(qid)
				this.currentTimeUsed = r.timeSpent || 0
				this.startUiTimer()
				this.loadFavoriteState()
			},

			leaveQuestion() {
				const qid = this.currentQuestion?.id
				if (!qid || !this.currentTickStart) return
				const elapsed = Math.floor((Date.now() - this.currentTickStart) / 1000)
				if (elapsed > 0) {
					const rec = this.ensureAnswer(qid)
					rec.timeSpent += elapsed
				}
				this.currentTickStart = null
				this.stopUiTimer()
			},

			startUiTimer() {
				this.stopUiTimer()
				this.uiTimerId = setInterval(() => {
					if (!this.currentTickStart) return
					const qid = this.currentQuestion?.id
					if (!qid) return
					const base = this.answersMap[qid]?.timeSpent || 0
					this.currentTimeUsed =
						base + Math.floor((Date.now() - this.currentTickStart) / 1000)
				}, 1000)
			},
			stopUiTimer() {
				if (this.uiTimerId) {
					clearInterval(this.uiTimerId)
					this.uiTimerId = null
				}
			},

			ensureAnswer(qid) {
				if (!this.answersMap[qid]) {
					this.answersMap[qid] = {
						questionId: qid,
						userAnswer: '',
						timeSpent: 0,
						isCorrect: null,
						correctOption: '',
						feedback: null
					}
				}
				return this.answersMap[qid]
			},

			// ==================== 选项 ====================
			async onSelect(key) {
				if (this.mode === 1 && this.showFeedback) return // 已核对不可改

				const qid = this.currentQuestion.id
				this.selected = key
				this.ensureAnswer(qid).userAnswer = key

				if (this.mode === 1) {
					await this.checkAnswer(key)
				}
			},

			// ==================== 背题模式：立即核对 ====================
			async checkAnswer(userAnswer) {
				// 先把当前停留时间累加
				this.leaveQuestion()

				const qid = this.currentQuestion.id
				const rec = this.ensureAnswer(qid)

				try {
					uni.showLoading({
						title: '核对中...',
						mask: true
					})
					const res = await request({
						url: '/api/practice/submit-single',
						method: 'POST',
						data: {
							questionId: qid,
							userAnswer,
							timeSpent: rec.timeSpent,
							practiceMode: 1
						}
					})

					const fb = {
						isCorrect: res.isCorrect,
						correctOption: res.correctOption || '',
						analysis: res.analysis || '暂无解析',
						analyses: res.analyses || [],
						comments: res.comments || [],
						canComment: res.canComment !== undefined ? res.canComment : 1
					}
					rec.isCorrect = res.isCorrect
					rec.correctOption = res.correctOption
					rec.feedback = fb

					this.feedback = fb
					this.showFeedback = true
				} catch (e) {
					uni.showToast({
						title: '核对失败，请重试',
						icon: 'none'
					})
					// 核对失败：恢复计时，让用户可以重试
					this.enterQuestion()
				} finally {
					uni.hideLoading()
				}
			},

			// ==================== 评论 ====================
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

				this.commentSubmitting = true
				try {
					const vo = await submitComment({
						questionId: this.currentQuestion.id,
						content
					})

					if (!this.feedback.comments) this.feedback.comments = []
					this.feedback.comments.unshift(vo)

					// 同步到 answersMap，切题回来能看到
					const rec = this.answersMap[this.currentQuestion.id]
					if (rec && rec.feedback) {
						rec.feedback.comments = this.feedback.comments
					}

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

			// ==================== 切题 ====================
			prevQuestion() {
				if (this.currentIndex <= 0) return
				this.switchQuestion(this.currentIndex - 1)
			},

			nextQuestion() {
				if (this.currentIndex >= this.questions.length - 1) {
					this.finishPractice()
					return
				}
				this.switchQuestion(this.currentIndex + 1)
			},

			switchQuestion(newIndex) {
				this.leaveQuestion()
				this.currentIndex = newIndex
				this.commentInput = '' // ★ 切题时清空评论输入
				this.restoreQuestionState()
				this.enterQuestion()
			},

			restoreQuestionState() {
				const qid = this.currentQuestion?.id
				const rec = this.answersMap[qid]
				this.selected = rec?.userAnswer || ''
				if (rec?.feedback) {
					this.feedback = {
						...rec.feedback
					}
					this.showFeedback = true
				} else {
					this.feedback = {
						isCorrect: false,
						correctOption: '',
						analysis: '',
						analyses: [],
						comments: [],
						canComment: 1
					}
					this.showFeedback = false
				}
			},

			finishPractice() {
				this.leaveQuestion()
				this.isFinished = true
			},

			// ==================== 交卷 ====================
			async submitExam() {
				if (this.submitLoading) return

				// 确保最后一题的停留时间被记录
				this.leaveQuestion()

				this.submitLoading = true
				uni.showLoading({
					title: '提交中...'
				})

				try {
					const answers = this.questions.map((q) => {
						const rec = this.answersMap[q.id] || {}
						return {
							questionId: q.id,
							userAnswer: rec.userAnswer || '',
							timeSpent: rec.timeSpent || 0
						}
					})

					const res = await request({
						url: '/api/practice/submit-exam',
						method: 'POST',
						data: {
							examType: this.examType,
							questionIds: this.questions.map((q) => q.id),
							totalTime: this.totalTimeUsed,
							answers
						}
					})

					uni.hideLoading()
					uni.redirectTo({
						url: `/pages/result/result?recordId=${res.recordId}&correct=${res.correctCount}&total=${res.totalCount}&accuracy=${res.accuracy}&time=${res.totalTime}`
					})
				} catch (e) {
					uni.hideLoading()
					uni.showToast({
						title: '提交失败，请重试',
						icon: 'none'
					})
				} finally {
					this.submitLoading = false
				}
			},

			goHome() {
				safeBack();
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
	.exam-sub-wrap {
		width: 100%;
		margin-bottom: 40rpx;
		padding: 24rpx;
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 16rpx;
	}

	.exam-sub-title {
		font-size: 26rpx;
		color: #3a322c;
		font-weight: 700;
		letter-spacing: 2rpx;
		margin-bottom: 16rpx;
	}

	.exam-sub-options {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.exam-sub-item {
		min-width: 96rpx;
		padding: 16rpx 28rpx;
		text-align: center;
		font-size: 28rpx;
		color: #3a322c;
		background: #f6f1e4;
		border: 2rpx solid #e2d8c0;
		border-radius: 32rpx;
		transition: all 0.2s;
	}

	.exam-sub-item.active {
		background: #b03a2e;
		color: #f6f1e4;
		border-color: #b03a2e;
		font-weight: 600;
	}

	.exam-sub-tip {
		margin-top: 16rpx;
		font-size: 22rpx;
		color: #8a8278;
		letter-spacing: 1rpx;
	}

	.practice-container {
		min-height: 100vh;
		padding: 30rpx;
		background: #f6f1e4;
		box-sizing: border-box;
	}

	/* ==================== 组卷面板 ==================== */
	.start-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 40rpx 60rpx;
	}

	.mode-switch {
		display: flex;
		gap: 20rpx;
		width: 100%;
		margin-bottom: 60rpx;
	}

	.mode-tab {
		flex: 1;
		padding: 24rpx 24rpx;
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 16rpx;
		text-align: center;
		transition: all 0.2s;
	}

	.mode-tab.active {
		background: #3a322c;
		border-color: #3a322c;
	}

	.mode-tab .tab-title {
		display: block;
		font-size: 30rpx;
		font-weight: 700;
		color: #3a322c;
		letter-spacing: 2rpx;
	}

	.mode-tab.active .tab-title {
		color: #f6f1e4;
	}

	.mode-tab .tab-desc {
		display: block;
		font-size: 22rpx;
		color: #8a8278;
		margin-top: 6rpx;
	}

	.mode-tab.active .tab-desc {
		color: #d9cfb8;
	}

	.start-subtitle {
		font-size: 28rpx;
		color: #8a8278;
		letter-spacing: 2rpx;
		margin-bottom: 40rpx;
	}

	.slider-wrap {
		width: 100%;
		padding: 0 20rpx;
		margin-bottom: 20rpx;
	}

	.pack-tip {
		font-size: 32rpx;
		color: #b03a2e;
		font-weight: 700;
		letter-spacing: 2rpx;
		margin-bottom: 60rpx;
	}

	.start-btn {
		width: 360rpx !important;
		flex: none !important;
		padding: 24rpx 0 !important;
		margin-top: 0;
	}

	/* 权重 */
	.weight-title {
		width: 100%;
		text-align: left;
		font-size: 26rpx;
		color: #3a322c;
		font-weight: 700;
		letter-spacing: 2rpx;
		margin: 20rpx 0 16rpx;
	}

	.weight-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 8rpx;
	}

	.weight-label {
		font-size: 26rpx;
		color: #5c5348;
		width: 100rpx;
		flex-shrink: 0;
	}

	.weight-item slider {
		flex: 1;
		margin: 0 8rpx;
	}

	.weight-sum {
		font-size: 26rpx;
		color: #4e6e58;
		margin-top: 12rpx;
		margin-bottom: 40rpx;
	}

	.weight-sum.error {
		color: #b03a2e;
	}

	/* ==================== 顶部 ==================== */
	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.mode-tag {
		font-size: 24rpx;
		padding: 6rpx 18rpx;
		border-radius: 24rpx;
		letter-spacing: 2rpx;
		font-weight: 600;
	}

	.tag-brush {
		background: #3a322c;
		color: #f6f1e4;
	}

	.tag-recite {
		background: #b03a2e;
		color: #f6f1e4;
	}

	.time-tag {
		font-size: 22rpx;
		color: #b03a2e;
		background: #f4e6e2;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}

	.time-frozen {
		color: #4e6e58 !important;
		background: #eef5ee !important;
	}

	/* ==================== 题目区 ==================== */
	.question-area {
		margin-top: 40rpx;
	}

	.question-number {
		font-size: 26rpx;
		color: #8a8278;
		letter-spacing: 2rpx;
	}

	.question-content {
		font-size: 34rpx;
		color: #3a322c;
		line-height: 1.7;
		margin: 20rpx 0 30rpx;
		padding: 24rpx;
		background: #fbf7ec;
		border: 1rpx solid #e2d8c0;
		border-radius: 16rpx;
	}

	.question-image {
		width: 100%;
		margin: 0 0 30rpx;
		border-radius: 12rpx;
		background: #fff;
	}

	/* ==================== 选项 ==================== */
	.option-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.option-item {
		display: flex;
		align-items: center;
		padding: 24rpx 28rpx;
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 16rpx;
		transition: all 0.2s;
	}

	.option-item.active {
		background: #f0e8d8;
		border-color: #b03a2e;
	}

	.option-item.disabled {
		opacity: 0.9;
	}

	.option-item.correct {
		background: #eef5ee;
		border-color: #4e6e58;
	}

	.option-item.wrong {
		background: #f9e8e4;
		border-color: #b03a2e;
	}

	.option-key {
		font-weight: 700;
		color: #3a322c;
		margin-right: 12rpx;
		flex-shrink: 0;
	}

	.option-text {
		flex: 1;
		font-size: 30rpx;
		color: #4a4238;
		line-height: 1.6;
	}

	.option-image {
		flex: 1;
		max-width: 400rpx;
		border-radius: 8rpx;
	}

	/* ==================== 反馈 ==================== */
	.feedback {
		margin-top: 30rpx;
	}

	.feedback-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.feedback-tag {
		font-size: 30rpx;
		font-weight: 700;
		letter-spacing: 2rpx;
	}

	.tag-ok {
		color: #4e6e58;
	}

	.tag-no {
		color: #b03a2e;
	}

	.correct-answer {
		font-size: 26rpx;
		color: #4e6e58;
		font-weight: 600;
	}

	/* 来源 */
	.source-line {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 20rpx;
		font-size: 26rpx;
	}

	.source-label {
		padding: 4rpx 14rpx;
		background: #3a322c;
		color: #f6f1e4;
		font-size: 22rpx;
		border-radius: 20rpx;
		letter-spacing: 2rpx;
	}

	.source-value {
		color: #5c5348;
		font-weight: 600;
		letter-spacing: 1rpx;
	}

	/* 解析 */
	.analysis {
		margin-bottom: 20rpx;
		padding: 24rpx;
		background: #fbf7ec;
		border: 1rpx solid #e2d8c0;
		border-left: 6rpx solid #b03a2e;
		border-radius: 12rpx;
	}

	.analysis-title {
		font-size: 26rpx;
		font-weight: 700;
		color: #3a322c;
		letter-spacing: 2rpx;
		margin-bottom: 12rpx;
	}

	.analysis-content {
		font-size: 28rpx;
		color: #5c5348;
		line-height: 1.7;
	}

	/* ==================== 评论 ==================== */
	.comments {
		margin-bottom: 20rpx;
		padding: 24rpx;
		background: #fbf7ec;
		border: 1rpx solid #e2d8c0;
		border-radius: 12rpx;
	}

	.comments-title {
		font-size: 26rpx;
		font-weight: 700;
		color: #3a322c;
		letter-spacing: 2rpx;
		margin-bottom: 16rpx;
	}

	.comment-count {
		font-weight: 400;
		color: #8a8278;
		font-size: 22rpx;
	}

	.comment-empty {
		font-size: 24rpx;
		color: #8a8278;
		text-align: center;
		padding: 20rpx 0;
	}

	.comment-item {
		padding: 16rpx 0;
		border-bottom: 1rpx dashed #e2d8c0;

		&:last-child {
			border-bottom: none;
		}
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

	/* 分平台解析 */
	.platform-analysis {
		margin-top: 16rpx;
		padding: 16rpx;
		background: #f4ecdc;
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

	/* 评论输入 */
	.comment-form {
		margin-bottom: 20rpx;
		padding: 20rpx;
		background: #fbf7ec;
		border: 1rpx solid #e2d8c0;
		border-radius: 12rpx;
	}

	.comment-textarea {
		width: 100%;
		min-height: 120rpx;
		padding: 16rpx;
		font-size: 28rpx;
		color: #3a322c;
		background: #f6f1e4;
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

	/* ==================== 按钮 ==================== */
	.nav-btn-row {
		margin-top: 40rpx;
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
		transition: all 0.2s;

		&:active {
			opacity: 0.85;
		}
	}

	.ink-btn-primary {
		background: #b03a2e;
		box-shadow: 0 6rpx 14rpx rgba(176, 58, 46, 0.25);
	}

	.ink-btn-ghost {
		background: transparent;
		color: #3a322c;
		border: 2rpx solid #3a322c;
		box-shadow: none;
	}

	.ink-btn-ghost.disabled {
		opacity: 0.35;
		pointer-events: none;
	}

	/* ==================== 完成 ==================== */
	.finish-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 60vh;
	}

	.finish-seal {
		width: 96rpx;
		height: 96rpx;
		border: 4rpx solid #b03a2e;
		border-radius: 16rpx;
		color: #b03a2e;
		font-size: 48rpx;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(-6deg);
	}

	.finish-text {
		font-size: 40rpx;
		color: #3a322c;
		letter-spacing: 6rpx;
		margin: 30rpx 0 40rpx;
	}

	.finish-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.stat-line {
		font-size: 28rpx;
		color: #8a8278;
		margin: 6rpx 0;
	}

	.platform-analysis {
		margin-top: 16rpx;
		padding: 16rpx;
		background: #f4ecdc;
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

	.question-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.question-number {
		font-size: 26rpx;
		color: #8a8278;
		letter-spacing: 2rpx;
	}

	.fav-btn {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 6rpx 18rpx;
		background: #fbf7ec;
		border: 1rpx solid #e2d8c0;
		border-radius: 24rpx;
		font-size: 24rpx;
		color: #b03a2e;
	}

	.fav-btn:active {
		opacity: 0.7;
	}

	.fav-text {
		font-size: 22rpx;
		color: #8a8278;
	}
	
	.comment-disabled-tip {
	  margin-top: 20rpx;
	  padding: 24rpx;
	  text-align: center;
	  font-size: 24rpx;
	  color: #8a8278;
	  background: #f6f1e4;
	  border: 1rpx dashed #e2d8c0;
	  border-radius: 10rpx;
	  letter-spacing: 1rpx;
	}
</style>