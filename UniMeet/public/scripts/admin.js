// JavaScript Document

const firestore = firebase.firestore();
const settings = { /* your settings... */
    timestampsInSnapshots: true
};
firestore.settings(settings);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

        loadAdmins();
        loadInterests();

        // Add button listeners
        document.getElementById("newAdminButton").addEventListener("click", addAdmin);
        document.getElementById("adminRefreshButton").addEventListener("click", loadAdmins);
        
        document.getElementById("newInterestButton").addEventListener("click", addInterest);
        document.getElementById("interestRefreshButton").addEventListener("click", loadInterests);

        // Add new admin when the ENTER key is hit
        var adminField = document.getElementById("newAdmin");
        adminField.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("newAdminButton").click();
            }
        });

        // Add new interest when the ENTER key is hit
        var interestField = document.getElementById("newInterest");
        interestField.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("newInterestButton").click();
            }
        });

    } else {
        window.location.replace("/");
    }
});

////////////////////////////   ADMIN   //////////////////////////////////
// Loads list of admins from database and add them to the drop down-lists
function loadAdmins() {
    // Fade all collections onto page
    $("#adminList-cont").fadeOut(500);
    var adminsList = document.getElementById("admin-list");
    // Remove any existing matches from the page
    adminsList.innerHTML = "";

    firestore.collection("admin").get().then(function (querySnapshot) {
    querySnapshot.forEach(function(admin) {
        // doc.data() is never undefined for query doc snapshots
        console.log(admin.id, " => ", admin.data());

        $("#admin-list").append("<li class='list-group-item _task'><span class='_todo-text'>" + admin.id + "</span>" +
        "<div class='btn-group pull-right _task-controls' role='group'>" +
        "<button class='btn btn-light _todo-remove' type='button' value=" + admin.id + " onclick='deleteAdmin(this.value)'>" + 
        "<i class='fa fa-trash'></i></button></div>" +
        "<div class='clearfix'></div>"
        );
        });
        $("#adminList-cont").fadeIn(1000);
    });
}

function addAdmin() {

    var user = firebase.auth().currentUser;

    var newAdmin = document.getElementById("newAdmin").value.trim();
    document.getElementById("newAdmin").value = "";
    // Return if the new admin is an empty field
    if (newAdmin == "" || newAdmin == null) {
        return;
    }

    var adminAdd = firebase.functions().httpsCallable('adminAdd');
    console.log("FIREBASE: Adding admin: " + newAdmin);

    const data = {
        uid     : user.uid,
        command : 1,
        item    : newAdmin,
        subItem : 1 // Privilege level
    };
    adminAdd(data).then(function(result) {
        console.log("FIREBASE: Successfully added admin.");
        // Refresh admins page
        loadAdmins();
    }).catch(function(error) {
        console.error("FIREBASE: Failed to add admin.", error);
    });
}


function deleteAdmin(admin) {

    var user = firebase.auth().currentUser;

    var adminRemove = firebase.functions().httpsCallable('adminRemove');
    console.log("FIREBASE: Removing Admin: " + admin);

    const data = {
        uid     : user.uid,
        command : 1,
        item    : admin,
        subItem : null
    };

    adminRemove(data).then(function(result) {
        console.log("FIREBASE: Successfully removed admin.");
        // Refresh admins page
        loadAdmins();
    }).catch(function(error) {
        console.error("FIREBASE: Failed to remove admin.", error);
    });
}


////////////////////////////   ADMIN   //////////////////////////////////






////////////////////////////   UNIVERSITY   //////////////////////////////////


/////////////////////////////   COURSES  ////////////////////////////////////





/////////////////////////////   COURSES  ////////////////////////////////////



////////////////////////////  INTERESTS  ///////////////////////////////////

// Loads list of interests from database and add them to the drop down-lists
function loadInterests() {
    // Fade all collections onto page
    $("#interestList-cont").fadeOut(500);
    var interestsList = document.getElementById("interest-list");
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
                $("#interest-list").append("<li class='list-group-item _task'><span class='_todo-text'>" + key + "</span>" +
                 "<div class='btn-group pull-right _task-controls' role='group'>" +
                 "<button class='btn btn-light _todo-remove' type='button' value=" + key + " onclick='deleteInterest(this.value)'>" + 
                 "<i class='fa fa-trash'></i></button></div>" +
                 "<div class='clearfix'></div>"
                 );
            }
            // Fade all collections onto page
            $("#interestList-cont").fadeIn(1000);
        }
    }).catch(function (error) {
        console.log("Failed to retrieve error: ", error)
    });
}

function addInterest() {

    var user = firebase.auth().currentUser;

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
////////////////////////////  INTERESTS  ///////////////////////////////////