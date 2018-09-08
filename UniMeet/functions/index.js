// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;
admin.initializeApp();

////////////////////////////////////////////////////////////////////////////////////////////
//BELOW IS CHAT CODE

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// BELOW IS MATCH MAKING CODE
var db = admin.firestore();

/**
 * creates document with UID as it's id in the 'student' collection
 * that has all of the profile information fields.
 * also triggers the creation of each users match list document in the database.
 */
exports.createStudentProfile = functions.auth.user().onCreate((user) => {

  //get uid and google display name of new user
  var uid = user.uid;
  var displayName = user.displayName || null;
  var proImg = user.photoURL || null;
  var defaultVerNum = 0;

  createMatchList(uid, defaultVerNum);
  createFriendList(uid);
  createRatingList(uid);

  //user profile fields
  var data = {
    uid: uid,
    name: displayName,
    age: null,
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
    averageRating: 0, //store how many votes and total stars and then calculate client side
    gender_interest: "M/F",
    profile_image: proImg,
    bio: null,
    uniYear: null,
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

function createFriendList(uid){
  //friend list fields
  var fData = {

  }
  //database path to current users friend list
  var userFriendDoc = db.collection('friends').doc(uid);

  //add student friend list doc into friends collection
  var setFriendDoc = userFriendDoc.set(fData);

  //return and log doc
  return (setFriendDoc).then(res => {
    console.log('set: ', res);
  });
}

function createRatingList(uid){
  //rating list fields
  var rData = {

  }
  //database path to current users rating list
  var userRatingDoc = db.collection('ratings').doc(uid);

  //add student rating list doc into ratings collection
  var setRatingDoc = userRatingDoc.set(rData);

  //return and log doc
  return (setRatingDoc).then(res => {
    console.log('set: ', res);
  });
}

function removeUserMatches(uid){
  //query for students that have User in their match list
  db.collection('match').get().then(snapshot => {
    snapshot.forEach(async doc => {
      //user's match list object
      var userMatch = doc.data();

      for(var rkey in userMatch){
        if(userMatch.hasOwnProperty(rkey)){
          if(rkey.localeCompare(uid) == 0){
            console.log('The user: ', rkey ,' is being removed from ->', doc.id);
            var trVerNum = (userMatch.version + 1);
            db.collection('match').doc(doc.id).update({
              [rkey]: FieldValue.delete(),
              version: trVerNum,
            });
          }
        }
      }
    });
  }).catch(err => {
    console.log('Error getting documents', err);
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
    const averageRating = newValue.averageRating;
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
    const oldAverageRating = oldValue.averageRating;
    const oldGender_interest = oldValue.gender_interest;

    const getInterestCount = 'interest_';
    const getCourseCount = 'course_';

    //Match Percentage distribution:
    const uniDegreePercent = 10;
    const coursePercent = 60;
    const interestPercent = 10;
    const averageRatingPercent = 20;
    //How many stars are used in rating system:
    const numStars = 5;

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

        //oldVerNum
        var preVerNum = oldMList.version;

        //iterate users match list version number
        var verNum = (oldMList.version + 1);

        //clear users old match list
        await createMatchList(uid, preVerNum);
        //MAKE BOTH AWAITS RUN AT SAME TIME WITH PROMISE ALL   <----------------------
        //clear current user from other students match lists
        await removeUserMatches(uid);

        //this retrieves all students who go to the same Uni and are in the same degree as the student who updated their profile
          var query = studRef.where('university', '==', university).where('current_degree', '==', current_degree).get().then(snapshot => {
            snapshot.forEach(async doc => {                
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

                  //Filter based on gender preferences
                  if((gender_interest == tarUserProfile.gender || gender_interest == 'M/F') && 
                     (tarUserProfile.gender_interest == gender || tarUserProfile.gender_interest == 'M/F'))
                  {
                      var tarCoursePercent = await getPercent(tarUserProfile, getCourseCount, coursePercent);
                      var tarIntPercent = await getPercent(tarUserProfile, getInterestCount, interestPercent);

                      //Compare both users courses and calculate match score
                      if((tarCoursePercent != 0) && (userCoursePercent != 0)){
                        //Find how many courses both users have in common
                        var courseMatchCount = await numOfMatches(newValue ,tarUserProfile, getCourseCount);
                        if(courseMatchCount != 0){
                           uScore = uScore + (courseMatchCount * userCoursePercent);
                           tScore = tScore + (courseMatchCount * tarCoursePercent);
                        }
                      }
                      //Compare both users interests and calculate match score
                      if((tarIntPercent != 0) && (userIntPercent != 0)){
                        //Find how many Interests both users have in common
                        var interestMatchCount = await numOfMatches(newValue ,tarUserProfile, getInterestCount);
                        if(interestMatchCount != 0){
                           uScore = uScore + (interestMatchCount * userIntPercent);
                           tScore = tScore + (interestMatchCount * tarIntPercent);
                        }
                      }
                      //do user rating part here (likely another if statement)
                      if(averageRating != 0 || tarUserProfile.averageRating != 0)
                      {
                        var ratingPoints = (averageRatingPercent / numStars);
                        var uRatingScore = (averageRating * ratingPoints);
                        var tRatingScore = (tarUserProfile.averageRating * ratingPoints);

                        uScore = uScore + tRatingScore;
                        tScore = tScore + uRatingScore;
                      }
                      //final averaged match score for both users (defualt adds 10% for matching based on uni & degree)
                      var matchTotal = await calcMatchTotal(uScore, tScore, uniDegreePercent);
                  }
                  else{
                    console.log('User: ', uid, ' does not have matching gender preferences with target user -> ',tarStudUid);
                  }
                  
                   //Below code finalises and saves match to db match lists
                   //get target users old match list
                   var getTML = await tarMatchRef.get();
                   if (getTML.exists){
                      var oldTMList = Object.assign(getTML.data());

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
                else{
                  if(snapshot.size == 1){
                    var upData = {
                      version: verNum,
                    }
                    var setUpData = db.collection('match').doc(uid).update(upData);
                    return(setUpData).then(res => {
                      console.log('EMPTY MATCH LIST set: ', res);
                    });
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
        resolve(counter);
      }
    }catch (e){ 
        reject(e);
      }
  });
}

function calcMatchTotal(usScore, taScore, uniDegPer){
  return new Promise(function(resolve, reject){
    try{
      var answer = ((usScore + taScore + uniDegPer + uniDegPer) / 2);
      resolve(answer);
    }catch (e){ 
        reject(e);
    }
  });
}

//check if friend is true 
function isFriend(uid, tuid){
  return new Promise(async function(resolve, reject){
    try {
        //creates a reference to the users friend list
        var friendRef = db.collection('friends').doc(uid);
        //get users friend list and save to object
        const friendList = await friendRef.get();
        var FriendLt = Object.assign(friendList.data()); 
        //is user friend?
        var isFriend = false;

        if(friendList.exists){
          //const FList = Object.assign(friendList.data());
          for(var frKey in FriendLt){
            if(FriendLt.hasOwnProperty(frKey)){
              if(FriendLt[frKey] != null){
                if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] >= 4)){
                  isFriend = true;
                  resolve(isFriend);
                }
              }
            }
          }
          resolve(isFriend);
        }
        else{
          console.log("Failed to retrieve friend list [error]");
          reject(e);
        }
    }
    catch(e){
      reject(e);
    }
  });
}

exports.rateStudent = functions.https.onCall(async(data) => {
  var uid = data.uid;
  var tuid = data.tuid;
  var stars = data.stars;

  //reference to the student being rateds (rating list)  
  var ratingListRef = db.collection('ratings').doc(tuid);

  //check rating is of correct value:
    if(stars >= 1 && stars <= 5){
      var isF = await isFriend(uid, tuid);
      if(isF == true){
        await addRating(stars, uid, ratingListRef);
        var resolve = await calcAvgRating(tuid, ratingListRef);
        console.log('resolve -> ',resolve);
        return resolve;
      }
      else {
        console.log("User can not rate this student as they have no link between them");
        throw new functions.https.HttpsError('permission-denied', 'User can only rate students they have been friends with');
      }
    }
    else{
      console.log("ERROR: rating sent from client has incorrect format");
      throw new functions.https.HttpsError('invalid-argument', 'ERROR: rating sent from client has incorrect format')
    }
});

function addRating(rating, uid, ratingListRef){
  return new Promise(async function(resolve, reject) {
    try{
      //rating data to submit
      var ratingData = {
        [uid]: rating,
      }
      //updates data to given firestore path
      var result = await ratingListRef.update(ratingData);
      resolve(result);
    }
    catch(e){
      reject(e);
    }
  });
}

function calcAvgRating(tuid, ratingListRef){
  return new Promise(async function(resolve, reject) {
    try{
      var doc = await ratingListRef.get();  
      if(doc != null){
        var ratingList = Object.assign(doc.data());
        var total = 0;
        var count = 0;
        var result = null;
        var avgRating = 0;

        //Calculate Average Rating
        for (var rkey in ratingList){
          total = total + ratingList[rkey];
          count ++;
        }
  
        //convert avg rating to 1 decimal place
        if(total != 0 && count != 0){
          avgRating = Math.round((total / count) * 10) / 10;
        }
  
        if(avgRating != 0){
          result = avgRating;
          await saveAvgRating(tuid, result);
          console.log('result -> ',result);
          console.log('count -> ', count);
          // Return variables for averageRating and count here
          resolve({averageRating: result, count: count});
        }
      }else{
        console.log('Failed to retrieve rating list document to calculate average rating');
      }
    }
    catch(e){
      reject(e);
    }
  });
}

function saveAvgRating(uid, avgRating){
  return new Promise(function(resolve, reject) {
    try{
      var studentRef = db.collection('student').doc(uid);
      var srData = {
        averageRating: avgRating,
      }
      studentRef.update(srData).then(function() {
        resolve(console.log("Successfully Updated Rating"));
      }).catch(function (error) {
        reject(console.log("ERROR: Rating update error: ", error));
        throw new functions.https.HttpsError('aborted', 'ERROR: Rating update error: ', error);
      });
    }
    catch(e){
      reject(e);
    }
  });
}
// 0 = never been friends
// 1 = request sent
// 2 = request rejected
// 3 = blocked
// 4 = friends
// 5 = unfriended
exports.friendStatus = functions.https.onCall(async(data) => {
  var uid = data.uid;
  var tuid = data.tuid;
  var status = data.status;

  //reference to the target student's friend list' 
  var tarFriendListRef = db.collection('friends').doc(tuid);

  //reference to the user's friend list' 
  var UserFriendListRef = db.collection('friends').doc(uid);

  //check if status number is in correct range:
    if(status >= 1 && status <= 5){
      if(status == 1){

      }
      else if(status == 2){

      }
      else if(status == 3){
      
      }
      else if(status == 4){

      }
      else{
        //status equals 5
      }
    }
    else{
      console.log("ERROR: friend status sent from client has incorrect format");
      throw new functions.https.HttpsError('invalid-argument', 'ERROR: friend status sent from client has incorrect format')
    }
});