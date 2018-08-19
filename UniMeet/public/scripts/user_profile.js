// JavaScript Document

var config = {
	apiKey: "AIzaSyAGev97x416_eJKbO4NmbKesjtZyl8OSfs",
	authDomain: "unimeet-92f9f.firebaseapp.com",
	databaseURL: "https://unimeet-92f9f.firebaseio.com",
	projectId: "unimeet-92f9f",
	storageBucket: "unimeet-92f9f.appspot.com",
	messagingSenderId: "776036726314"
};
firebase.initializeApp(config);

const firestore = firebase.firestore();
const settings = { /* your settings... */
	timestampsInSnapshots: true
};
firestore.settings(settings);

firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		// User is signed in.
		var user = firebase.auth().currentUser;
		if (user != null) {

			document.getElementById('profilePicture').src = user.photoURL;

			const docRef = firestore.doc("student/" + user.uid);

			docRef.get().then(function (doc) {
				if (doc && doc.exists) {
					const myData = doc.data();
					document.getElementById('profileNameLabel').innerHTML = myData.name;
					populateCollectionView();
				}
			});

		} else {
			// No user is signed in.
			// Redirect them to home page
			document.location.href = "/";
		}
	} else {
		alert('You must sign in');
	}
});







function populateCollectionView() {

	var i;
	var containingCard;
	var card;
	var uniLabel;
	var courseLabel;

	for (i = 0; i < 4; i++) {

		containingCard = document.createElement('div');
					containingCard.setAttribute('class', 'col-lg-3 col-md-4 col-sm-6 text-center');

		card = document.createElement('div');
		card.setAttribute('class', 'course_card');
		containingCard.appendChild(card);

		uniLabel = document.createElement('h1');
		uniLabel.setAttribute('class', 'course_uni_title');
		uniLabel.innerHTML = 'RMIT University';
		card.appendChild(uniLabel);
		
		courseLabel = document.createElement('h1');
		courseLabel.setAttribute('class', 'course_title');
		courseLabel.innerHTML = 'iPhone Software Engineering (044450)';
		card.appendChild(courseLabel);

		document.getElementById("enrolledCoursesCollectionView").appendChild(containingCard);

	}

}
