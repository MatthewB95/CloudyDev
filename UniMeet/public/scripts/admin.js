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

        // Loads list of interests from database and add them to the drop down-lists
        function loadInterests() {

            // Fade all collections onto page
            $("#todolist-cont").fadeOut(500);

            var interestsList = document.getElementById("task-list");

            // Remove any existing matches from the page
            interestsList.innerHTML = "";

            const interestsRef = firestore.doc("interests/interests");
            interestsRef.get().then(function (doc) {
                if (doc && doc.exists) {
                    const interests = doc.data();
                    console.log("Values: ", Object.values(interests));
                    console.log("Count: ", Object.values(interests).length);

                    // Add each interest to the list
                    for (var key in interests) {
                        $("#task-list").append("<li class='list-group-item _task'><span class='_todo-text'>" + key + "</span>" +
                         "<div class='btn-group pull-right _task-controls' role='group'>" +
                         "<button class='btn btn-light _todo-remove' type='button' value=" + key + " onclick='deleteInterest(this.value)'>" + 
                         "<i class='fa fa-trash'></i></button></div>" +
                         "<div class='clearfix'></div>"
                         );
                    }
                    // Fade all collections onto page
                    $("#todolist-cont").fadeIn(1000);
                }
            }).catch(function (error) {
                console.log("Failed to retrieve error: ", error)
            });
        }

        function addInterest() {
            var newInterest = document.getElementById("newInterest").value.trim();

            document.getElementById("newInterest").value = "";
            // Return if the new interest is an empty field
            if (newInterest == "" || newInterest == null) {
                return;
            }

            var adminAdd = firebase.functions().httpsCallable('adminAdd');
            console.log("FIREBASE: Adding Interest: " + newInterest);
        
            const data = {
                uid     : user.uid,
                command : 5,
                item    : null,
                subItem : newInterest
            };

            adminAdd(data).then(function(result) {
                console.log("FIREBASE: Successfully added interest.");
                // Refresh interests page
                loadInterests();
            }).catch(function(error) {
                console.error("FIREBASE: Failed to add interest.", error);
            });
        }

        loadInterests();

        // Add button listeners
        document.getElementById("newInterestButton").addEventListener("click", addInterest);
        document.getElementById("refreshButton").addEventListener("click", loadInterests);

        // Add new interest when the ENTER key is hit
        var inputField = document.getElementById("newInterest");
        inputField.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("newInterestButton").click();
            }
        });

    } else {
        window.location.replace("/");
    }
});

function deleteInterest(interest) {

    var user = firebase.auth().currentUser;

    var adminRemove = firebase.functions().httpsCallable('adminRemove');
    console.log("FIREBASE: Removing Interest: " + interest);

    const data = {
        uid     : user.uid,
        command : 5,
        item    : null,
        subItem : interest
    };

    adminRemove(data).then(function(result) {
        console.log("FIREBASE: Successfully removed interest.");
        // Refresh interests page
        loadInterests();
    }).catch(function(error) {
        console.error("FIREBASE: Failed to remove interest.", error);
    });
}