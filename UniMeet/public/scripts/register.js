
// Updates the user's profile information when they hit save
document.getElementById("signUpForm").addEventListener("submit", function() {
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    if (password != confirmPassword) {
        // Display error message
        alert("Passwords do not match.");
        return;
    }

        .then(function(user) {
             alert("SUCCESS!");
            //var user = firebase.auth().currentUser;
            //logUser(user); // Optional
        }, function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error("Error: ", error);
            alert("ITS FUCKED!");
    });
})