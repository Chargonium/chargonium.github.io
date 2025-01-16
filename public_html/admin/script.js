async function login(username, password) {
    let resp = await fetch("https://api.chargonium.com/auth", {
        headers: {
            User: username,
            Auth: password,
        },
    });

    if (resp.status == 200) {
        let token = await resp.text();
        document.cookie = `token=${token}; Max-Age=86400; path=/admin`;
        document.location = "/admin/dashboard";
    } else if (resp.status == 401) {
        alert("Invalid credentials");
    }
}

if (document.cookie.includes("token")) {
    document.location = "/admin/dashboard";
}
