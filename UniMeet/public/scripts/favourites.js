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
		var getRealTimeMatches = function () {
			console.log("Retrieving favourites");
			const docRef = firestore.doc("favourites/" + uid);
			docRef.onSnapshot(function (doc) {
				if (doc && doc.exists) {
					const matchData = doc.data();
					// Retrieve matches if it's the first time loading the page
					if (version == 0) {
						version = matchData.version;
						populateCollectionView(matchData);
						console.log("Retrieved favourites: ", matchData);
					}
					// Otherwise, listen for any changes in match version number
					else if (matchData.version != version) {
						// Wait 2 seconds for matching to complete before enabling refresh button.
						setTimeout(function () {
							document.getElementById("refreshButton").disabled = false;
						}, 2000);
						return;
					}
				}
			});
		}

		// Retrieves the latest matches from Firestore 
		function refreshMatches() {
			console.log("Updating favourites");
			const docRef = firestore.doc("favourites/" + uid);
			docRef.get().then(function (doc) {
				if (doc && doc.exists) {
					const matchData = doc.data();
					// Disable the refresh button because we have the latest matches
					document.getElementById("refreshButton").disabled = true;
					// Update to latest version number
					version = matchData.version;
					// Fade current matches out and replace with new list
					$("#matchedCollectionView").fadeOut(500, function () {
						populateCollectionView(matchData);
					});
					console.log("Updated favourites: ", matchData);
					return;
				}
			});
		}

		getRealTimeMatches();

		document.getElementById("refreshButton").addEventListener("click", refreshMatches);

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
				profileImage.src = myData.profile_image;
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
				messageShortcut.src = "images/activeFavourite.png";
				messageShortcut.setAttribute('class', 'shortcut_item');
				shortcutsContainer.appendChild(messageShortcut);

				favouriteShortcut = document.createElement('img');
				favouriteShortcut.src = "images/message.png";
				favouriteShortcut.setAttribute('class', 'shortcut_item');
				shortcutsContainer.appendChild(favouriteShortcut);

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