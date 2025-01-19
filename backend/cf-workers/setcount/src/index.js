/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

async function validateAuth(token, env) {
	let sessionData = await env.Sessions.get(token);
	sessionData = JSON.parse(sessionData);
	console.log(sessionData);
	return false;
}

export default {
	async fetch(request, env, ctx) {
		// TESTING ONLY; Do not push

		await env.Sessions.put(
			'3S1FV9Y0STTRW5AIBD9NDT420LFVGKQ40SNUI31X52NQCEHC5F',
			JSON.stringify({
				username: 'Chargonium',
				perms: 'F',
			})
		);

		// End testing only;

		const headers = new Headers();

		// Set CORS headers

		const allowedOrigins = ['https://chargonium.com', 'https://www.chargonium.com', 'https://chargonium.github.io'];

		if (allowedOrigins.includes(request.headers.get('Origin'))) {
			headers.set('Access-Control-Allow-Origin', '*');
		} else {
			headers.set('Access-Control-Allow-Origin', 'null');
		}

		headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
		headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

		if (request.method == 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: headers,
			});
		} else if (request.method == 'POST') {
			let token = request.headers.get('Authorization');

			if (token === null) return new Response(JSON.stringify({ error: 'No auth token' }), { status: 401, headers: headers });
			let auth = await validateAuth(token, env);
			console.log(auth);
			if (!auth) return new Response(JSON.stringify({ error: 'Invalid auth' }), { status: 401, headers: headers });
			/* TODO: Actually make it respond with shit !
			if (request.headers.get('Content-Type') === "application/json") {
				const json = await request.json();
				
				return new Response(null, {
					status: 204,
					headers: headers,
				});
			}
			*/
		}

		return new Response(JSON.stringify({ error: 'Invalid method' }), { status: 405, headers: headers });
	},
};
