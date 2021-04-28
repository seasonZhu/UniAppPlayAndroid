<template>
	<view class="wrap">
		<view v-for="(item,index) in list" :key="index">
			<u-tag :text="item.name" :index='item.name' @click="click"/>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchWord:'',
				list:[]
			}
		},
		onLoad() {
			this.getHotKey()
		},
		onNavigationBarSearchInputChanged:function(e){
			console.log(e)
			this.searchWord = e.text
		},
		onNavigationBarSearchInputConfirmed:function(e){
			console.log(e.text)
		},
		onNavigationBarButtonTap(e) {
			console.log(e.float)
			console.log(this.searchWord)
			//this.$u.route('/pages/index/search');
		},
		methods: {
			getHotKey() {
				this.$u.api.hotKey().then(res => {
					this.list = res
					console.log(res)
				})
			},
			click(index) {
				//let keyword = this.list[index]
				console.log(index)
			}
		}
	}
</script>

<style scoped lang="scss">
	.wrap {
		padding: 24rpx;
	}

	.u-row {
		margin: 40rpx 0;
	}

	.demo-layout {
		height: 80rpx;
		border-radius: 8rpx;
	}

	.bg-purple {
		background: #d3dce6;
	}

	.bg-purple-light {
		background: #e5e9f2;
	}

	.bg-purple-dark {
		background: #99a9bf;
	}
</style>
