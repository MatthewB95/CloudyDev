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

		// Check if user's email has been verified
		if (user.emailVerified == false) {
			window.open("/verify.html","_self");
        }

		// Check for Firestore changes and update match list
		var getRealTimeMatches = function () {
			console.log("Retrieving matches");
			const docRef = firestore.doc("match/" + uid);
			docRef.onSnapshot(function (doc) {
				if (doc && doc.exists) {
					const matchData = doc.data();
					// Retrieve matches if it's the first time loading the page
					if (version == 0) {
						version = matchData.version;
						populateCollectionView(matchData);
						console.log("Retrieved Matches.");
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
			console.log("Updating matches");
			const docRef = firestore.doc("match/" + uid);
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
					console.log("Updated Matches: ", matchData);
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

function populateCollectionView(matchData) {

	var i;
	var containingCard;
	var card;
	var profileImage;
	var nameLabel;
	var degreeLabel;
	var infoLabel;
	var percentageLabel;

	// Remove any existing matches from the page
	document.getElementById("matchedCollectionView").innerHTML = "";

	var sortedMatches = sortObjects(matchData);

	console.log("Sorted Matches: ", sortedMatches);

	for (var key in sortedMatches) {

		if (key != "version") {

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
					
					percentageLabel = document.createElement('h3');
					percentageLabel.setAttribute('class', 'profile_info_title primaryColour');
					// Round match percentage to nearest whole number
					var matchPercentage = Math.round(sortedMatches[myData.uid]);
					percentageLabel.innerHTML = matchPercentage + "% matched";
					card.appendChild(percentageLabel);

					document.getElementById("matchedCollectionView").appendChild(containingCard);

				}
			}).catch(function (error) {
				console.log("Failed to retrieve error: ", error);
			});

		}
	}
	// Fade all collections onto page
	$("#matchedCollectionView").fadeIn(1250);
}


function selectMatchedProfile(uid) {
	window.localStorage.setItem("selectedProfileID", uid);
	window.open("/user_profile.html", "_self");
}

// Sort an object numerically
function sortProperties(obj) {
  
	var sortable=[];
	for(var key in obj)
		if(obj.hasOwnProperty(key))
			sortable.push([key, obj[key]]); // each item is an array in format [key, value]
	
	// Sort items by value
	sortable.sort(function(a, b)
	{
		//return a[1]-b[1]; For ascending order
	  return b[1]-a[1]; // Compare numbers (Descending order)
	});
	return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

// Turn sorted array back into object
function sortObjects(objects) {

    var newObject = {};

    var sortedArray = sortProperties(objects);
    for (var i = 0; i < sortedArray.length; i++) {
        var key = sortedArray[i][0];
        var value = sortedArray[i][1];

        newObject[key] = value;
    }

    return newObject;

}