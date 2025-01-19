/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const headers = new Headers();

		// Set CORS headers

		headers.set('Access-Control-Allow-Origin', 'https://chargonium.com, https://www.chargonium.com, https://chargonium.github.io');
		headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
		headers.set('Access-Control-Allow-Headers', '');

		if (request.method === 'OPTIONS') {
			// return cors headers
			return new Response(null, {
				status: 204,
				headers,
			});
		} else if (request.method === 'GET') {
			// return the current count
			headers.set('Content-Type', 'text/plain');
			return new Response(await env.KV.get('RenovationCount'), {
				status: 200,
				headers,
			});
		}

		return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
	},
};
