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
