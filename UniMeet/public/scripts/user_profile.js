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
				updateRating(rating, user.uid);
			}
		});

	} else {
		window.location.replace("/");
	}
});


function loadProfile() {
	const docRef = firestore.doc("student/" + uid);
	getStudent(docRef);

	checkFavourite();
	document.getElementById('messageBtn').addEventListener('click', function() {
		messageProfile(uid);
	});
}



function checkFavourite() {
	
	var currentUser = firebase.auth().currentUser;
	if (currentUser != null) {

		document.getElementById('favouriteBtn').innerHTML = "Favourite";
		document.getElementById('favouriteBtn').addEventListener('click', favouriteProfile, false);

		firestore.doc("favourites/" + currentUser.uid).get().then(function (doc) {
			var favourites = doc.data();
			for (var favId in favourites) {
				if (favId == uid) {
					document.getElementById('favouriteBtn').innerHTML = "Unfavourite";
					document.getElementById('favouriteBtn').addEventListener('click', unfavouriteProfile, false);
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

		}
	});
}




function messageProfile(uid) {
	window.localStorage.setItem("selectedProfileID", uid);
	window.open("/user_messaging.html", "_self");
}






function favouriteProfile() {
	
	document.getElementById('favouriteBtn').disabled = true;
	
	var currentUser = firebase.auth().currentUser;
	if (currentUser != null) {
		firestore.doc("favourites/" + currentUser.uid).set(
			{[uid]: "0"},
			{merge: true}
			).then(function () {
				console.log("Document successfully written!");
				checkFavourite();
				document.getElementById('favouriteBtn').disabled = false;
			}).catch(function (error) {
				console.error("Error writing document: ", error);
				document.getElementById('favouriteBtn').disabled = false;
			});
		}
	}


	function unfavouriteProfile() {

		document.getElementById('favouriteBtn').disabled = true;

		var currentUser = firebase.auth().currentUser;
		if (currentUser != null) {
			firestore.doc("favourites/" + currentUser.uid).update({
				[uid]: firebase.firestore.FieldValue.delete()
			}).then(function () {
				console.log("Value Removed");
				checkFavourite();
				document.getElementById('favouriteBtn').disabled = false;
			}).catch(function (error) {
				console.error("Error writing document: ", error);
				document.getElementById('favouriteBtn').disabled = false;
			});
		}
	}



	function redirectEmail(email) {
		window.location.href = "mailto:" + email + "?Subject=Hello from uniMeet!";
	}

	// INCOMPLETE
	// Get and calculate the average rating for a user
	function getRating() {
		const docRef = firestore.doc("ratings/" + uid);
        docRef.get().then(function (doc) {
            if (doc && doc.exists) {
                const myData = doc.data();
            }
        }).catch(function (error) {
            console.log("Failed to retrieve ratings: ", error)
        });
	}

	// Updates rating for a user in database
	function updateRating(rating, currentUserID) {

		if (rating > 5 && rating < 1) {
			console.log("Invalid rating.");
			return;
		}

		console.log("Rating " + document.title + ": " + rating);
		const docRef = firestore.doc("ratings/" + uid);
		docRef.update({
			[currentUserID]: rating,
		}).then(function() {
			console.log("Successfully Updated Rating.");
		}).catch(function (error) {
			console.log("Rating Update Error: ", error);
		});
	}