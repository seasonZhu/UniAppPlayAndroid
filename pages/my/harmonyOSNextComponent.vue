<template>
    <embed class="native-button" tag="button" :options="options" @click="onClick"></embed>
</template>

<script>
    export default {
        data() {
            return {
                options: {
                    label: 'hello'
                }
            }
        },
        methods: {
            onClick(e) {
                console.log('onClick', e.detail.text)
            }
        }
    }
</script>

<style scoped>
    .native-button {
        display: block;
        width: 200px;
        height: 50px;
        margin: 10px auto;
    }
</style>