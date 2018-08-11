//(function()) {

    // Initialise Firebase
    var config = {
        apiKey: "AIzaSyAGev97x416_eJKbO4NmbKesjtZyl8OSfs",
        authDomain: "unimeet-92f9f.firebaseapp.com",
        databaseURL: "https://unimeet-92f9f.firebaseio.com",
        projectId: "unimeet-92f9f",
        storageBucket: "unimeet-92f9f.appspot.com",
        messagingSenderId: "776036726314"
    };
    firebase.initializeApp(config);

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
        
            const docRef = firestore.doc("student/" + uid);
        
            const nameOutput = document.querySelector("#nameOutput");
            const universityOutput = document.querySelector("#universityOutput");
            const degreeOutput = document.querySelector("#degreeOutput");
            const nameTextField = document.querySelector("#nameField");
            const universityTextField = document.querySelector("#universityField");
            const degreeTextField = document.querySelector("#degreeField");
            const saveButton = document.querySelector("#saveButton");

            docRef.get().then(function (doc) {
                if (doc && doc.exists) {
                    const myData = doc.data();
                    document.getElementById('nameField').value = myData.Name;
                    document.getElementById('universityField').value = myData.University;
                    document.getElementById('degreeField').value = myData.Degree;
                }
            }).catch(function (error) {
                console.log("Failed to retrieve error: ", error)
            });
        
            document.getElementById("profileForm").addEventListener("submit", function() {
                const nameToSave = nameTextField.value;
                const universityToSave = universityTextField.value;
                const degreeToSave = degreeTextField.value;
                console.log("Saving Name: " + nameToSave + ", University: " + universityToSave + ", Degree: " + degreeToSave + " to Firestore");
                docRef.set({
                    Name: nameToSave,
                    University: universityToSave,
                    Degree: degreeToSave
                }).then(function() {
                    console.log("Successfully Updated Profile.");
                }).catch(function (error) {
                    console.log("Profile Update Error: ", error);
                });
            })
        
            // get update from firestore and update ui
            var getRealTimeUpdates = function() {
              docRef.onSnapshot(function(doc) {
                if (doc && doc.exists) {
                  const myData = doc.data();
                  nameOutput.innerText = myData.Name;
                  universityOutput.innerText = myData.University;
                  degreeOutput.innerText = myData.Degree;
                }
              });
            }
            
            // Continuously Check for updates
            getRealTimeUpdates();

        } else {
            // No user is signed in.
            // Redirect them to home page
            document.location.href="/";
        }
    });

    


//])();