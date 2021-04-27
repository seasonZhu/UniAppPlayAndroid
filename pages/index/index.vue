<template>
	<u-swiper :list="list" name="imagePath" img-mode="widthFix" :height="420" @click="click"></u-swiper>
</template>

<script>
	export default {
		data() {
			return {
				list: [],
			}
		},
		onLoad() {
			this.getBanner()
		},
		methods: {
			getBanner() {
				this.$u.api.banner().then(res => {
					console.log(res);
					this.list = res
				})
			},
			openPage() {
				console.log("打开详细页面")
				this.$u.route({
					url: '/pages/web/index'
				});
			},
			click(index) {
				let url = this.list[index].url
				console.log(url)
			},
		}
	}
</script>

<style>
</style>
