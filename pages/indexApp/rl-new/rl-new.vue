<template>
	<view>
			<xdd-calendar @change="changeDay" />
	</view>
</template>

<script>
	import xddCalendar from '@/components/xdd-calendar/xdd-calendar.vue'
	export default {
		components:{xddCalendar},
		data() {
			return {
				
			}
		},
		methods: {
				changeDay(a){
					console.log(a)
				}
		}
	}
</script>

<style>

</style>
