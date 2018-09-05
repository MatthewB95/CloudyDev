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

		// Retrieves the latest matches from Firestore 
		function refreshMatches() {
			console.log("Retrieving friends");
			const docRef = firestore.doc("friends/" + uid);
			docRef.get().then(function (doc) {
				if (doc && doc.exists) {
					const matchData = doc.data();
					// Fade current matches out and replace with new list
					$("#matchedCollectionView").fadeOut(500, function () {
						populateCollectionView(matchData);
					});
					console.log("Retrieved friends: ", matchData);
					return;
				}
			});
		}

		refreshMatches();

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
	var friendShortcut;
	var moreShortcut;

	// Remove any existing matches from the page
	document.getElementById("matchedCollectionView").innerHTML = "";

	for (var key in Object(matchedData)) {

		console.log("Loading Profile " + key);
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
				if (myData.profile_image == null) {
					profileImage.src = '../images/profile_placeholder.png';
				}
				else {
					profileImage.src = myData.profile_image;
				}
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
				messageShortcut.src = "images/activeFriend.png";
				messageShortcut.setAttribute('class', 'shortcut_item');
				shortcutsContainer.appendChild(messageShortcut);

				friendShortcut = document.createElement('img');
				friendShortcut.src = "images/message.png";
				friendShortcut.setAttribute('class', 'shortcut_item');
				shortcutsContainer.appendChild(friendShortcut);

				moreShortcut = document.createElement('img');
				moreShortcut.src = "images/more.png";
				moreShortcut.setAttribute('class', 'shortcut_item');
				shortcutsContainer.appendChild(moreShortcut);


				document.getElementById("matchedCollectionView").appendChild(containingCard);

			}
		}).catch(function (error) {
			console.log("Failed to retrieve error: ", error);
		});

	}
	// Fade all collections onto page
	$("#matchedCollectionView").fadeIn(1250);
}


function selectMatchedProfile(uid) {
	window.localStorage.setItem("selectedProfileID", uid);
	window.open("/user_profile.html", "_self");
}
