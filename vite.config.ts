import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000", // TODO: make environment variable
				changeOrigin: true,
				secure: false,
				rewrite: path => path.replace(/^\/api/, ""),
				// get proxy logs
				configure: (proxy, _options) => {
					proxy.on("error", (err, _req, _res) =>
						console.log("proxy error", err)
					);
					proxy.on("proxyReq", (proxyReq, req, _res) => {
						console.log(
							"Sending Request to:",
							req.method,
							req.url,
							"->",
							proxyReq.path
						);
					});
				}
			}
		}
	}
});
