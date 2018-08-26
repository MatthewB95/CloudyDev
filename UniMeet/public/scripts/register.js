// Checks if passwords match. Indicates to user whether they match
function passwordCheck() {
    var password = $("#password").val();
    var confirmPassword = $("#confirmPassword").val();
    // Display no warnings if nothing is entered
    if (password == "" || confirmPassword == "") {
        $("#warning").text("");
        document.getElementById("confirmPassword").style.borderColor = "#C8C8C8";
        document.getElementById("password").style.borderColor = "#C8C8C8";
        return false;
    }
    // Ensure passwords are longer than 6 characters
    else if ((password.length > 0 && password.length < 6) && (confirmPassword.length > 0 && confirmPassword.length < 6)) {
        document.getElementById("confirmPassword").style.borderColor = "Red";
        document.getElementById("password").style.borderColor = "Red";
        $("#warning").text("● Your password must be longer than 6 characters.");
        return false;
    }
    // Return true if passwords match
    else if (password == confirmPassword) {
        $("#warning").text("");
        document.getElementById("confirmPassword").style.borderColor = "LimeGreen";
        document.getElementById("password").style.borderColor = "LimeGreen";
        return true;
    }
    // Otherwise, return false as the passwords do not match
    else {
        document.getElementById("confirmPassword").style.borderColor = "Red";
        document.getElementById("password").style.borderColor = "#C8C8C8";
        $("#warning").text("● Your passwords must match.");
        return false;
    }
}

// Runs a password check when form is filled
$(function() {
    $("#confirmPassword").keyup(passwordCheck);
    $("#password").keyup(passwordCheck);
});


// Updates the user's profile information when they hit save
document.getElementById("signUpForm").addEventListener("submit", function() {

    // If passwords don't match, doesn't create user
    if (passwordCheck() == false)
        return false;

    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(user) {
            // Redirect user to home page
            document.location.href = "/";
        }, function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error("Error: ", error);
    });
})