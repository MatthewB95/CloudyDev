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

		document.getElementById('editProfileMenuItem').addEventListener('click', function () {
			document.getElementById('profilePreview').style.display = "block";
			document.getElementById('editProfileView').style.display = "block";
			document.getElementById('friendRequestListView').style.display = "none";
			document.getElementById('blockListView').style.display = "none";
		});

		document.getElementById('friendRequestMenuItem').addEventListener('click', function () {
			document.getElementById('profilePreview').style.display = "none";
			document.getElementById('editProfileView').style.display = "none";
			document.getElementById('friendRequestListView').style.display = "block";
			document.getElementById('blockListView').style.display = "none";
		});

		document.getElementById('blockMenuItem').addEventListener('click', function () {
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

				document.getElementById('profilePicture').src = '/../images/profile_placeholder.png';
				if (myData.profile_image != null) {
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


				firestore.collection("degree").get().then(function (querySnapshot) {
					querySnapshot.forEach(function (doc) {
						const degrees = doc.data();
						// Add the name of each university to list of options
						document.getElementById('university').append(new Option(doc.id, doc.id));
					});
				});

				const degreesRef = firestore.doc("degree/" + myData.university);
				degreesRef.get().then(function (doc) {
					if (doc && doc.exists) {
						const degrees = doc.data();
						var degreeArray = [];
						console.log("Retrieved degrees: ", Object.values(degrees));

						// Fill in the degree drop-down list with the new values
						for (var key in degrees) {
							document.getElementById('degree').append(new Option(degrees[key], degrees[key]));
							degreeArray.push(degrees[key]);
						}
						var index1 = degreeArray.indexOf(myData.current_degree);
						document.getElementById('degree').selectedIndex = index1;
					}
				}).catch(function (error) {
					console.log("Failed to retrieve error: ", error)
				});


				const subjectsRef = firestore.doc("course/" + myData.university);
				subjectsRef.get().then(function (doc) {
					if (doc && doc.exists) {
						var subjectArray = [];
						const subjects = doc.data();
						for (var key in subjects) {
							document.getElementById('subject1').append(new Option(subjects[key], subjects[key]));
							document.getElementById('subject2').append(new Option(subjects[key], subjects[key]));
							document.getElementById('subject3').append(new Option(subjects[key], subjects[key]));
							document.getElementById('subject4').append(new Option(subjects[key], subjects[key]));
							subjectArray.push(subjects[key]);
						}
						var index1 = subjectArray.indexOf(myData.course_1);
						document.getElementById('subject1').selectedIndex = index1;

						var index2 = subjectArray.indexOf(myData.course_2);
						document.getElementById('subject2').selectedIndex = index2;

						var index3 = subjectArray.indexOf(myData.course_3);
						document.getElementById('subject3').selectedIndex = index3;

						var index4 = subjectArray.indexOf(myData.course_4);
						document.getElementById('subject4').selectedIndex = index4;

					}
				}).catch(function (error) {
					console.log("Failed to retrieve error: ", error)
				});




				const interestsRef = firestore.doc("interests/interests");
				interestsRef.get().then(function (doc) {
					if (doc && doc.exists) {
						var interestsArray = [];
						const interests = doc.data();
						console.log("Values: ", Object.values(interests));
						console.log("Count: ", Object.values(interests).length);

						// Add each subject to the drop down list
						for (var key in interests) {
							console.log("Key: ", key, " Value: ", interests[key]);
							document.getElementById('interest1').append(new Option(interests[key], interests[key]));
							document.getElementById('interest2').append(new Option(interests[key], interests[key]));
							document.getElementById('interest3').append(new Option(interests[key], interests[key]));
							interestsArray.push(interests[key]);
						}
						var index1 = interestsArray.indexOf(myData.interest_1);
						document.getElementById('interest1').selectedIndex = index1;

						var index2 = interestsArray.indexOf(myData.interest_2);
						document.getElementById('interest2').selectedIndex = index2;

						var index3 = interestsArray.indexOf(myData.interest_3);
						document.getElementById('interest3').selectedIndex = index3;

					}
				}).catch(function (error) {
					console.log("Failed to retrieve error: ", error)
				});
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
			const universityToSave = document.getElementById('university').value;
			const degreeToSave = document.getElementById('degree').value;
			const course1ToSave = document.getElementById('subject1').value;
			const course2ToSave = document.getElementById('subject2').value;
			const course3ToSave = document.getElementById('subject3').value;
			const course4ToSave = document.getElementById('subject4').value;

			const interest1ToSave = document.getElementById('interest1').value;
			const interest2ToSave = document.getElementById('interest2').value;
			const interest3ToSave = document.getElementById('interest3').value;

			docRef.update({
				name: nameToSave,
				bio: bioToSave,
				studentEmail: studentEmailToSame,
				personalEmail: personalEmailToSave,
				mobile: mobileToSave,
				university: universityToSave,
				current_degree: degreeToSave,
				course_1: course1ToSave,
				course_2: course2ToSave,
				course_3: course3ToSave,
				course_4: course4ToSave,
				interest_1: interest1ToSave,
				interest_2: interest2ToSave,
				interest_3: interest3ToSave
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
						} else {
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
