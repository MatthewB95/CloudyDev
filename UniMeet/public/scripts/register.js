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

/**
 * Function called when clicking the Login/Logout button.
 */
// [START buttoncallback]
function toggleSignIn() {
    if (!firebase.auth().currentUser) {
        // [START createprovider]
        var provider = new firebase.auth.GoogleAuthProvider();
        // [END createprovider]
        // [START addscopes]
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        // [END addscopes]
        // [START signin]
        firebase.auth().signInWithPopup(provider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // [END_EXCLUDE]
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // [START_EXCLUDE]
            if (errorCode === 'auth/account-exists-with-different-credential') {
                alert('You have already signed up with a different auth provider for that email.');
                // If you are using multiple auth providers on your app you should handle linking
                // the user's accounts here.
            } else {
                console.error(error);
            }
            // [END_EXCLUDE]
        });
        // [END signin]
    } else {
        // [START signout]
        firebase.auth().signOut();
        // [END signout]
    }
    // [START_EXCLUDE]
    document.getElementById('quickstart-sign-in').disabled = true;
    // [END_EXCLUDE]
}
// [END buttoncallback]

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
				document.location.href = "verify";
//              document.location.href = "setup";
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

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            if (user.emailVerified == true) {
                window.open("/matching.html", "_self");
            } else {
                window.open("/verify.html", "_self");
            }
        }
    });
    // [END authstatelistener]
    document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
}

window.onload = function () {
    initApp();
};