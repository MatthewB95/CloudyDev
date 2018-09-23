// JavaScript Document
const firestore = firebase.firestore();
const settings = { /* your settings... */
	timestampsInSnapshots: true
};
firestore.settings(settings);
firebase.auth().onAuthStateChanged(function (user) {
	
	document.getElementById('profilePreview').style.display = "block";
	document.getElementById('editProfileView').style.display = "block";
	document.getElementById('friendRequestListView').style.display = "none";
	document.getElementById('blockListView').style.display = "none";
	
	if (user) {
		// User is signed in.
		var user = firebase.auth().currentUser;
		var name, email, photoUrl, uid;
		if (user != null) {
			name = user.displayName;
			email = user.email;
			photoUrl = user.photoURL;
			uid = user.uid; // The user's ID, unique to the Firebase project. Do NOT use
			// this value to authenticate with your backend server, if
			// you have one. Use User.getToken() instead.
		}
		// Set profile picture
		document.getElementById('profilePicture').src = photoUrl;
		
		document.getElementById('editProfileMenuItem').addEventListener('click', function() {
			document.getElementById('profilePreview').style.display = "block";
			document.getElementById('editProfileView').style.display = "block";
			document.getElementById('friendRequestListView').style.display = "none";
			document.getElementById('blockListView').style.display = "none";
		});
		
		document.getElementById('friendRequestMenuItem').addEventListener('click', function() {
			document.getElementById('profilePreview').style.display = "none";
			document.getElementById('editProfileView').style.display = "none";
			document.getElementById('friendRequestListView').style.display = "block";
			document.getElementById('blockListView').style.display = "none";
		});
		
		document.getElementById('blockMenuItem').addEventListener('click', function() {
			document.getElementById('profilePreview').style.display = "none";
			document.getElementById('editProfileView').style.display = "none";
			document.getElementById('friendRequestListView').style.display = "none";
			document.getElementById('blockListView').style.display = "block";
		});

		// Designate Firestore documents to write to.
		// Needs to be made secure later on by requesting token instead of UID.
		const docRef = firestore.doc("student/" + uid);

		//        const nameOutput = document.querySelector("#nameOutput");
		//        const universityOutput = document.querySelector("#universityOutput");
		//        const degreeOutput = document.querySelector("#degreeOutput");
		const nameTextField = document.querySelector("#nameField");
		const universityTextField = document.querySelector("#universityField");
		const degreeTextField = document.querySelector("#degreeField");
		const saveButton = document.querySelector("#saveButton");
		// Autofills form fields with the user's existing profile information 
		docRef.get().then(function (doc) {
			if (doc && doc.exists) {
				const myData = doc.data();

				if (myData.profile_image == null) {
					document.getElementById('profilePicture').src = '/../images/profile_placeholder.png';
				}
				else {
					document.getElementById('profilePicture').src = myData.profile_image;
				}
				//				document.getElementById('ageField').value = myData.age.toString();
				document.getElementById('nameField').value = myData.name;
				document.getElementById('bioField').value = myData.bio;
				//                document.getElementById('universityField').value = myData.university;
				//                document.getElementById('degreeField').value = myData.current_degree;
				document.getElementById('studentEmailField').value = myData.studentEmail;
				document.getElementById('personalEmailField').value = myData.personalEmail;
				document.getElementById('mobileField').value = myData.mobile;

				console.log(myData.course_1);
				document.getElementById('subject1').value = myData.course_1;
				document.getElementById('subject2').value = myData.course_2;
				document.getElementById('subject3').value = myData.course_3;
				document.getElementById('subject4').value = myData.course_4;
			}
		}).catch(function (error) {
			console.log("Failed to retrieve error: ", error)
		});

		// Updates the user's profile information when they hit save
		document.getElementById("saveProfile").addEventListener("click", function () {
			const nameToSave = document.getElementById('nameField').value.trim();
			const bioToSave = document.getElementById('bioField').value.trim();
			const studentEmailToSame = document.getElementById('studentEmailField').value.trim();
			const personalEmailToSave = document.getElementById('personalEmailField').value.trim();
			const mobileToSave = document.getElementById('mobileField').value.trim();
			//            const universityToSave = universityTextField.value.trim();
			//            const degreeToSave = degreeTextField.value.trim();
			//            console.log("Saving Name: " + nameToSave + ", University: " + universityToSave + ", Degree: " + degreeToSave + " to Firestore");
			docRef.update({
				name: nameToSave,
				bio: bioToSave,
				studentEmail: studentEmailToSame,
				personalEmail: personalEmailToSave,
				mobile: mobileToSave
					//                university: universityToSave,
					//                current_degree: degreeToSave
				}).then(function () {
					console.log("Successfully Updated Profile.");
				}).catch(function (error) {
					console.log("Profile Update Error: ", error);
				});
			})

		// Check for Firestore changes and update text labels
		var getRealTimeUpdates = function () {
			docRef.onSnapshot(function (doc) {
				if (doc && doc.exists) {
					const myData = doc.data();
					//              nameOutput.innerText = myData.name;
					//              universityOutput.innerText = myData.university;
					//              degreeOutput.innerText = myData.current_degree;
				}
			});
		}

		// Retrieves the latest matches from Firestore 
		function loadRequestsAndBlocked() {
			console.log("Retrieving friends");
			const docRef = firestore.doc("friends/" + uid);
			docRef.get().then(function (doc) {
				if (doc && doc.exists) {
					const friendData = doc.data();
					populateCollectionView(friendData);
					console.log("Retrieved friends: ", friendData);
					return;
				}
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
			var friendShortcut;
			var moreShortcut;

			// Remove any existing matches from the page
			document.getElementById("friendRequestView").innerHTML = "";
			document.getElementById("blockedUsersView").innerHTML = "";

			for (var key in matchedData) {

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

						if (matchedData[myData.uid] == 2) {
							document.getElementById("friendRequestView").appendChild(containingCard);
						} else if (matchedData[myData.uid] == 6 || matchedData[myData.uid] == 7) {
							document.getElementById("blockedUsersView").appendChild(containingCard);
						}
					}
				}).catch(function (error) {
					console.log("Failed to retrieve error: ", error);
				});
			}
		}
		
		
		function selectMatchedProfile(uid) {
			window.localStorage.setItem("selectedProfileID", uid);
			window.open("/user_profile.html", "_self");
		}

		loadRequestsAndBlocked();

		// Continuously check for updates
		getRealTimeUpdates();
	} else {
		// No user is signed in.
		// Redirect them to home page
		document.location.href = "/";
	}
});







