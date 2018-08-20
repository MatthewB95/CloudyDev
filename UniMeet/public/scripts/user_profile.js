const firestore = firebase.firestore();
const settings = { /* your settings... */
	timestampsInSnapshots: true
};
firestore.settings(settings);

var uid = window.localStorage.getItem("selectedProfileID");


function loadProfile() {
	const docRef = firestore.doc("student/" + uid);

		docRef.get().then(function (doc) {
			if (doc && doc.exists) {
				const myData = doc.data();
				document.getElementById('profileNameLabel').innerHTML = myData.name;
				populateCollectionView();
			}
		});
}


function populateCollectionView() {

	var i;
	var containingCard;
	var card;
	var uniLabel;
	var courseLabel;

	for (i = 0; i < 4; i++) {

		containingCard = document.createElement('div');
		containingCard.setAttribute('class', 'col-lg-3 col-md-4 col-sm-6 text-center');

		card = document.createElement('div');
		card.setAttribute('class', 'course_card');
		containingCard.appendChild(card);

		uniLabel = document.createElement('h1');
		uniLabel.setAttribute('class', 'course_uni_title');
		uniLabel.innerHTML = 'RMIT University';
		card.appendChild(uniLabel);

		courseLabel = document.createElement('h1');
		courseLabel.setAttribute('class', 'course_title');
		courseLabel.innerHTML = 'iPhone Software Engineering (044450)';
		card.appendChild(courseLabel);

		document.getElementById("enrolledCoursesCollectionView").appendChild(containingCard);

	}

}

window.onload = function () {
	loadProfile();	
}
