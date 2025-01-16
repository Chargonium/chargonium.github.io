fetch("https://api.chargonium.com/getcount").then((response) => {
    response.text().then((text) => {
        document.getElementById("renovationCount").innerText = text;
    });
});
