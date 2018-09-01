// JavaScript Document

const firestore = firebase.firestore();
const settings = { /* your settings... */
	timestampsInSnapshots: true
};
firestore.settings(settings);

firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		// User is signed in.
		var user = firebase.auth().currentUser;
		var uid = user.uid;
		var version = 0;

		// Check for Firestore changes and update match list
		var getRealTimeMatches = function() {
			console.log("Retrieving matches");
			const docRef = firestore.doc("match/" + uid);
			docRef.onSnapshot(function(doc) {
				if (doc && doc.exists) {
					const myData = doc.data();
					if (myData.version > version) {
						version = myData.version;
						populateCollectionView(myData);
						console.log("Updated Matches: ", myData);
					}
				}
			});
		}

		getRealTimeMatches();

	} else {
		window.location.replace("/");
	}
});

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
					card.addEventListener('click', function () {
						selectMatchedProfile(myData.uid);
					});
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


function selectMatchedProfile(uid) {
	window.localStorage.setItem("selectedProfileID", uid);
	window.open("/user_profile.html","_self");
}