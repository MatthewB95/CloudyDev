// JavaScript Document

firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		// User is signed in.
		var user = firebase.auth().currentUser;
		if (user != null) {

			// Get the user's profile information for the nav bar
			const docRef = firestore.doc("student/" + user.uid);

			docRef.get().then(function (doc) {
                if (doc && doc.exists) {
                    const myData = doc.data();

                    if (myData.profile_image == null) {
						document.getElementById('profileIcon').src = '/../images/profile_placeholder.png';
					}
					else {
						document.getElementById('profileIcon').src = myData.profile_image;
					}
					//document.getElementById('nav_profile_title').innerHTML = myData.name;
				}
			});

			
			// Check and display if the user has any friend requests
			var friendRequests = 0;
			const friendsRef = firestore.doc("friends/" + user.uid);

			friendsRef.get().then(function (doc) {
				if (doc && doc.exists) {
					const friendData = doc.data();
					for (var key in friendData) {
						if (friendData[key] == 2) {
							friendRequests++;
						}
					}
					if (friendRequests > 0) {
						document.getElementById('friendsNavText').innerHTML = "Friends ("+friendRequests+")";
					}
					console.log("Friend Requests: ", friendRequests);
				}
			});

			
		} else {
			// No user is signed in.
			// Redirect them to home page
			document.location.href = "/";
		}
	}
});

//document.getElementById('logoutBtn').addEventListener('click', toggleSignIn, false);
//document.getElementById('nav_profile_image').addEventListener('click', loadProfile, false);
//document.getElementById('nav_profile_title').addEventListener('click', loadProfile, false);

function logOut() {
	firebase.auth().signOut();
	window.location.replace("/");
}


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
		window.location.replace("/");
		// [END signout]
//	}
	// [START_EXCLUDE]
//	document.getElementById('quickstart-sign-in').disabled = true;
	// [END_EXCLUDE]
}



//
//function loadProfile() {
//    window.open("/profile.html","_self");
//}










