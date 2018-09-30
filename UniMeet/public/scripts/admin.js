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

        loadAdmins();

        // Add button listeners
        document.getElementById("newAdminButton").addEventListener("click", addAdmin);
        document.getElementById("adminRefreshButton").addEventListener("click", loadAdmins);

        document.getElementById("newUniversityButton").addEventListener("click", addUniversity);
        document.getElementById("universityRefreshButton").addEventListener("click", loadUniversities);

        document.getElementById("newDegreeButton").addEventListener("click", addDegree);
        document.getElementById("degreeRefreshButton").addEventListener("click", loadDegrees);
        
        document.getElementById("newInterestButton").addEventListener("click", addInterest);
        document.getElementById("interestRefreshButton").addEventListener("click", loadInterests);

        document.getElementById("logOutButton").addEventListener("click", logOut);

        // Add new admin when the ENTER key is hit
        var adminField = document.getElementById("newAdmin");
        adminField.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("newAdminButton").click();
            }
        });

        // Add new admin when the ENTER key is hit
        var adminNameField = document.getElementById("newAdminName");
        adminNameField.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("newAdminButton").click();
            }
        });

        // Add new university when the ENTER key is hit
        var universityField = document.getElementById("newUniversity");
        universityField.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("newUniversityButton").click();
            }
        });

        // Add new degree when the ENTER key is hit
        var degreeField = document.getElementById("newDegree");
        degreeField.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("newDegreeButton").click();
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

        function logOut() {
            firebase.auth().signOut();
            window.location.replace("/");
        }

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

        const thisAdmin = admin.data();
        // Disable/enable privilege buttons depending on privilege level
        if (admin.id == uid) {
            if (thisAdmin.privilege_level == 1) {
                document.getElementById("privilege-1").disabled = false;
                document.getElementById("privilege-2").disabled = false;
            }
            else {
                document.getElementById("privilege-1").disabled = true;
                document.getElementById("privilege-2").disabled = true;
            }
        }

        $("#admin-list").append("<li class='list-group-item _task'><span class='_todo-text'>" + thisAdmin.name + " | " + admin.id + "</span>" +
            "<div class='btn-group pull-right _task-controls' role='group'>" +
            "<button class='btn btn-light _todo-remove' type='button' value='" + admin.id + "' onclick='deleteAdmin(this.value)'>" + 
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

    // Return if the new admin has no name
    var newAdminName = document.getElementById("newAdminName").value.trim();
    document.getElementById("newAdminName").value = "";
    if (newAdminName == "" || newAdminName == null) {
        return;
    }

    // Get the selected privilege level and make it an integer
    var privilegeString = document.querySelector('input[name="privilege"]:checked').value;
    var privilege = parseInt(privilegeString, 10);

    var adminAdd = firebase.functions().httpsCallable('adminAdd');
    console.log("FIREBASE: Adding admin: " + newAdmin);

    const data = {
        uid     : user.uid,
        command : 1,
        item    : newAdmin,
        name    : newAdminName,
        subItem : privilege
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
// Loads list of universities from database and add them to the drop down-lists
function loadUniversities() {
    // Fade all collections onto page
    $("#universityList-cont").fadeOut(500);
    var universitiesList = document.getElementById("university-list");
    // Remove any existing matches from the page
    universitiesList.innerHTML = "";

    firestore.collection("degree").get().then(function (querySnapshot) {
        querySnapshot.forEach(function(universities) {
        // doc.data() is never undefined for query doc snapshots
        console.log(universities.id, " => ", universities.data());

        $("#university-list").append("<li class='list-group-item _task'><span class='_todo-text'>" + universities.id + "</span>" +
            "<div class='btn-group pull-right _task-controls' role='group'>" +
            "<button class='btn btn-light _todo-remove' type='button' value='" + universities.id + "' onclick='deleteUniversity(this.value)'>" + 
            "<i class='fa fa-trash'></i></button></div>" +
            "<div class='clearfix'></div>"
            );
    });
        $("#universityList-cont").fadeIn(1000);
    });
}

function addUniversity() {

    var user = firebase.auth().currentUser;

    var newUniversity = document.getElementById("newUniversity").value.trim();
    document.getElementById("newUniversity").value = "";
    // Return if the new university is an empty field
    if (newUniversity == "" || newUniversity == null) {
        return;
    }

    var adminAdd = firebase.functions().httpsCallable('adminAdd');
    console.log("FIREBASE: Adding university: " + newUniversity);

    const data = {
        uid     : user.uid,
        command : 2,
        item    : newUniversity,
        subItem : null // Privilege level
    };
    adminAdd(data).then(function(result) {
        console.log("FIREBASE: Successfully added university.");
        // Refresh universities page
        loadUniversities();
    }).catch(function(error) {
        console.error("FIREBASE: Failed to add university.", error);
    });
}


function deleteUniversity(university) {

    var user = firebase.auth().currentUser;

    var adminRemove = firebase.functions().httpsCallable('adminRemove');
    console.log("FIREBASE: Removing university: " + university);

    const data = {
        uid     : user.uid,
        command : 2,
        item    : university,
        subItem : null
    };

    adminRemove(data).then(function(result) {
        console.log("FIREBASE: Successfully removed university.");
        // Refresh universities page
        loadUniversities();
    }).catch(function(error) {
        console.error("FIREBASE: Failed to remove university.", error);
    });
}

////////////////////////////   UNIVERSITY   //////////////////////////////////

/////////////////////////////   DEGREES  ////////////////////////////////////
// Loads list of degrees from database and add them to the drop down-lists
function loadDegrees() {
    // Fade all collections onto page
    $("#degreeList-cont").fadeOut(500);
    var degreesList = document.getElementById("degree-list");
    // Remove any existing collections from the page
    degreesList.innerHTML = "";

    // Remove all existing options from drop-down list
    document.getElementById('universitySelect').options.length = 0;
    // Add the placeholder option
    $('#universitySelect').append(new Option("Please select a university", ""));

    firestore.collection("degree").get().then(function (querySnapshot) {
        querySnapshot.forEach(function(degree) {
        // doc.data() is never undefined for query doc snapshots
        console.log(degree.id, " => ", degree.data());
        const degrees = degree.data();

        $('#universitySelect').append(new Option(degree.id, degree.id));

        for (var key in degrees) {
            $("#degree-list").append("<li class='list-group-item _task'><span class='_todo-text'>" + degree.id + " | " + key + "</span>" +
                "<div class='btn-group pull-right _task-controls' role='group'>" +
                "<button class='btn btn-light _todo-remove' type='button' value='" + degree.id + "|" + key + "' onclick='deleteDegree(this.value)'>" + 
                "<i class='fa fa-trash'></i></button></div>" +
                "<div class='clearfix'></div>"
                );
        }

    });
        $("#degreeList-cont").fadeIn(1000);
    });
}

function addDegree() {

    var user = firebase.auth().currentUser;

    var university = document.getElementById('universitySelect').value;
    // Return if the new admin is an empty field
    if (university == "" || university == null) {
        return;
    }

    var newDegree = document.getElementById("newDegree").value.trim();
    document.getElementById("newDegree").value = "";
    // Return if the new admin is an empty field
    if (newDegree == "" || newDegree == null) {
        return;
    }

    var adminAdd = firebase.functions().httpsCallable('adminAdd');
    console.log("FIREBASE: Adding degree: " + newDegree);

    const data = {
        uid     : user.uid,
        command : 3,
        item    : university,
        subItem : newDegree
    };
    adminAdd(data).then(function(result) {
        console.log("FIREBASE: Successfully added degree.");
        // Refresh degrees page
        loadDegrees();
    }).catch(function(error) {
        console.error("FIREBASE: Failed to add degree.", error);
    });
}


function deleteDegree(degree) {

    var user = firebase.auth().currentUser;

    var split = degree.split("|");

    var universityName = split[0];
    var degreeName = split[1];

    var adminRemove = firebase.functions().httpsCallable('adminRemove');
    console.log("FIREBASE: Removing degree: " + degree);

    const data = {
        uid     : user.uid,
        command : 3,
        item    : universityName,
        subItem : degreeName
    };

    adminRemove(data).then(function(result) {
        console.log("FIREBASE: Successfully removed degree.");
        // Refresh admins page
        loadDegrees();
    }).catch(function(error) {
        console.error("FIREBASE: Failed to remove degree.", error);
    });
}
/////////////////////////////   DEGREES  ////////////////////////////////////

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
                   "<button class='btn btn-light _todo-remove' type='button' value='" + key + "' onclick='deleteInterest(this.value)'>" + 
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

/////////////////////////////   USERS   ////////////////////////////////////
// Loads list of users from database and add them to the drop down-lists
function loadUsers() {
    // Fade all collections onto page
    $("#userList-cont").fadeOut(500);
    var usersList = document.getElementById("user-list");
    // Remove any existing matches from the page
    usersList.innerHTML = "";

    firestore.collection("student").get().then(function (querySnapshot) {
        querySnapshot.forEach(function(user) {
        // doc.data() is never undefined for query doc snapshots
        console.log(user.id, " => ", user.data());
        const thisUser = user.data();

        $("#user-list").append("<li class='list-group-item _task'><span class='_todo-text'>" + thisUser.name + " | " + user.id + "</span>" +
            "<div class='btn-group pull-right _task-controls' role='group'>" +
            "<button class='btn btn-light _todo-remove' type='button' value='" + user.id + "' onclick='deleteUser(this.value)'>" + 
            "<i class='fa fa-trash'></i></button></div>" +
            "<div class='clearfix'></div>"
            );
    });
        $("#userList-cont").fadeIn(1000);
    });
}

function deleteUser(targetUser) {

    var user = firebase.auth().currentUser;

    var adminRemove = firebase.functions().httpsCallable('adminRemove');
    console.log("FIREBASE: Removing user: " + targetUser);

    const data = {
        uid     : user.uid,
        command : 6,
        item    : targetUser,
        subItem : null
    };

    adminRemove(data).then(function(result) {
        console.log("FIREBASE: Successfully removed user.");
        // Refresh interests page
        loadUsers();
    }).catch(function(error) {
        console.error("FIREBASE: Failed to remove user.", error);
    });
}



/////////////////////////////   USERS   ////////////////////////////////////