

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
 * creates document with UID as it's id in the 'student' collection
 * that has all of the profile information fields.
 * also creates each users match list document in the database.
 */
exports.createStudentProfile = functions.auth.user().onCreate((user) => {

  //get uid and google display name of new user
  var uid = user.uid;
  var displayName = user.displayName;
  var defaultVerNum = 0;

  createMatchList(uid, defaultVerNum);

  //user profile fields
  var data = {
    uid: uid,
    name: displayName,
    gender: "M/F",
    university: "Please select your University",
    current_degree: "Please select your degree",
    course_1: "Please pick your first course",
    course_2: "Please pick your second course",
    course_3: "Please pick your third course",
    course_4: "Please pick your fourth course",
    interest_1: "Please choose your favourite interest/hobby",
    interest_2: "Please choose your second favourite interest/hobby",
    interest_3: "Please choose your third favourite interest/hobby",
  };
 
  //add new student profile document into student collection
  var setDoc = db.collection('student').doc(uid).set(data);

  //return and log documents
  return (setDoc).then(res => {
    console.log('set: ', res);
  }); 
  
});

function createMatchList(uid, verNum){
  
  //match list fields
  var mData = {
    version: verNum,
  }
  //Database Path to current user's Match List
  var userMatchDoc = db.collection('match').doc(uid);
  
  //Delete current users match document
  //userMatchDoc.delete();

  //add student match list document into match collection
  var setMatchDoc = userMatchDoc.set(mData);

  //return and log document
  return (setMatchDoc).then(res => {
    console.log('set: ', res);
  });
}

//when profile is updated in firestore database checks if profile 
//has been filled out correctly before passing to matching function
exports.profileUpdateCheck = functions.firestore.document('student/{uid}').onUpdate((Change, Context) => {

    //Gets object representing updated document
    const newValue = Change.after.data();

    //gets object representing document before update
    const oldValue = Change.before.data();
    
    //access particular fields from new updated object (newValue)
    const uid = newValue.uid;
    const name = newValue.name;
    const gender = newValue.gender;
    const university = newValue.university;
    const current_degree = newValue.current_degree;
    const course_1 = newValue.course_1;
    const course_2 = newValue.course_2;
    const course_3 = newValue.course_3;
    const course_4 = newValue.course_4;
    const interest_1 = newValue.interest_1;
    const interest_2 = newValue.interest_2;
    const interest_3 = newValue.interest_3;

    //access particular fields from old object (oldValue)
    const oldName = oldValue.name;
    const oldGender = oldValue.gender;
    const oldUniversity = oldValue.university;
    const oldCurrent_degree = oldValue.current_degree;
    const oldCourse_1 = oldValue.course_1;
    const oldCourse_2 = oldValue.course_2;
    const oldCourse_3 = oldValue.course_3;
    const oldCourse_4 = oldValue.course_4;
    const oldInterest_1 = oldValue.interest_1;
    const oldInterest_2 = oldValue.interest_2;
    const oldInterest_3 = oldValue.interest_3;

    //creates a reference to the firestore 'student' collection
    var studRef = db.collection('student');

    //creates a reference to the users match list
    var matchRef = db.collection('match').doc(uid);

    //check if sufficient data has been provided by user before matching algorithm is run
    if ((current_degree != 'Please select your degree') && (university != 'Please select your University')){
        
      //get the users old list of matches in an object
      var oldMList = (getMatchList(matchRef));
      console.log('oldMList: ', oldMList);
      // var verNum = oldMList.version;
      // console.log('The VERSION Num: ', verNum);
      var verNum = 0;

      //clear users old match list
      createMatchList(uid, verNum);

      //this retrieves all students who go to the same Uni and are in the same degree as the student who updated their profile
        var query = studRef.where('university', '==', university).where('current_degree', '==', current_degree).get().then(snapshot => {
          snapshot.forEach(doc => {
              console.log(doc.id, '=>', doc.data());
              //console.log(doc.id, '=>', doc.data().name);
              var tarStudUid = doc.id;

            //match based on:
            //courses
            //interests
            //gender


              if (tarStudUid != uid){
                    //data being saved to users match list
                    var matchData = {
                      [tarStudUid]: 0,
                      version: 1,
                    }
                    //data being saved to other students match lists
                    var matchtData = {
                      [uid]: 0,
                      version: 1,
                    }
                    //Update match list of user whose profile updated
                    var setMatchDoc = db.collection('match').doc(uid).update(matchData);
                    //Update match list of students the user matched with
                    var setTMatchDoc = db.collection('match').doc(tarStudUid).update(matchtData);
                    //return and log both writes to Firestore Database
                    return (setMatchDoc, setTMatchDoc).then(res => {
                        console.log('set: ', res);
                    });
              }
          });
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
    }
    else{
      console.log('User has not correctly filled in UserProfile');
    }
});

//save users Database matchlist to an arraylist
function getMatchList(matchRef){
  var userMatchList = matchRef.get().then(function (doc) {
      if (doc && doc.exists){                     //(NEED TO LOOP THROUGH FIELDS)
        var myData = doc.data();
        console.log("Object: ", myData);
        // for(var key in myData){
        //   if (myData.hasOwnProperty(key)){
        //     console.log(key + " -> " + myData[key]);

        //   }
        // }
        return (myData);
      }
  }).catch(function (error) {
    console.log("Failed to retrieve error: ", error)
  });
}
