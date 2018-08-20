const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        var user = firebase.auth().currentUser;
        var name, email, photoUrl, uid;
        if (user != null) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                       // this value to authenticate with your backend server, if
                       // you have one. Use User.getToken() instead.
        }
        // Set profile picture
        document.getElementById('profilePicture').innerHTML = "<img src=" + photoUrl + " width='200' height='200' style='border-radius: 50%' />";
    	
    	// Designate Firestore documents to write to.
    	// Needs to be made secure later on by requesting token instead of UID.
        const docRef = firestore.doc("student/" + uid);
    
        const nameOutput = document.querySelector("#nameOutput");
        const universityOutput = document.querySelector("#universityOutput");
        const degreeOutput = document.querySelector("#degreeOutput");
        const nameTextField = document.querySelector("#nameField");
        const universityTextField = document.querySelector("#universityField");
        const degreeTextField = document.querySelector("#degreeField");
        const saveButton = document.querySelector("#saveButton");
        // Autofills form fields with the user's existing profile information 
        docRef.get().then(function (doc) {
            if (doc && doc.exists) {
                const myData = doc.data();
                document.getElementById('nameField').value = myData.name;
                document.getElementById('universityField').value = myData.university;
                document.getElementById('degreeField').value = myData.current_degree;
            }
        }).catch(function (error) {
            console.log("Failed to retrieve error: ", error)
        });
    	
    	// Updates the user's profile information when they hit save
        document.getElementById("profileForm").addEventListener("submit", function() {
            const nameToSave = nameTextField.value.trim();
            const universityToSave = universityTextField.value.trim();
            const degreeToSave = degreeTextField.value.trim();
            console.log("Saving Name: " + nameToSave + ", University: " + universityToSave + ", Degree: " + degreeToSave + " to Firestore");
            docRef.update({
                name: nameToSave,
                university: universityToSave,
                current_degree: degreeToSave
            }).then(function() {
                console.log("Successfully Updated Profile.");
            }).catch(function (error) {
                console.log("Profile Update Error: ", error);
            });
        })
    
        // Check for Firestore changes and update text labels
        var getRealTimeUpdates = function() {
          docRef.onSnapshot(function(doc) {
            if (doc && doc.exists) {
              const myData = doc.data();
              nameOutput.innerText = myData.name;
              universityOutput.innerText = myData.university;
              degreeOutput.innerText = myData.current_degree;
            }
          });
        }
        
        // Continuously check for updates
        getRealTimeUpdates();
    } else {
        // No user is signed in.
        // Redirect them to home page
        document.location.href="/";
    }
});