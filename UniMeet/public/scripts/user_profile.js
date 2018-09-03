const firestore = firebase.firestore();
const settings = { /* your settings... */
	timestampsInSnapshots: true
};
firestore.settings(settings);

var uid = window.localStorage.getItem("selectedProfileID");




firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		loadProfile();
	} else {
		window.location.replace("/");
	}
});









function loadProfile() {
	const docRef = firestore.doc("student/" + uid);
	getStudent(docRef);

	document.getElementById('favouriteBtn').disabled = false;


	checkFavourite();
}



function checkFavourite() {
	
	var currentUser = firebase.auth().currentUser;
	if (currentUser != null) {

		document.getElementById('favouriteBtn').innerHTML = "Favourite";
		document.getElementById('favouriteBtn').addEventListener('click', favouriteProflile, false);

		firestore.doc("favourites/" + currentUser.uid).get().then(function (doc) {
			var favourites = doc.data();
			for (var favId in favourites) {
				if (favId == uid) {
					document.getElementById('favouriteBtn').innerHTML = "Unfavourite";
					document.getElementById('favouriteBtn').addEventListener('click', unfavouriteProflile, false);
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



function favouriteProflile() {
	
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


function unfavouriteProflile() {
	
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
