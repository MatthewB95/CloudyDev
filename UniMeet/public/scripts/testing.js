// JavaScript Document

const firestore = firebase.firestore();
const settings = { /* your settings... */
    timestampsInSnapshots: true
};
firestore.settings(settings);

var uid;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

        var user = firebase.auth().currentUser;
        uid = user.uid;

        // Add button listeners
        document.getElementById("addUsersButton").addEventListener("click", addUsers);
        document.getElementById("updateUsersButton").addEventListener("click", updateUsers);

        document.getElementById("logOutButton").addEventListener("click", logOut);

        function logOut() {
            firebase.auth().signOut();
            window.location.replace("/");
        }

    } else {
        window.location.replace("/");
    }
});

// Creates new users in Firebase
function addUsers() {

    var email;
    var password = "password";

    for (var i = 0; i < 1000; i++) {

        email = i + "@unimeet.com";

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function(user) {
                console.log("Created Account: " + email);
                // Success
            })
            .catch(function(error) {
                console.error("Failed to create account: ", error);
                // Error Handling
        });
    }

}

// Updates testing accounts with preset values
function updateUsers() {

    firestore.collection("student").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            const thisUser = doc.data();

            if (thisUser.university == null) {
                firestore.doc("student/" + thisUser.uid).update({
                    name: "Testing Account",
                    age: 21,
                    averageRating: 3.5,
                    bio: "Hi I'm a testing account",
                    studentEmail: "email@unimeet.com",
                    personalEmail: "myEmail@gmail.com",
                    mobile: "0400 123 456",
                    university: "RMIT University",
                    current_degree: "Bachelor of Information Technology",
                    course_1: "Programming Project 1",
                    course_2: "Networking 1",
                    course_3: "Web Programming",
                    course_4: "User-centred Design",
                    interest_1: "Art",
                    interest_2: "Movies",
                    interest_3: "Reading"
                }).then(function () {
                    console.log("Successfully Updated Profile.");
                }).catch(function (error) {
                    console.log("Profile Update Error: ", error);
                });
            }
        });
    });



}



