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
 * also triggers the creation of each users match list document in the database.
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
    university: null,
    current_degree: null,
    course_1: null,
    course_2: null,
    course_3: null,
    course_4: null,
    course_5: null,
    course_6: null,
    interest_1: null,
    interest_2: null,
    interest_3: null,
    interest_4: null,
    team_rating: 0, //or were we storing how many votes and total stars and then calculating client side?
    gender_interest: "M/F",
    profile_image: "link",
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

  //add student match list document into match collection
  var setMatchDoc = userMatchDoc.set(mData);

  //return and log document
  return (setMatchDoc).then(res => {
    console.log('set: ', res);
  });
}

//when profile is updated in firestore database checks if profile 
//has been filled out correctly before passing to matching function
exports.profileUpdateCheck = functions.firestore.document('student/{uid}').onUpdate(async (Change, Context) => {

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
    const course_5 = newValue.course_5;
    const course_6 = newValue.course_6;
    const interest_1 = newValue.interest_1;
    const interest_2 = newValue.interest_2;
    const interest_3 = newValue.interest_3;
    const interest_4 = newValue.interest_4;
    const team_rating = newValue.team_rating;
    const gender_interest = newValue.gender_interest;

    //access particular fields from old object (oldValue)
    const oldName = oldValue.name;
    const oldGender = oldValue.gender;
    const oldUniversity = oldValue.university;
    const oldCurrent_degree = oldValue.current_degree;
    const oldCourse_1 = oldValue.course_1;
    const oldCourse_2 = oldValue.course_2;
    const oldCourse_3 = oldValue.course_3;
    const oldCourse_4 = oldValue.course_4;
    const oldCourse_5 = oldValue.course_5;
    const oldCourse_6 = oldValue.course_6;
    const oldInterest_1 = oldValue.interest_1;
    const oldInterest_2 = oldValue.interest_2;
    const oldInterest_3 = oldValue.interest_3;
    const oldInterest_4 = oldValue.interest_4;
    const oldTeam_rating = oldValue.team_rating;
    const oldGender_interest = oldValue.gender_interest;

    const getCourseCount = 'course_';
    const coursePercent = 60;
    const getInterestCount = 'interest_';
    const interestPercent = 30;
    const uniDegreePercent = 10;

    var userCoursePercent = await getPercent(newValue, getCourseCount, coursePercent);
    var userIntPercent = await getPercent(newValue, getInterestCount, interestPercent);

    function getPercent(profile, getCount, percentage){
      return new Promise(function(resolve, reject) {
        try{
            var counter = 0;
            var percentVal = 0;
            for(var key in profile){
                if(profile.hasOwnProperty(key)){
                  if((key.startsWith(getCount)) && (profile[key] != null)){
                    counter ++;
                  }
                }
            }
          if(counter != 0){
            percentVal = (percentage / counter);
            resolve(percentVal);
          }
          else{
            resolve(percentVal);
          }
        }catch (e){ 
            reject(e);
          }
      });
    }

    console.log('Percentage value Per (COURSE) for MAIN user: -> ', userCoursePercent);
    console.log('Percentage value Per (INTEREST) for MAIN user: -> ', userIntPercent);

    //creates a reference to the firestore 'student' collection
    var studRef = db.collection('student');

    //creates a reference to the users match list
    var matchRef = db.collection('match').doc(uid);

    //check if sufficient data has been provided by user before matching algorithm is run
    if ((current_degree != null) && (university != null)){
        
      //get the users old list of matches in an object
      const getML = await matchRef.get();
      if (getML.exists) {
        const oldMList = Object.assign(getML.data());    
        //console.log("User's old match list: ", oldMList);

        //iterate users match list version number
        var verNum = (oldMList.version + 1); //change iteration to happen only if a change is made to match list

        //clear users old match list
        createMatchList(uid, verNum);

        //clear current user from other students match lists
        //PUT FUNCTION HERE!!!!!!!!!!!!!!!!!!!

        //this retrieves all students who go to the same Uni and are in the same degree as the student who updated their profile
          var query = studRef.where('university', '==', university).where('current_degree', '==', current_degree).get().then(snapshot => {
            snapshot.forEach(async doc => {
                ///console.log(doc.id, '=>', doc.data());

                //target users profile object
                var tarUserProfile = doc.data();

                //target users uid
                var tarStudUid = doc.id;

                //creates a reference to target users match list
                var tarMatchRef = db.collection('match').doc(tarStudUid);

                if (tarStudUid != uid){
                  
                  //User match score (how well user matches with target user)
                  var uScore = 0;
                  //target user match score (how well target user matches with user)
                  var tScore = 0;
                  //final averaged match score for both users (defualt adds 10% for matching based on uni & degree)
                  var matchTotal = uniDegreePercent;

                  //Filter based on gender preferences
                  if((gender_interest == tarUserProfile.gender || gender_interest == 'M/F') && 
                     (tarUserProfile.gender_interest == gender || tarUserProfile.gender_interest == 'M/F'))
                  {
                      var tarCoursePercent = await getPercent(tarUserProfile, getCourseCount, coursePercent);
                      var tarIntPercent = await getPercent(tarUserProfile, getInterestCount, interestPercent);

                      //Compare both users courses and calculate match score
                      if((tarCoursePercent != 0) && (userCoursePercent != 0)){
                        console.log('Percentage value Per (COURSE) for TARGET user: -> ',tarStudUid, ' -> ', tarCoursePercent);
                        //Find how many courses both users have in common
                        var courseMatchCount = await numOfMatches(newValue ,tarUserProfile, getCourseCount);
                        if(courseMatchCount != 0){
                           uScore = uScore + (courseMatchCount * userCoursePercent);
                           tScore = tScore + (courseMatchCount * tarCoursePercent);
                           console.log('USER SCORE after count * percent in (COURSE) --> ', uScore);
                           console.log('TARGET SCORE after count * percent in (COURSE) --> ', tScore);
                        }
                      }
                      //Compare both users interests and calculate match score
                      if((tarIntPercent != 0) && (userIntPercent != 0)){
                        console.log('Percentage value Per (INTEREST) for TARGET user: -> ', tarStudUid, ' -> ',tarIntPercent);
                        //Find how many Interests both users have in common
                        var interestMatchCount = await numOfMatches(newValue ,tarUserProfile, getInterestCount);
                        if(interestMatchCount != 0){
                           uScore = uScore + (interestMatchCount * userIntPercent);
                           tScore = tScore + (interestMatchCount * tarIntPercent);
                           console.log('USER SCORE after count * percent in (INTEREST) --> ', uScore);
                           console.log('TARGET SCORE after count * percent in (INTEREST) --> ', tScore);
                        }
                      }
                      //do user rating part here (likely another if statement)
                  }
                  else{
                    console.log('User: ', uid, ' does not have matching gender preferences with target user -> ',tarStudUid);
                  }
                  /*
                  Below code finalises and saves match to db match lists
                  */
                   //get target users old match list
                   var getTML = await tarMatchRef.get();
                   if (getTML.exists){
                     var oldTMList = Object.assign(getTML.data());
                     //console.log("Target user's old match list: ", oldTMList);

                      //iterate target users match list version number
                      var tarVerNum = (oldTMList.version + 1);

                      //data being saved to users match list
                      var matchData = {
                        [tarStudUid]: matchTotal,
                        version: verNum,
                      }

                      //data being saved to other students match lists
                      var matchtData = {
                        [uid]: matchTotal,
                        version: tarVerNum, 
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
                    else {
                      console.log('Failed to retrieve target user match list [error]');
                    }
                }
            });
          })
          .catch(err => {
            console.log('Error getting documents', err);
          });
      }
      else{
        console.log("Failed to retrieve match list [error]")
      }
    }
    else{
      console.log('User has not correctly filled in UserProfile');
    }
});

function numOfMatches(userProfile, tarProfile, getCount){
  return new Promise(function(resolve, reject) {
    try{
        var counter = 0;
        for(var ukey in userProfile){
            if(userProfile.hasOwnProperty(ukey)){
              if((ukey.startsWith(getCount)) && (userProfile[ukey] != null)){
                for(var tkey in tarProfile){
                  if(tarProfile.hasOwnProperty(tkey)){
                    if((tkey.startsWith(getCount)) && (tarProfile[tkey] != null)){
                      if(userProfile[ukey] == tarProfile[tkey]){
                        counter ++;
                        console.log("NUM OF ",getCount ," MATCHES --> ", counter);
                      }
                    }
                  }
                }
              }
            }
        }
      if(counter != 0){
        resolve(counter);
      }
      else{
        resolve(percentVal);
      }
    }catch (e){ 
        reject(e);
      }
  });
}
///TAKE WHAT I NEED FROM HERE AND DELETE REST OF FUNCTION
///save users Database matchlist to an arraylist
function getMatchList(matchRef){
  return new Promise(function (resolve, reject) { 
    try {
          var  userMatchList = matchRef.get().then(function (doc) {
              if (doc && doc.exists){                   
                var myData = doc.data();
                resolve(myData);
                //console.log("Object: ", myData);

                for(var key in myData){
                  if (myData.hasOwnProperty(key)){
                    ///console.log(key + " -> " + myData[key]);
                    var item = myData[key];
                    //console.log('item: ', item);
                    //console.log('key: ', key);
                  }
                }
              }
              else{
                resolve(null);
              }
          }).catch(function (error) {
            console.log("Failed to retrieve error: ", error)
          });
      } catch (e) {
        reject(e)
      }
  });
}
