
// Initialize Firebase
  var config = {
    apiKey: "AIzaSyAGev97x416_eJKbO4NmbKesjtZyl8OSfs",
    authDomain: "unimeet-92f9f.firebaseapp.com",
    databaseURL: "https://unimeet-92f9f.firebaseio.com",
    projectId: "unimeet-92f9f",
    storageBucket: "unimeet-92f9f.appspot.com",
    messagingSenderId: "776036726314"
  };
  firebase.initializeApp(config);

    /**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     */
    function initApp() {
      // Listening for auth state changes.
      // [START authstatelistener]
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
			window.open("/matching.html","_self");
        } else {
			window.open("/login.html","_self");
		}
      });
      // [END authstatelistener]

      document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
    }

    window.onload = function() {
      initApp();
    };