

// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
admin.initializeApp();

/* // Adds a message that welcomes new users into the chat.
exports.addWelcomeMessages = functions.auth.user().onCreate(async (user) => {
    console.log('A new user signed in for the first time.');
    const fullName = user.displayName || 'Anonymous';
  
    // Saves the new welcome message into the database
    // which then displays it in the FriendlyChat clients.
    await admin.database().ref('messages').push({
      name: 'UniMeet Bot',
      profilePicUrl: '/images/firebase-logo.png', // Firebase logo
      text: `${fullName} signed in for the first time! Welcome!`,
    });
    console.log('Welcome message written to database.');
  }); */




// Sends a notifications to all users when a new message is posted.
exports.sendNotifications = functions.database.ref('/messages/{messageId}').onCreate(
    async (snapshot) => {
      // Notification details.
      const text = snapshot.val().text;
      const payload = {
        notification: {
          title: `${snapshot.val().name} posted ${text ? 'a message' : 'an image'}`,
          body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
          icon: snapshot.val().photoUrl || '/images/profile_placeholder.png',
          click_action: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
        }
      };

      // Get the list of device tokens.
      const allTokens = await admin.database().ref('fcmTokens').once('value');
      if (allTokens.exists()) {
        // Listing all device tokens to send a notification to.
        const tokens = Object.keys(allTokens.val());

        // Send notifications to all tokens.
        const response = await admin.messaging().sendToDevice(tokens, payload);
        await cleanupTokens(response, tokens);
        console.log('Notifications have been sent and tokens cleaned up.');
      }
    });
    
    // Cleans up the tokens that are no longer valid.
    function cleanupTokens(response, tokens) {
     // For each notification we check if there was an error.
     const tokensToRemove = {};
     response.results.forEach((result, index) => {
       const error = result.error;
       if (error) {
         console.error('Failure sending notification to', tokens[index], error);
         // Cleanup the tokens who are not registered anymore.
         if (error.code === 'messaging/invalid-registration-token' ||
             error.code === 'messaging/registration-token-not-registered') {
           tokensToRemove[`/fcmTokens/${tokens[index]}`] = null;
         }
       }
     });
     return admin.database().ref().update(tokensToRemove);
    }

// Below is test code area
var db = admin.firestore();

/**
 * creates a document with UID as the id in the 'student' collection.
 */
exports.createStudentProfile = functions.auth.user().onCreate((user) => {

  //get uid and google display name of new user

  //var uid = FirebaseAuth.getInstance().getCurrentUser().getUid();
  var uid = user.uid;
  var displayName = user.displayName;

  var data = {
    name: displayName,
    current_degree: "please select your degree",
  };

  //add a new document into collection
  var setDoc = db.collection('student').doc(uid).set(data);

  return setDoc.then(res => {
    console.log('set: ', res);
  });
});
