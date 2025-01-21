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

	return allowedPermissions.includes('Manage Users');
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

		headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
		headers.set('Access-Control-Allow-Headers', 'Authorization');
		headers.set('Content-Type', 'application/json');

		if (request.method == 'OPTIONS') {
			headers.delete('Content-Type');
			return new Response(null, {
				status: 204,
				headers: headers,
			});
		} else if (request.method == 'GET') {
			const token = request.headers.get('Authorization');

			if (!token) {
				return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401, headers: headers });
			}

			if (!(await validateAuth(token, env))) {
				return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 403, headers: headers });
			}
			let users = {};

			let data = await env.Auth.list();

			var cUser = '';

			for (let i = 0; i < data.keys.length; i++) {
				cUser = data.keys[i].name;

				let userData = JSON.parse(await env.Auth.get(cUser));
				delete userData.password; // Remove the password field
				users[cUser] = userData;
			}

			console.log(users);

			return new Response(JSON.stringify(users), { status: 200, headers: headers });
		}

		return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: headers });
	},
};
