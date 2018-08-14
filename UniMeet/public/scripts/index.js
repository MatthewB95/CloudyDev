// JavaScript Document




document.getElementById('loginBtn').addEventListener('click', emailSignIn, false);
document.getElementById('loginGoogleBtn').addEventListener('click', googleSignIn, false);






function emailSignIn() {
	
	window.open("matching.html");
//	
//	alert("HELLO");
//	if (firebase.auth().currentUser) {
//		// [START signout]
//		firebase.auth().signOut();
//		// [END signout]
//	} else {
//		var email = document.getElementById('email').value;
//		var password = document.getElementById('password').value;
//		if (email.length < 4) {
//			alert('Please enter an email address.');
//			return;
//		}
//		if (password.length < 4) {
//			alert('Please enter a password.');
//			return;
//		}
//		// Sign in with email and pass.
//		// [START authwithemail]
//		firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
//			// Handle Errors here.
//			var errorCode = error.code;
//			var errorMessage = error.message;
//			// [START_EXCLUDE]
//			if (errorCode === 'auth/wrong-password') {
//				alert('Wrong password.');
//			} else {
//				alert(errorMessage);
//			}
//			console.log(error);
//			document.getElementById('loginBtn').disabled = false;
//			// [END_EXCLUDE]
//		});
//		// [END authwithemail]
//	}
//	document.getElementById('loginBtn').disabled = true;
}
//
//
//
//function handleSignUp() {
//	var email = document.getElementById('email').value;
//	var password = document.getElementById('password').value;
//	if (email.length < 4) {
//		alert('Please enter an email address.');
//		return;
//	}
//	if (password.length < 4) {
//		alert('Please enter a password.');
//		return;
//	}
//	// Sign in with email and pass.
//	// [START createwithemail]
//	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
//		// Handle Errors here.
//		var errorCode = error.code;
//		var errorMessage = error.message;
//		// [START_EXCLUDE]
//		if (errorCode == 'auth/weak-password') {
//			alert('The password is too weak.');
//		} else {
//			alert(errorMessage);
//		}
//		console.log(error);
//		// [END_EXCLUDE]
//	});
//	// [END createwithemail]
//}








function googleSignIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
	alert("Signin")
}

// Signs-out of Friendly Chat.
function signOut() {
  // Sign out of Firebase.
	alert("Signout")
  firebase.auth().signOut();
}

// Initiate firebase auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
	alert("init")
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
	alert("UserSignin")
  return !!firebase.auth().currentUser;
}


// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

//    // Set the user's profile pic and name.
//    userPicElement.style.backgroundImage = 'url(' + profilePicUrl + ')';
//    userNameElement.textContent = userName;
//
//    // Show user's profile and sign-out button.
//    userNameElement.removeAttribute('hidden');
//    userPicElement.removeAttribute('hidden');
//    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
//    signInButtonElement.setAttribute('hidden', 'true');

    // We save the Firebase Messaging Device token and enable notifications.
    saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
//    userNameElement.setAttribute('hidden', 'true');
//    userPicElement.setAttribute('hidden', 'true');
//    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
//    signInButtonElement.removeAttribute('hidden');
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
	alert("check signed in")
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false;
}


// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

// Checks that Firebase has been imported.
checkSetup();




// initialize Firebase
initFirebaseAuth();
