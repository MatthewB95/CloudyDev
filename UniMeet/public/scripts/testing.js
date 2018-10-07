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

        document.getElementById("logOutButton").addEventListener("click", logOut);

        function logOut() {
            firebase.auth().signOut();
            window.location.replace("/");
        }

    } else {
        window.location.replace("/");
    }
});


function addUsers() {

    var email;

    for (var i = 0; i < 100; i++) {

        email = i + "@unimeet.com";

        firebase.auth().signInWithEmailAndPassword(email, "password")
            .then(function(user) {
                console.log("Created Account: " + email);
                // Success
            })
            .catch(function(error) {
                console.log("Failed to create account.");
                // Error Handling
        });
    }

}

