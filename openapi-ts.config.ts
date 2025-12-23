import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "./openapi.json",
	output: "./src/client",
	plugins: [
		"@hey-api/client-fetch", // Or axios
		"@hey-api/typescript",
		"@hey-api/sdk",
		{
			name: "@tanstack/react-query",
			// Generates useQuery and useMutation hooks automatically
			queryOptions: true
		}
	]
});
