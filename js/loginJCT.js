var username;
var startCounter = 0;
$(document).ready(function () {
    DataAccess.Data(onStart);
});

function onStart(data) {

    // Check if the username and password is not empty
    username = data["username"];
    console.log("JCT Tools->Username: " + username);
    // Decrypting the password
    var password = "";
    if (data["password"] != null)
        password = window.atob(data["password"]);

    // Check current host
    switch (location.host) {
        case "moodle.jct.ac.il":
            moodle(password, data);
            break;
        case "mazak.jct.ac.il":
        case "levnet.jct.ac.il":
            mazakConnect(data);
            break;
    }
}
