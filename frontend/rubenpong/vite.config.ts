import { Server } from '@sveltejs/kit';
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	server: {
		port: 8000,
	},
};

// export default config;
export default config;