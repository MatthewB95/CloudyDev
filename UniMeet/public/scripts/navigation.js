// JavaScript Document

// Initialise Firebase

firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		// User is signed in.
		var user = firebase.auth().currentUser;
		if (user != null) {

			document.getElementById('nav_profile_image').src = user.photoURL;
			
			const docRef = firestore.doc("student/" + user.uid);
			
			docRef.get().then(function (doc) {
                if (doc && doc.exists) {
                    const myData = doc.data();
					document.getElementById('nav_profile_title').innerHTML = myData.name;
				}
			});
			
		} else {
			// No user is signed in.
			// Redirect them to home page
			document.location.href = "/";
		}
	}
});




document.getElementById('logoutBtn').addEventListener('click', toggleSignIn, false);
document.getElementById('navProfileBtn').addEventListener('click', loadProfile, false);


// [START buttoncallback]
function toggleSignIn() {
//	if (!firebase.auth().currentUser) {
//		// [START createprovider]
//		var provider = new firebase.auth.GoogleAuthProvider();
//		// [END createprovider]
//		// [START addscopes]
//		provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
//		// [END addscopes]
//		// [START signin]
//		firebase.auth().signInWithPopup(provider).then(function (result) {
//			// This gives you a Google Access Token. You can use it to access the Google API.
//			var token = result.credential.accessToken;
//			// The signed-in user info.
//			var user = result.user;
//			// [END_EXCLUDE]
//		}).catch(function (error) {
//			// Handle Errors here.
//			var errorCode = error.code;
//			var errorMessage = error.message;
//			// The email of the user's account used.
//			var email = error.email;
//			// The firebase.auth.AuthCredential type that was used.
//			var credential = error.credential;
//			// [START_EXCLUDE]
//			if (errorCode === 'auth/account-exists-with-different-credential') {
//				alert('You have already signed up with a different auth provider for that email.');
//				// If you are using multiple auth providers on your app you should handle linking
//				// the user's accounts here.
//			} else {
//				console.error(error);
//			}
//			// [END_EXCLUDE]
//		});
//		// [END signin]
//	} else {
		// [START signout]
		firebase.auth().signOut();
		window.open("/index.html","_self");
		// [END signout]
//	}
	// [START_EXCLUDE]
//	document.getElementById('quickstart-sign-in').disabled = true;
	// [END_EXCLUDE]
}




function loadProfile() {
    window.open("/profile.html","_self");
}










