async function _login(username, password) {
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

function login(event) {
    event.preventDefault();

    const data = new FormData(event.target);

    console.log(
        JSON.stringify({
            Username: data.get("username"),
            Password: data.get("password"),
            "cf-turnstile-response": data.get("cf-turnstile-response"),
        })
    );
}
