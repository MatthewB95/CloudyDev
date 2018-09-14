const firestore = firebase.firestore();
const settings = { /* your settings... */
	timestampsInSnapshots: true
};
firestore.settings(settings);

var uid = window.localStorage.getItem("selectedProfileID");


firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		loadProfile();
		loadRatings(user.uid);

		$('input:radio[name="rating"]').change(function() {
			var getRating = $(this).val();
			var rating = parseInt(getRating, 10);
			if (rating >= 1 && rating <= 5) {
				$('input:radio[name="rating"]').attr('disabled', true);
				$(".star-rating").css('opacity', '.5');
				rateStudentFirebase(user.uid, uid, rating);
			}
		});

	} else {
		window.location.replace("/");
	}
});


function loadProfile() {
	const docRef = firestore.doc("student/" + uid);
	getStudent(docRef);

	checkFriend();
	document.getElementById('messageBtn').addEventListener('click', function() {
		messageProfile(uid);
	});
}



function checkFriend() {
	
	var currentUser = firebase.auth().currentUser;
	if (currentUser != null) {

		var friendButton = document.getElementById('friendBtn');
		var rejButton = document.getElementById('rejBtn');

		friendButton.innerHTML = "Add Friend";
		friendButton.addEventListener('click', addFriend, false);

		rejButton.innerHTML = "Block User";
		rejButton.addEventListener('click', blkUser, false);

		firestore.doc("friends/" + currentUser.uid).get().then(function (doc) {
			var friends = doc.data();
			for (var friendID in friends) {
				if (friendID == uid) {

					// Display the Your Rating section on page
					document.getElementById("yourRatingText").style.display = "block";
					document.getElementById("yourRating").style.display = "block";

					friendButton.removeEventListener('click', addFriend, false);
					friendButton.removeEventListener('click', unfriend, false);
					friendButton.removeEventListener('click', acceptFriend, false);
					rejButton.removeEventListener('click', rejUser, false);
					//rejButton.removeEventListener('click', blkUser, false);

					if (friends[friendID] == 0 || friends[friendID] == 5 || friends[friendID] == 3) {
						friendButton.innerHTML = "Add Friend";
						friendButton.addEventListener('click', addFriend, false);

						rejButton.innerHTML = "Block User";
						rejButton.addEventListener('click', blkUser, false);

						return;
					}
					else if (friends[friendID] == 4) {
						friendButton.innerHTML = "Unfriend";
						friendButton.addEventListener('click', unfriend, false);
						rejButton.innerHTML = "";
						rejButton.removeEventListener('click', blkUser, false);
						return;
					}
					else if (friends[friendID] == 1) {
						friendButton.innerHTML = "Friend Request Sent";
						rejButton.innerHTML = "";
						rejButton.removeEventListener('click', blkUser, false);
						// Need option to take request away
						return;
					}
					else if (friends[friendID] == 2) {
						friendButton.innerHTML = "Accept Friend Request";
						friendButton.addEventListener('click', acceptFriend, false);
						// Need option to reject friend
						rejButton.innerHTML = "Reject Friend Request";
						rejButton.addEventListener('click', rejUser, false);
						return;
					}
					else if (friends[friendID] == 6){
						rejButton.innerHTML = "UnBlock user";
						rejButton.addEventListener('click', unBlkUser, false);
						return;
					}
				}
			}
		})
	}
}

function getStudent(docRef) {

	docRef.get().then(function (doc) {
		if (doc && doc.exists) {
			const student = doc.data();

			var courses;

			for (var key in student) {
				if (key.includes("course_")) {
					if (student.hasOwnProperty(key)) {
						if (student[key] != null) {

							containingCard = document.createElement('div');
							containingCard.setAttribute('class', 'col-lg-4 col-md-6 col-sm-12 text-center customRow');

							card = document.createElement('div');
							card.setAttribute('class', 'course_card');
							containingCard.appendChild(card);

							uniLabel = document.createElement('h1');
							uniLabel.setAttribute('class', 'course_uni_title');
							uniLabel.innerHTML = student.university;
							card.appendChild(uniLabel);

							courseLabel = document.createElement('h1');
							courseLabel.setAttribute('class', 'course_title left');
							courseLabel.innerHTML = student[key];
							card.appendChild(courseLabel);

							document.getElementById("enrolledCoursesCollectionView").appendChild(containingCard);
						}

					}
				} else if (key.includes("interest_")) {
					if (student.hasOwnProperty(key)) {
						if (student[key] != null) {
							containingCard = document.createElement('div');
							containingCard.setAttribute('class', 'col-lg-3 col-md-4 col-sm-6 text-center customRow');

							card = document.createElement('div');
							card.setAttribute('class', 'course_card');
							containingCard.appendChild(card);
							
							courseLabel = document.createElement('h1');
							courseLabel.setAttribute('class', 'course_title center');
							courseLabel.innerHTML = student[key];
							card.appendChild(courseLabel);

							document.getElementById("interestsCollectionView").appendChild(containingCard);
						}
					}
				}
			}

			document.title = student.name;

			document.getElementById('profileNameLabel').innerHTML = student.name;
			
			if (student.profile_image == null) {
				document.getElementById('profilePicture').src = '/../images/white_profile_placeholder.png';
			}
			else {
				document.getElementById('profilePicture').src = student.profile_image;
			}

			
			document.getElementById('bioLabel').innerHTML = student.bio;

			document.getElementById('ageLabel').innerHTML = "Age: " + student.age + " years old";
			document.getElementById('uniLabel').innerHTML = "University: " + student.university;
			document.getElementById('yearLabel').innerHTML = "Year: " + student.uniYear;

			document.getElementById('studentEmail').innerHTML = student.studentEmail;
			document.getElementById('studentEmail').addEventListener('click', function () {
				redirectEmail(student.studentEmail);
			});

			document.getElementById('personalEmail').innerHTML = student.personalEmail;
			document.getElementById('personalEmail').addEventListener('click', function () {
				redirectEmail(student.personalEmail);
			});

			document.getElementById('mobile').innerHTML = student.mobile;
		}
	});
}


