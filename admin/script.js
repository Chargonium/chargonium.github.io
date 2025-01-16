async function login(username, password) {
    let resp = await fetch("https://api.chargonium.com/auth", {
        headers: {
            User: username,
            Auth: password,
        },
    });
    let token = await resp.text();
    document.cookie = `token=${token}; Max-Age=86400; path=/`;
    //document.location = "/admin/dashboard";
}

if (document.cookie.includes("token")) {
    //document.location = "/admin/dashboard";
}
