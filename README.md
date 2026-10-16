# NOA AI Studio

Set `NOA_SERVER_URL` to the public tunnel and `NOA_API_KEY` in Vercel.
The local server should validate the same key before serving studio endpoints.
Tunnel example: `cloudflared tunnel --url http://localhost:3001`.
Install dependencies with the existing package manager.
Build with `npm run build`.
Deploy by importing the GitHub repository into Vercel.
Never expose server API keys as `VITE_*` variables.