function messageProfile(uid) {
	window.localStorage.setItem("selectedProfileID", uid);
	window.open("/messaging.html", "_self");
}


function updateFriendStatus(status) {
	document.getElementById('friendBtn').disabled = true;

	var currentUser = firebase.auth().currentUser;

	const data = {
		uid   : currentUser.uid,
		tuid  : uid,
		status : status
	};

	var friendStatus = firebase.functions().httpsCallable('friendStatus');
	friendStatus(data).then(function(result) {
		console.log("FIREBASE: Successfully updated friend status.");
		checkFriend();
		document.getElementById('friendBtn').disabled = false;
	}).catch(function(error) {
		var code = error.code;
		var message = error.message;
		var details = error.details;
		console.error("FIREBASE: Failed to update friend status.", error);
		document.getElementById('friendBtn').disabled = false;
	});
}

// Sends friend request
function addFriend() {
	updateFriendStatus(1);
}

// Removes friend
function unfriend() {
	updateFriendStatus(5);
}

// Accepts friend request
function acceptFriend() {
	updateFriendStatus(4);
}

// Rejects a friend request
function rejUser() {
	updateFriendStatus(3);
}

// Blocks a user
function blkUser(){
	updateFriendStatus(6);
}

//unBlocks a user
function unBlkUser(){
	updateFriendStatus(7);
}


// Switching this to backend
function friendProfile() {
	
	document.getElementById('friendBtn').disabled = true;

	var currentUser = firebase.auth().currentUser;
	if (currentUser != null) {
		firestore.doc("friends/" + currentUser.uid).set(
			{[uid]: 0},
			{merge: true}
			).then(function () {
				console.log("Document successfully written!");
				checkFriend();
				document.getElementById('friendBtn').disabled = false;
			}).catch(function (error) {
				console.error("Error writing document: ", error);
				document.getElementById('friendBtn').disabled = false;
			});
		}
	}

// Switching this to backend
function unfriendProfile() {

	document.getElementById('friendBtn').disabled = true;

	var currentUser = firebase.auth().currentUser;
	if (currentUser != null) {
		firestore.doc("friends/" + currentUser.uid).update({
			[uid]: 5
		}).then(function () {
			console.log("Value Removed");
			checkFriend();
			document.getElementById('friendBtn').disabled = false;
		}).catch(function (error) {
			console.error("Error writing document: ", error);
			document.getElementById('friendBtn').disabled = false;
		});
	}
}


function redirectEmail(email) {
	window.location.href = "mailto:" + email + "?Subject=Hello from uniMeet!";
}


// Displays the user's average rating in stars
function displayAverageStars(averageRating) {
	var roundedRating = Math.round(averageRating);
	document.getElementById(roundedRating).checked = true;
}


// Load and display reviews for user
function loadRatings(currentUserID) {
	var averageRating = 0;

	firestore.doc("ratings/" + uid).get().then(function (doc) {
		if (doc && doc.exists) {
			const ratings = doc.data();
            // Calculate average rating
            var sum = 0;
            var count = 0;
            for (var key in ratings) {
            	sum+= ratings[key];
            	count++;
               	// If current user has already rated this person, show their previous rating
               	if (key == currentUserID) {
               		document.getElementById("star-" + ratings[key]).checked = true;
               	}
               }
            // Average rating to 1 decimal place
            averageRating = Math.round( (sum/count) * 10) / 10;

            if (averageRating == 0 || averageRating == null) {
            	document.getElementById("averageRating").innerHTML = "No ratings yet";
            }
            else {
            	displayAverageStars(averageRating);
            	if (count == 1) {
            		document.getElementById("averageRating").innerHTML = averageRating + " Stars | " + count + " Rating";
            	}
            	else {
            		document.getElementById("averageRating").innerHTML = averageRating + " Stars | " + count + " Ratings";
            	}

            }
        }
    }).catch(function (error) {
    	console.log("Failed to retrieve ratings: ", error)
    });
}


// Uses Firebase functions to submit ratings
function rateStudentFirebase(currentUserID, uid, rating) {
	var rateStudent = firebase.functions().httpsCallable('rateStudent');
	console.log("Current User: " + currentUserID);
	console.log("Target User: " + uid);
	console.log("Stars: " + rating);
	ratingInt = parseInt(rating);

	const data = {
		uid   : currentUserID,
		tuid  : uid,
		stars : ratingInt
	};

	rateStudent(data).then(function(result) {
		console.log("FIREBASE: Successfully updated rating.");
		$('input:radio[name="rating"]').attr('disabled', false);
		$(".star-rating").css('opacity', '1');
		// Return Average rating and total number of reviews

		displayAverageStars(result.data.averageRating);
		if (result.data.count == 1) {
			document.getElementById("averageRating").innerHTML = result.data.averageRating + " Stars | " + result.data.count + " Rating";
		}
		else {
			document.getElementById("averageRating").innerHTML = result.data.averageRating + " Stars | " + result.data.count + " Ratings";
		}
	}).catch(function(error) {
		var code = error.code;
		var message = error.message;
		var details = error.details;
		console.error("FIREBASE: Failed to update rating.", error);
		$('input:radio[name="rating"]').attr('disabled', false);
		$(".star-rating").css('opacity', '1');
	});
}