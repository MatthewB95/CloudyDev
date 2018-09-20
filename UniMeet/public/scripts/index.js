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
          if (user.emailVerified == true) {
            window.open("/matching.html","_self");
          }
          else {
            window.open("/verify.html","_self");
          }          
        } else {
         window.open("/login.html","_self");
       }
     });
      // [END authstatelistener]
    }

    window.onload = function() {
      initApp();
    };