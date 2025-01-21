/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
const permissions = ['Update Renovationcount', 'Manage Users', 'Manage Pages', 'Manage Email'];

function parsePermissionString(permString) {
	let bin = parseInt(permString, 36).toString(2).padStart(permissions.length, '0').split('').reverse();
	let allowedPermissions = [];
	for (let i = 0; i < permissions.length; i++) {
		if (bin[i] === '1') {
			allowedPermissions.push(permissions[i]);
		}
	}
	return allowedPermissions;
}

async function validateAuth(token, env) {
	let sessionData = await JSON.parse(await env.Sessions.get(token));

	if (sessionData === null) return false;

	const allowedPermissions = parsePermissionString(sessionData.perms);

	return allowedPermissions.includes('Update Renovationcount');
}

export default {
	async fetch(request, env, ctx) {
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

			if (!auth) return new Response(JSON.stringify({ error: 'Invalid auth' }), { status: 401, headers: headers });

			if (request.headers.get('Content-Type') === 'application/json') {
				const json = await request.json();

				await env.KV.put('RenovationCount', json.count);

				return new Response(null, {
					status: 204,
					headers: headers,
				});
			} else if (request.headers.get('Content-Type') === 'text/plain') {
				const text = await request.text();

				await env.KV.put('RenovationCount', text);

				return new Response(null, {
					status: 204,
					headers: headers,
				});
			} else {
				return new Response(JSON.stringify({ error: 'Invalid content type' }), { status: 400, headers: headers });
			}
		}

		return new Response(JSON.stringify({ error: 'Invalid method' }), { status: 405, headers: headers });
	},
};
