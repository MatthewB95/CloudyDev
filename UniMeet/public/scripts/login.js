
function signUp() {
	window.open("/register.html", "_self");
}

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
			window.open("/matching.html", "_self");
		}
	});
	// [END authstatelistener]

	document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
	document.getElementById('signupBtn').addEventListener('click', signUp, false);
}

window.onload = function () {
	initApp();
};

// Updates the user's profile information when they hit save
document.getElementById("loginForm").addEventListener("submit", function() {
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
   		.then(function(firebaseUser) {
       		// Success
       		alert("Logged in!");
   		})
  		.catch(function(error) {
       		// Error Handling
  	});

})

