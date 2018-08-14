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
		var uid

		if (user != null) {
			loadMatches(user.uid);
		}
	} else {
		alert("User Must Login");
	}
});


function loadMatches(uid) {
	const docRef = firestore.doc("match/" + uid);
	docRef.get().then(function (doc) {
		if (doc && doc.exists) {
			const myData = doc.data();
			console.log("Object: ", myData);
			console.log("Values: ", Object.values(myData));
			console.log("Count: ", Object.values(myData).length);
			populateCollectionView(myData);
		}
	}).catch(function (error) {
		console.log("Failed to retrieve error: ", error)
	});
}


function populateCollectionView(matchedData) {

	var i;
	var containingCard;
	var card;
	var profileImage;
	var nameLabel;
	var degreeLabel;
	var infoLabel;
	var shortcutsContainer;
	var messageShortcut;
	var favouriteShortcut;
	var moreShortcut;

	//var matchedValues = Object.values(matchedData);

	//matchedData.values.count

	//for (var key in matchedData) {

	//	}

	//for (i = 0; i < matchedValues.length; i++) {
	for (var key in Object(matchedData)) {

		if (key != "version") {

			console.log("Loading Profile");
			const docRef = firestore.doc("student/" + key);

			docRef.get().then(function (doc) {
				if (doc && doc.exists) {
					const myData = doc.data();
					console.log("Returning value");

					containingCard = document.createElement('div');
					containingCard.setAttribute('class', 'col-lg-4 col-md-6 col-sm-12 text-center');

					card = document.createElement('div');
					card.setAttribute('class', 'matched_profile_card');
					containingCard.appendChild(card);

					profileImage = document.createElement('img');
					profileImage.setAttribute('class', 'profile_image');
					profileImage.src = "images/purple_profile_placeholder.png";
					card.appendChild(profileImage);

					nameLabel = document.createElement('h1');
					nameLabel.setAttribute('class', 'profile_name_title');
					nameLabel.innerHTML = myData.name;
					card.appendChild(nameLabel);

					degreeLabel = document.createElement('h2');
					degreeLabel.innerHTML = myData.current_degree;
					degreeLabel.setAttribute('class', 'profile_degree_title');
					card.appendChild(degreeLabel);

					infoLabel = document.createElement('h3');
					infoLabel.innerHTML = myData.university;
					infoLabel.setAttribute('class', 'profile_info_title');
					card.appendChild(infoLabel);

					shortcutsContainer = document.createElement('div');
					shortcutsContainer.setAttribute("class", "shortcut_container");
					card.appendChild(shortcutsContainer);

					messageShortcut = document.createElement('img');
					messageShortcut.src = "images/firebase-logo.png";
					messageShortcut.setAttribute('class', 'shortcut_item');
					shortcutsContainer.appendChild(messageShortcut);

					favouriteShortcut = document.createElement('img');
					favouriteShortcut.src = "images/firebase-logo.png";
					favouriteShortcut.setAttribute('class', 'shortcut_item');
					shortcutsContainer.appendChild(favouriteShortcut);

					moreShortcut = document.createElement('img');
					moreShortcut.src = "images/firebase-logo.png";
					moreShortcut.setAttribute('class', 'shortcut_item');
					shortcutsContainer.appendChild(moreShortcut);


					document.getElementById("matchedCollectionView").appendChild(containingCard);

				}
			}).catch(function (error) {
				console.log("Failed to retrieve error: ", error);
			});

		}
	}
}
