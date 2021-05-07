<template>
	<view><web-view :src="url"></web-view></view>
</template>

<script>
export default {
	data() {
		return {
			params: {}
		};
	},
	onLoad(option) {
		this.params = option;
	},
	computed: {
		url() {
			return this.params.url;
		}
	},
	methods: {}
};
</script>

<style></style>
