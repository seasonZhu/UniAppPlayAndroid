import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
	plugins: [uni()],
	server: {
		port: 8081,
		host: 'localhost',
		proxy: {
			// 代理所有 /api 开头的请求到 WanAndroid API
			'/api': {
				target: 'https://www.wanandroid.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	},
	esbuild: {
		target: 'es2015'
	}
})
