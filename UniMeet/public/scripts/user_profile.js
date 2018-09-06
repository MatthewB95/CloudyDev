const firestore = firebase.firestore();
const settings = { /* your settings... */
	timestampsInSnapshots: true
};
firestore.settings(settings);

var uid = window.localStorage.getItem("selectedProfileID");




firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		loadProfile();

		$('input:radio[name="rating"]').change(function() {
			var getRating = $(this).val();
			var rating = parseInt(getRating, 10);
			if (rating >= 1 && rating <= 5) {
				sendRating(rating, user.uid);
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

		document.getElementById('friendBtn').innerHTML = "Add Friend";
		document.getElementById('friendBtn').addEventListener('click', friendProfile, false);

		firestore.doc("friends/" + currentUser.uid).get().then(function (doc) {
			var friends = doc.data();
			for (var friendID in friends) {
				if (friendID == uid) {
					document.getElementById('friendBtn').innerHTML = "Unfriend";
					document.getElementById('friendBtn').addEventListener('click', unfriendProfile, false);
					break;
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
							containingCard.setAttribute('class', 'col-lg-3 col-md-4 col-sm-6 text-center');

							card = document.createElement('div');
							card.setAttribute('class', 'course_card');
							containingCard.appendChild(card);

							uniLabel = document.createElement('h1');
							uniLabel.setAttribute('class', 'course_uni_title');
							uniLabel.innerHTML = student.university;
							card.appendChild(uniLabel);

							courseLabel = document.createElement('h1');
							courseLabel.setAttribute('class', 'course_title');
							courseLabel.innerHTML = student[key];
							card.appendChild(courseLabel);

							document.getElementById("enrolledCoursesCollectionView").appendChild(containingCard);
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

			if (student.averageRating == 0 || student.averageRating == null) {
				document.getElementById("averageRating").innerHTML = "No ratings yet";
			}
			else {
				document.getElementById("averageRating").innerHTML = "Rating: " + student.averageRating;
			}
		}
	});
}




function messageProfile(uid) {
	window.localStorage.setItem("selectedProfileID", uid);
	window.open("/user_messaging.html", "_self");
}






function friendProfile() {
	
	document.getElementById('friendBtn').disabled = true;
	
	var currentUser = firebase.auth().currentUser;
	if (currentUser != null) {
		firestore.doc("friends/" + currentUser.uid).set(
			{[uid]: "0"},
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


	function unfriendProfile() {

		document.getElementById('friendBtn').disabled = true;

		var currentUser = firebase.auth().currentUser;
		if (currentUser != null) {
			firestore.doc("friends/" + currentUser.uid).update({
				[uid]: firebase.firestore.FieldValue.delete()
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


	// Get and calculate the average rating for a user
	function calculateAverageRating() {
		var averageRating = 0;

        firestore.doc("ratings/" + uid).get().then(function (doc) {
            if (doc && doc.exists) {
                const ratings = doc.data();

                // Calculate average
                var sum = 0;
                var count = 0;
                for (var key in ratings) {
                	sum+= ratings[key];
                	count++;
                }
                // Average rating to 1 decimal place
                averageRating = Math.round( (sum/count) * 10) / 10;

                if (averageRating == 0 || averageRating == null) {
					document.getElementById("averageRating").innerHTML = "No ratings yet";
				}
				else {
					document.getElementById("averageRating").innerHTML = "Rating: " + averageRating;
				}

                updateStudentAverageRating(averageRating);
            }
        }).catch(function (error) {
            console.log("Failed to retrieve ratings: ", error)
        });
	}

	// Updates rating for a user in database
	function sendRating(rating, currentUserID) {

		if (rating > 5 && rating < 1) {
			console.log("Invalid rating.");
			return;
		}

		console.log("Rating " + document.title + ": " + rating);
		firestore.doc("ratings/" + uid).set({
			[currentUserID]: rating,
		},{merge: true}
		).then(function() {
			calculateAverageRating();
		}).catch(function (error) {
			console.log("Rating Update Error: ", error);
		});
	}

	// Update the student's average rating
	function updateStudentAverageRating(averageRating) {
		firestore.doc("student/" + uid).set({
			averageRating: averageRating,
		},{merge: true}
		).then(function() {
			console.log("Successfully Updated Rating.");
		}).catch(function (error) {
			console.log("Rating Update Error: ", error);
		});
	}