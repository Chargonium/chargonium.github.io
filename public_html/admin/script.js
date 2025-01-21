function login(event) {
    event.preventDefault();

    const data = new FormData(event.target);
    let credentials = JSON.stringify({
        username: data.get("username"),
        password: data.get("password"),
    });

    fetch("https://api.chargonium.com/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: credentials,
    }).then((response) => {
        if (response.status == 200) {
            response.text().then((token) => {
                document.cookie = `token=${
                    JSON.parse(token).token
                }; Max-Age=86400; path=/admin`;
                document.location = "/admin/dashboard";
            });
        } else if (response.status == 401) {
            alert("Invalid credentials");
        } else if (response.status == 404) {
            alert("User not found");
        }
    });
}

if (document.cookie.includes("token")) {
    document.location = "/admin/dashboard";
}
