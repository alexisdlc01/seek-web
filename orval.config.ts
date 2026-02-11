import { defineConfig } from 'orval';

export default defineConfig({
	seek: {
		output: {
			mode: 'tags-split',
			target: 'src/api/seek.ts',
			schemas: 'src/api/model',
			httpClient: "axios",
			client: 'react-query',
			override: {
				mutator: {
					path: "./src/utils/custom-instance.ts",
					name: "customInstance",
				},
			},
		},
		input: {
			target: './openapi.json',
		},
	},
});
