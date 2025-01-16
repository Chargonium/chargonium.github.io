fetch("https://api.chargonium.com/getcount").then((response) => {
    response.text().then((text) => {
        document.getElementById("renocount").value = text;
    });
});

function updateCount(newValue) {
    fetch("https://api.chargonium.com/setcount", {
        headers: {
            Auth: document.cookie.split("=")[1],
            Value: newValue,
        },
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {
            response.text().then((text) => {
                document.getElementById("renocount").value = text;
            });
        } else if (response.status == 401) {
            document.cookie =
                "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
            alert("Your session has expired; Please login again!");
            document.location.href = "/admin";
        } else if (response.status == 403) {
            alert("You are not authorized to perform this action!");
        } else if (response.status == 400) {
            alert("Please enter a value");
        }
    });
}
