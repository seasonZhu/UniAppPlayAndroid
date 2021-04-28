<template>
</template>

<script>
	export default {
		data() {
			return {
				page: 0,
				result:[],
			}
		},
		onLoad(option) {
			console.log(option.keyword)
			uni.setNavigationBarTitle({
			　　title:option.keyword
			})
			//this.searchResult(option)
		},
		methods: {
			/// 该接口异常，在postman中使用form-data可以调通
			searchResult(option) {
				this.$u.api.queryKeyword({"k": option.keyword}, this.page).then(res => {
					console.log(res)
				})
			}
		}
	}
</script>

<style>
</style>
