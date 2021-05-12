<template>
	<view>
		<web-view :src="url"></web-view>
		<u-popup v-model="show" mode="bottom">
			<view v-for="(item, index) in list" :key="index">
				<u-grid :col="1">
					<u-grid-item @click="click(index)"><view class="grid-text">{{item}}</view></u-grid-item>
				</u-grid>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
	data() {
		return {
			params: {},
			show: false,
			staticList: ['复制链接', '浏览器打开', '微信分享', '刷新']
		};
	},
	onLoad(option) {
		this.params = option;
		console.log(option.id)
		console.log(option.url)
	},
	onNavigationBarButtonTap(e) {
		console.log(e.float);
		this.show = true;
	},
	computed: {
		...mapState(['userInfo']),
		url() {
			return this.params.url
		},
		collectIds() {
			return this.userInfo.profile.collectIds
		},
		id() {
			return Number(this.params.id)
		},
		hasCollected: {
			get() {
				// 这个地方的判断有问题，先打的this.params.id后打的array，导致result为false
				// 数组里面是Number类型，id是String类型，需要把id转换一下
				let array = this.collectIds
				let id = this.id
				console.log(array)
				console.log(id)
				let result = array.includes(this.id)
				console.log(result)
				return result
			},
			set(newValue) {
				
			}
		},
		list() {
			if (this.userInfo.hasLogin && !this.params.isFromBanner) {
				let text = this.hasCollected ? '取消收藏' : '收藏';
				let array = ['复制链接', '浏览器打开', '微信分享', '刷新']
				array.push(text)
				return array
			} else {
				return this.staticList
			}
		}
	},
	methods: {
		...mapMutations(['storeLogin']),
		click(index) {
			this.show = false
			console.log(index)
			switch (index) {
				case 4:
					this.actionCollectedOrUnCollected()
					break;
				default:
					break;
			}
		},
		actionCollectedOrUnCollected() {
			if (this.hasCollected) {
				this.$u.api.actionUnCollected(this.id)
				.then(res => {
					console.log(res)
					if (res == undefined) {
						this.autoLogin()
					}
				})
			}else {
				this.$u.api.actionCollected(this.id)
				.then(res => {
					console.log(res)
					if (res == undefined) {
						this.autoLogin()
					}
				})
			}
		},
		/// 因为账号信息中保存着收藏的信息，做完收藏或者取消收藏的操作后，调用一次登录信息，刷新个人信息，可以便于整个vuex层的数据保持最新，
		/// 这个和我用Flutter的实现不一样，Flutter中我是对collectIds自行进行增删，但是vuex中对于state里面的操作我不太会
		autoLogin() {
			if (!this.userInfo.hasLogin) {
				return;
			}
					
			let mobile = uni.getStorageSync('username')
			let code = uni.getStorageSync('password')
					
			if (mobile.length == 0 || code.length == 0) {
				return
			}
					
			this.$u.api.login(mobile, code).then(res => {
				if (typeof res == 'string') {
					let message = res
					this.$refs.uToast.show({
						title: message
					});
					return
				}
										
				const temp = {
					cookie: 'loginUserName=' + mobile + ';' + 'loginUserPassword=' + code,
					profile: res
				}
					
				// 刷新操作
				this.storeLogin(temp);
				uni.setStorageSync('username', mobile)
				uni.setStorageSync('password', code)
			});
		},
	}
};
</script>

<style>
.grid-text {
	font-size: 28rpx;
	margin-top: 4rpx;
	color: $u-type-info;
}
</style>
