function hash(content) {
	let utf8 = new TextEncoder().encode(content);
	return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
		let hashArray = Array.from(new Uint8Array(hashBuffer));
		let hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
		return BigInt('0x' + hashHex) // Converts the hex to Base36 for more efficient storage
			.toString(36)
			.toUpperCase();
	});
}

function generateRandomSHA256Hash(arrayLen = 256) {
	let randomData = new Uint8Array(arrayLen);
	crypto.getRandomValues(randomData);
	return hash(randomData);
}

function handleCors(headers) {
	headers['Content-Type'] = null;
	return new Response(null, {
		status: 204,
		headers: headers,
	});
}

async function handleAuth(request, env, headers) {
	let response = {};

	const contentType = request.headers.get('content-type');
	if (contentType !== 'application/json') {
		response.error = 'Invalid content type';
		return new Response(JSON.stringify(response), { status: 400, headers: headers });
	}

	const body = await request.json();
	if (!body.username || !body.password) {
		response.error = 'Invalid request body';
		return new Response(JSON.stringify(response), { status: 400, headers: headers });
	}

	const user = await env.Auth.get(body.username.toLowerCase());
	if (!user) {
		response.error = 'User not found';
		return new Response(JSON.stringify(response), { status: 404, headers: headers });
	}

	const userObj = JSON.parse(user);

	console.log(userObj.password, await hash(body.password));

	if (userObj.password !== (await hash(body.password))) {
		response.error = 'Invalid password';
		return new Response(JSON.stringify(response), { status: 401, headers: headers });
	}

	const token = await generateRandomSHA256Hash();
	await env.Sessions.put(token, JSON.stringify({ username: body.username, perms: userObj.perms }), { expirationTtl: 86400 });

	response.token = token;

	return new Response(JSON.stringify(response), { status: 200, headers: headers });
}

export default {
	async fetch(request, env, ctx) {
		// Set headers

		const headers = new Headers();
		const allowedOrigins = ['https://chargonium.com', 'https://www.chargonium.com', 'https://chargonium.github.io'];

		if (allowedOrigins.includes(request.headers.get('Origin'))) {
			headers.set('Access-Control-Allow-Origin', '*');
		} else {
			headers.set('Access-Control-Allow-Origin', 'null');
		}

		headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
		headers.set('Access-Control-Allow-Headers', 'Content-Type');

		if (request.method == 'OPTIONS') {
			// Handle cors requests
			return handleCors(headers);
		} else if (request.method == 'POST') {
			// Handle authentication request.

			return await handleAuth(request, env, headers);
		} else {
			// Handle invalid requests

			return new Response(
				JSON.stringify({
					error: 'Invalid request method',
				}),
				{ status: 405, headers: headers }
			);
		}
	},
};
