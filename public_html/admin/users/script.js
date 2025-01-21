const permissions = [
    "Update Renovationcount",
    "Manage Users",
    "Manage Pages",
    "Manage Email",
];

function parsePermissionString(permString) {
    let bin = parseInt(permString, 36)
        .toString(2)
        .padStart(permissions.length, "0")
        .split("")
        .reverse();
    let allowedPermissions = [];
    for (let i = 0; i < permissions.length; i++) {
        if (bin[i] === "1") {
            allowedPermissions.push(permissions[i]);
        }
    }
    return allowedPermissions;
}

// Show the correct container on load

let hash = window.location.hash.substring(1);
const containers = document.querySelectorAll(".container");

if (hash.length == 0) {
    hash = "users";
} // If no hash, use default

containers.forEach((container) => {
    if (container.id === `${hash}-container`) {
        container.style.display = "flex";
    } else {
        container.style.display = "none";
    }
});

// Fetch users and initialize containers

fetch("https://api.chargonium.com/getusers", {
    headers: { Authorization: document.cookie.split("=")[1] },
}).then(async (response) => {
    if (response.status === 200) {
        data = await response.json();
        let usersElement = document.getElementById("users");

        for (const [key, value] of Object.entries(data)) {
            let userElement = document.createElement("li");

            userElement.innerHTML = `<a href="#${key}">${key}</a>`;
            usersElement.appendChild(userElement);

            let userContainer = document.createElement("div");
            userContainer.classList.add("container");
            userContainer.id = `${key}-container`;
            userContainer.style.display = "none";
            if (hash === key) {
                userContainer.style.display = "flex";
            }
            let userPermissions = document.createElement("ul");
            let allowedPermissions = parsePermissionString(value.perms);
            for (permission in permissions) {
                var permissionElement = document.createElement("li");
                permissionElement.innerText = `• ${permissions[permission]}:`;

                var label = document.createElement("label");
                label.classList.add("switch");

                var checkBox = document.createElement("input");
                checkBox.type = "checkbox";
                checkBox.checked = allowedPermissions.includes(
                    permissions[permission]
                );

                var slider = document.createElement("span");
                slider.classList.add("slider");
                slider.classList.add("round");

                label.appendChild(checkBox);
                label.appendChild(slider);

                permissionElement.appendChild(label);
                userPermissions.appendChild(permissionElement);
            }
            userContainer.innerHTML = `<h1>${key}</h1>`;
            userContainer.appendChild(userPermissions);
            document.body.appendChild(userContainer);
        }
    }
});

// When hashchanges, show the correct container

window.addEventListener("hashchange", () => {
    let hash = window.location.hash.substring(1); // Get the hash without the #
    const containers = document.querySelectorAll(".container"); // Get all containers

    if (hash.length == 0) {
        hash = "users";
    } // If no hash, use default

    containers.forEach((container) => {
        if (container.id === `${hash}-container`) {
            container.style.display = "flex"; // Show the matching container
        } else {
            container.style.display = "none"; // Hide all others
        }
    });
});
