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
        document.getElementById("confirmPassword").style.borderColor = "#FF9999";
        document.getElementById("password").style.borderColor = "#FF9999";
        $("#warning").text("● Your password must be longer than 6 characters.");
        return false;
    }
    // Return true if passwords match
    else if (password == confirmPassword) {
        $("#warning").text("");
        document.getElementById("confirmPassword").style.borderColor = "#A0E0A0";
        document.getElementById("password").style.borderColor = "#A0E0A0";
        return true;
    }
    // Otherwise, return false as the passwords do not match
    else {
        document.getElementById("confirmPassword").style.borderColor = "#FF9999";
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

    $("#signUpButton").toggleClass('active', true);

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(user) {
            var user = firebase.auth().currentUser;
            user.sendEmailVerification().then(function() {
              // Email sent.
              console.log("Sent Verification Email.");
				document.location.href = "setup";
//              document.location.href = "verify";
            }).catch(function(error) {
              $("#signUpButton").toggleClass('active', false);
              // An error happened.
              console.log("Failed to send verification email.");
              console.log("Error:", error);
            });

            // Redirect user to home page
            //document.location.href = "/";
        }, function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error("Error: ", error);
            $("#signUpButton").toggleClass('active', false);
    });
})