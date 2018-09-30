// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;
admin.initializeApp();

////////////////////////////////////////////////////////////////////////////////////////////
//BELOW IS MESSAGING CODE

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
// ABOVE IS MATCH MESSAGING CODE
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
    const university = newValue.university;
    const current_degree = newValue.current_degree;
    const gender = newValue.gender;
    const averageRating = newValue.averageRating;
    const gender_interest = newValue.gender_interest;

    //access particular fields from old object (oldValue)
    const oldUniversity = oldValue.university;
    const oldCurrent_degree = oldValue.current_degree;
    const oldGender = oldValue.gender;
    const oldAverageRating = oldValue.averageRating;
    const oldGender_interest = oldValue.gender_interest;

    //creates a reference to the firestore 'student' collection
    var studRef = db.collection('student');

    //creates a reference to the users match list
    var matchRef = db.collection('match').doc(uid);

    if((university != oldUniversity) || (current_degree != oldCurrent_degree) || (gender != oldGender) ||
      (averageRating != oldAverageRating) || (gender_interest != oldGender_interest)){
      //check if sufficient data has been provided by user before matching algorithm is run
      if ((current_degree != null) && (university != null)){
          
        //get the users current list of matches in an object
        const getML = await matchRef.get();
        if (getML.exists) {
          const oldMList = Object.assign(getML.data());    

          //oldVerNum
          var preVerNum = oldMList.version;

          //iterate users match list version number
          var verNum = (oldMList.version + 1);

          //clear users old match list
          await createMatchList(uid, preVerNum);

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
                    var matchTotal = await match(newValue, tarUserProfile);

                    //Below code finalises and saves match to db match lists
                    //get target users old match list
                    var getTML = await tarMatchRef.get();
                    if (getTML.exists){
                        var oldTMList = Object.assign(getTML.data());

                        //iterate target users match list version number
                        var tarVerNum = (oldTMList.version + 1);
                        if(matchTotal != false){
                          await saveMatch(uid, tarStudUid, verNum, tarVerNum, matchTotal);
                        }
                        else{
                          console.log('not a match!');
                        }
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
    }
    else{
      console.log("No Important Fields in User's Profile have changed");
    }
});

function saveMatch(uid, tarStudUid, verNum, tarVerNum, matchTotal){
  return new Promise(function(resolve, reject) {
    try{
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
          resolve(console.log('set: ', res));
      });
    }catch(e){
      reject(e);
    }
  });
}

function match(student, tarUserProfile){
  return new Promise(async function(resolve, reject) {
    try{
      //access particular fields from users profile
      const uid = student.uid;
      const gender = student.gender;
      const averageRating = student.averageRating;
      const gender_interest = student.gender_interest;

      //access particular fields from target users profile
      const tarStudUid = tarUserProfile.uid;

      const getInterestCount = 'interest_';
      const getCourseCount = 'course_';

      //Match Percentage distribution:
      const uniDegreePercent = 10;
      const coursePercent = 60;
      const interestPercent = 10;
      const averageRatingPercent = 20;
      //How many stars are used in rating system:
      const numStars = 5;

      var userCoursePercent = await getPercent(student, getCourseCount, coursePercent);
      var userIntPercent = await getPercent(student, getInterestCount, interestPercent);

      //User match score (how well user matches with target user)
      var uScore = 0;
      //target user match score (how well target user matches with user)
      var tScore = 0;
      //Filter out blocked users
      var func = 'isUserBlocked';
      var idBlocked = await isFriend(uid, tarStudUid, func);
      if(idBlocked == false){
          //Filter based on gender preferences
          if((gender_interest == tarUserProfile.gender || gender_interest == 'M/F') && 
            (tarUserProfile.gender_interest == gender || tarUserProfile.gender_interest == 'M/F'))
          {
              var tarCoursePercent = await getPercent(tarUserProfile, getCourseCount, coursePercent);
              var tarIntPercent = await getPercent(tarUserProfile, getInterestCount, interestPercent);

              //Compare both users courses and calculate match score
              if((tarCoursePercent != 0) && (userCoursePercent != 0)){
                //Find how many courses both users have in common
                var courseMatchCount = await numOfMatches(student ,tarUserProfile, getCourseCount);
                if(courseMatchCount != 0){
                  uScore = uScore + (courseMatchCount * userCoursePercent);
                  tScore = tScore + (courseMatchCount * tarCoursePercent);
                }
              }
              //Compare both users interests and calculate match score
              if((tarIntPercent != 0) && (userIntPercent != 0)){
                //Find how many Interests both users have in common
                var interestMatchCount = await numOfMatches(student ,tarUserProfile, getInterestCount);
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
              //final averaged match score for both users (default adds 10% for matching based on uni & degree)
              var matchTotal = await calcMatchTotal(uScore, tScore, uniDegreePercent);
              resolve(matchTotal);
          }
          else{
            console.log('User: ', uid, ' does not have matching gender preferences with target user -> ',tarStudUid);
            resolve(false);
          }
        }
        else{
          console.log('User: ', tarStudUid, ' is blocked by ', uid, ' and therefore will not be added to match list!')
          resolve(false);
        }
    }catch(e){
      reject(e);
    }
  });
}

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
function isFriend(uid, tuid, func){
  return new Promise(async function(resolve, reject){
    try {
        //creates a reference to the users friend list
        var friendRef = db.collection('friends').doc(uid);
        //get users friend list and save to object
        const friendList = await friendRef.get();
        var FriendLt = Object.assign(friendList.data()); 

        var flSize = await getObSize(FriendLt);
        //is user friend?
        var isFriend = false;
        var lcount = 0;

        if(friendList.exists){
          if(flSize == 0){
            console.log('Friends list is EMPTY!');
            FriendLt.key1 = "empty";
            flSize++;
          }
          for(var frKey in FriendLt){
            if(FriendLt.hasOwnProperty(frKey)){
              if(FriendLt[frKey] != null){
                lcount ++;
                if(func == "rate"){
                  if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] >= 4) && (FriendLt[frKey] <= 7)){
                    isFriend = true;
                    resolve(isFriend);
                  }
                }
                else if(func == "friendReq"){
                    if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] != 2) && (FriendLt[frKey] != 4) && (FriendLt[frKey] != 6)){
                      isFriend = true;
                      lcount = 0;
                      resolve(isFriend);
                    }
                    else if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] == 2)){
                      isFriend = "alreadySent";
                      lcount = 0;
                      resolve(isFriend);
                    }
                    else if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] == 4 || FriendLt[frKey] == 6)){
                      console.log('USER is blocked/already friends and can not send request');
                      lcount = 0;
                      resolve(isFriend);
                    }
                    else if(flSize == lcount){ 
                        console.log('Target is not in friends list yet');
                        isFriend = true;
                        lcount = 0;
                        resolve(isFriend);
                    }
                    else{
                      console.log('frkey isnt target user: ',frKey);
                    }
                }
                else if (func == "friendRej"){
                  if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] == 1)){
                    isFriend = true;
                    resolve(isFriend);
                  }
                  else if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] != 1)){
                    isFriend = "cantRejORadd";
                    resolve(isFriend);
                  }
                }
                else if(func == "unFriend"){
                  if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] == 4)){
                    isFriend = true;
                    resolve(isFriend);
                  }
                  else if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] != 4)){
                    isFriend = "cantUnfriend";
                    resolve(isFriend);
                  }
                }
                else if(func == "block"){
                  if(frKey.localeCompare(tuid) == 0 || FriendLt.key1 == "empty"){
                    isFriend = true;
                    resolve(isFriend);
                  }
                  else if((frKey.localeCompare(tuid) == 0) && ((FriendLt[frKey] == 1) || (FriendLt[frKey] == 2) || (FriendLt[frKey] == 4))){
                    isFriend = "cantBlk";  //remove this else if later to make block always work
                    resolve(isFriend);
                  }              
                }
                else if(func == "ublock"){
                  if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] == 7)){
                    isFriend = "unBlock";
                    resolve(isFriend);
                  }
                }
                else if(func == "isUserBlocked"){
                  if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] == 7 || FriendLt[frKey] == 6)){
                    isFriend = true;
                    resolve(isFriend);
                  }
                  else if((frKey.localeCompare(tuid) == 0) && (FriendLt[frKey] != 7 || FriendLt[frKey] != 6)){
                    isFriend = false;
                    resolve(isFriend);
                  }
                }
                else { 
                  reject(console.log('CRITICAL ERROR: Unauthorised function call'));
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
  var func = "rate";
  //check rating is of correct value:
    if(stars >= 1 && stars <= 5){
      var isF = await isFriend(uid, tuid, func);
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

exports.friendStatus = functions.https.onCall(async(data) => {
  var uid = data.uid;
  var tuid = data.tuid;
  var status = data.status;
  
  var funcReq = "friendReq";
  var funcRej = "friendRej";
  var funcUnf = "unFriend";
  var funcBlk = "block";
  var funcUBLK = "ublock";
  // 0 = never been friends
  var statZero = 0;
  // 1 = request sent
  var reqSent = 1;
  // 2 = request received
  var reqRec = 2;
  // 3 = request rejected
  var reqRej = 3;
  // 4 = friends
  var friend = 4;
  // 5 = unfriended
  var unFriend = 5;
  // 6 = blocked
  var block = 6;
  // 7 = unblocked (user with this in friends list means they have been blocked by said user)
  var unblocked = 7;

  console.log('UID: -> ', uid);
  console.log('TUID: -> ', tuid);
  console.log('STATUS: -> ', status);

  //reference to the target student's friend list' 
  var tarFriendListRef = db.collection('friends').doc(tuid);

  //reference to the user's friend list' 
  var UserFriendListRef = db.collection('friends').doc(uid);

  //reference to the target student's friend list' 
  var tarMatchListRef = db.collection('match').doc(tuid);

  //reference to the user's friend list' 
  var UserMatchListRef = db.collection('match').doc(uid);

  //check if status number is in correct range:
    if((status >= 1) && (status <= 7) && (uid != null) && (tuid != null)){
      if(status == 1){
        console.log('status 1 if statement passes!');
        var fb = await isFriend(tuid, uid, funcReq); 
        console.log('isFriend function completes and fb = ',fb);
        if(fb == true){
          await sendToFL(uid, tuid, tarFriendListRef, UserFriendListRef, reqSent, reqRec);
          return({friendStat: fb});
        }
        else if(fb == "alreadySent"){
          //user already has a pending friend request so instead cancels request entirely
          await sendToFL(uid, tuid, tarFriendListRef, UserFriendListRef, statZero, statZero);
          return({friendStat: fb});
        }
        else if(fb == false){
          //user is either blocked or already friends
          return({friendStat: fb});
        }
        else{
          console.log("CRITICAL ERROR: [Status 1] Variable 'fb' from isFriend Function isn't being passed correctly");
          return;
        }
      }
      else if(status == 3){
        //save a 3 to tuid (user who sent request)
        //save a 0 to uid (user who received request)
        var fb = await isFriend(tuid, uid, funcRej); 
        if(fb == true){
          await sendToFL(uid, tuid, tarFriendListRef, UserFriendListRef, statZero, reqRej);
          return({friendStat: fb});
        }
        else if((fb == "cantRejORadd") || (fb == false)){
          //user is either blocked or is already friends or friend request was cancelled before rejection could happen
          return({friendStat: fb});
        }
        else{
          console.log("CRITICAL ERROR: [Status 3] Variable 'fb' from isFriend Function isn't being passed correctly");
          return;
        }       
      }
      else if(status == 4){
        //save a 4 to both users
        var fb = await isFriend(tuid, uid, funcRej);
        if(fb == true){
          await sendToFL(uid, tuid, tarFriendListRef, UserFriendListRef, friend, friend);
          return({friendStat: fb});
        }
        else if((fb == "cantRejORadd") || (fb == false)){
          //user is either blocked, already friends or friend request was cancelled
          return({friendStat: fb});
        }
        else{
          console.log("CRITICAL ERROR: [Status 4] Variable 'fb' from isFriend Function isn't being passed correctly");
          return;
        }
      }
      else if(status == 5){
        //save a 5 to both users
        var fb = await isFriend(tuid, uid, funcUnf);
        if(fb == true){
          await sendToFL(uid, tuid, tarFriendListRef, UserFriendListRef, unFriend, unFriend);
          return({friendStat: fb});
        }
        else if((fb == "cantUnfriend") || (fb == false)){
          //user isn't friends
          return({friendStat: fb});
        }
        else{
          console.log("CRITICAL ERROR: [Status 5] Variable 'fb' from isFriend Function isn't being passed correctly");
          return;
        }
      }
      else if(status == 7){
        var fb = await isFriend(tuid, uid, funcUBLK);
        if(fb == "unBlock"){
          await sendToFL(uid, tuid, tarFriendListRef, UserFriendListRef, unFriend, unFriend);
          var userProfile = await retrieveUser(uid);
          var targetProfile = await retrieveUser(tuid);

          if((userProfile != false) && (targetProfile != false)){
            await singleMatch(userProfile, targetProfile);
          }
          return({friendStat: fb}); //TODO: ask sam to refresh match list on front end when this returns "unBlock"
        }
      }
      else{
        //status equals 6
        var fb = await isFriend(tuid, uid, funcBlk);

        if(fb == true){
          await sendToFL(uid, tuid, tarFriendListRef, UserFriendListRef, block, unblocked);
          //removes user and target user from eachothers match lists 
          await deleteFieldByKey(tuid, UserMatchListRef);
          await deleteFieldByKey(uid, tarMatchListRef);
          return({friendStat: fb});
        }
        else if((fb == "cantBlk") || (fb == false)){
          //user cant be blocked
          return({friendStat: fb});
        }
        else{
          console.log("CRITICAL ERROR: [Status 5] Variable 'fb' from isFriend Function isn't being passed correctly");
          return;
        }        
      }
    }
    else{
      console.log("ERROR: friend status sent from client has incorrect format");
      throw new functions.https.HttpsError('invalid-argument', 'ERROR: data sent from client has incorrect format')
    }
});

//saves relevant values to User and target user's friends lists
function sendToFL(uid, tuid, tarFL, userFL, userVal, tarVal){
  return new Promise(function(resolve, reject) { 
    try{  
        //Data to save to friend list
        var ufData = {
          [tuid]: userVal,
        }
        //Data to save to Targets friend list
        var tfData = {
          [uid]: tarVal,
        }

        tarFL.update(tfData).then(function() {
          resolve(console.log("Successfully saved to target student's friend list"));
        }).catch(function (error) {
          reject(console.log("ERROR: Failed to save to target student's friend list"));
          throw new functions.https.HttpsError('aborted', "ERROR: Failed to save to target student's friend list", error);
        });

        userFL.update(ufData).then(function() {
          resolve(console.log("Successfully saved to friend list"));
        }).catch(function (error) {
          reject(console.log("ERROR: Failed to save to friend list"));
          throw new functions.https.HttpsError('aborted', "ERROR: Failed to save to friend list", error);
        });
      }
      catch(e){
        reject(e);
      }
  });
}

function getObSize(dataSet){
  return new Promise(function(resolve, reject){
    try{
        var counter = 0;
        for(var key in dataSet){
            if(dataSet.hasOwnProperty(key)){
                counter ++;
            }
        }
        resolve(counter);
    }catch (e){ 
        reject(e);
      }
  });
}

//retrieve a user profile and return object
function retrieveUser(uid){
  return new Promise(async function(resolve, reject){
    try{
      //creates a reference to the users profile
      var profileRef = db.collection('student').doc(uid);

      const getProfile = await profileRef.get();
      if (getProfile.exists) {
        const profile = Object.assign(getProfile.data());
        resolve(profile);
      }
      else{
        resolve(false);
      }
    }catch(e){
      reject(e);
    }
  });
}

//check if two users match
function singleMatch(userProfile, targetProfile){
  return new Promise(async function(resolve, reject){
    try{
      var uid = userProfile.uid;
      var tarStudUid = targetProfile.uid;

      //creates a reference to the users match list
      var matchRef = db.collection('match').doc(uid);
      var matchTRef = db.collection('match').doc(tarStudUid);

      var current_degree = userProfile.current_degree;
      var tarCurrent_degree = targetProfile.current_degree;

      var university = userProfile.university;
      var tarUniversity = targetProfile.university;

      if((current_degree != null) && (university != null) && (tarCurrent_degree != null) && (tarUniversity != null)){
        //get both users current list of matches into objects
        const getML = await matchRef.get();
        const getTML = await matchTRef.get();

        if(getML.exists && getTML.exists){
          const oldMList = Object.assign(getML.data());    
          const oldTMList = Object.assign(getTML.data());
    
          //iterate users match list version number
          var verNum = (oldMList.version + 1);
          var tarVerNum = (oldTMList.version + 1);

          var matchTotal = await match(userProfile, targetProfile);

          if(matchTotal != false){
            await saveMatch(uid, tarStudUid, verNum, tarVerNum, matchTotal);
            resolve(console.log('single match saved'));
          }
          else{
            resolve(console.log('not a match!'));
          }

        }else{
         resolve(console.log("Failed to retrieve match list [error]"));
        }
      }else{
        resolve(console.log('User/s have not correctly filled in UserProfile'));
      }
    }catch(e){
      reject(e);
    }
  });
}
/*
level 1 privileges: read, add, delete and create/delete admin users
level 2 privileges: read, add and delete
*/
exports.adminRemove = functions.https.onCall(async(data) => {
  //uid of admin running function
  var uid = data.uid;
  //Integer that chooses which remove function is run
  var command = data.command;
  //Reference to what needs to be deleted
  var item = data.item;
  //Specific field that needs to be deleted from item
  var subItem = data.subItem;

  //verify admin (returns admin privilege level or false if not admin)
  var adminCheck = await isAdmin(uid); 
  if((command >= 1) && (command <= 6)){
    if((adminCheck != false) && (adminCheck >= 1) && (adminCheck <= 2))
    {
      //References to Database documents
      if(item != null){
        var fromCourse = db.collection('course').doc(item);
        var fromDegree = db.collection('degree').doc(item);
      }
      var fromInterests = db.collection('interests').doc('interests');
      var cleaner = null;
      var delOne = null;
      var delTwo = null;

      if((adminCheck == 1) && (command == 1)){
        if(command == 1){
          //creates reference to admin
          var adminRef = db.collection('admin').doc(item);
          //delete admin from database
          delOne = await deleteDoc(adminRef);
          //return result to client
          if((delOne == true)){ 
            return({remove: true});
          }
        }
      }
      else if(((adminCheck == 2) || (adminCheck == 1)) && (command >= 2) && (command <= 6)){ 
        if(command == 2){ //delete university
          cleaner = await studentRemoveControl(command, item); 
          delOne = await deleteDoc(fromCourse);//<---
          delTwo = await deleteDoc(fromDegree);//<--- TODO: TEST IF BOTH CAN RUN AT SAME TIME BY REMOVING 'await'
          //return result to client
          if((cleaner == true) && (delOne == true) && (delTwo == true)){ //TODO: check if I can return this early whilst student cleaner is still not finished
            return({remove: true});
          }
          else{
            return({remove: false});
          }
        }
        else if(command == 3){ //delete degree
          //delete degree from student profiles
          cleaner = await studentRemoveControl(command, subItem);
          //delete degree from database
          delOne = await deleteFieldByKey(subItem, fromDegree);
          //return result to client
          if((cleaner == true) && (delOne == true)){ 
            return({remove: true});
          }
          else{
            return({remove: false});
          }
        }
        else if(command == 4){ //delete course
          //delete course from student profiles
          cleaner = await studentRemoveControl(command, subItem);
          //delete course from database
          delOne = await deleteFieldByKey(subItem, fromCourse);
          //return result to client
          if((cleaner == true) && (delOne == true)){ 
            return({remove: true});
          }
          else{
            return({remove: false});
          }
        }
        else if(command == 5){ //command 5, delete interest
          //delete interest from student profiles
          cleaner = await studentRemoveControl(command, subItem);
          //delete interest from database
          delOne = await deleteFieldByKey(subItem, fromInterests);
          //return result to client
          if((cleaner == true) && (delOne == true)){ 
            return({remove: true});
          }
          else{
            return({remove: false});
          }
        }
        else if(command == 6){//command 6, delete a user
          delOne = await deleteUser(uid, item);
          
          //return result to client
          if((delOne == true)){
            return({remove: delOne});
          }
          else{
            return({remove: false});
          }
        }
      }
      else{
        console.log("ERROR: User has an insufficient privilege level");
        throw new functions.https.HttpsError('aborted', "ERROR: Insufficient privilege level!");
      }
    }
    else{
      console.log("ERROR: User is not an admin");
      throw new functions.https.HttpsError('aborted', "ERROR: User is not an admin");
    }
  }
  else{
    console.log("ERROR: Command request is of incorrect type/value");
    throw new functions.https.HttpsError('failed-precondition', 'ERROR: Command request is of incorrect type/value');
  }
});

exports.adminAdd = functions.https.onCall(async(data) => {
  //uid of admin running function
  var uid = data.uid;
  //Integer that chooses which remove function is run
  var command = data.command;
  //Reference to what needs to be deleted
  var item = data.item;
  //Specific field that needs to be deleted from item
  var subItem = data.subItem;
  var addOne = null;
  var addTwo = null;
  var key = null;
  console.log('command = ',command);
  console.log('item = ',item);
  console.log('subItem = ',subItem);

  //verify admin (returns admin privilege level or false if not admin)
  console.log('ADMIN running add function = ',uid); 
  var adminCheck = await isAdmin(uid);
  if((command >= 1) && (command <= 5)){
    if((adminCheck != false) && (adminCheck >= 1) && (adminCheck <= 2))
    {
      //References to Database documents
      var toCourse = db.collection('course');
      var toDegree = db.collection('degree');
      var toInterests = db.collection('interests').doc('interests');
      var toAdmin = db.collection('admin');
      if(item != null){
        var toCourseDoc = db.collection('course').doc(item);
        var toDegreeDoc = db.collection('degree').doc(item);
        var toAdminDoc = db.collection('admin').doc(item);
      }
      if((adminCheck == 1) && (command == 1)){
        key = "privilege_level";
        addOne = await addDoc(item, toAdmin);//adds user to admin collection
        addTwo = await addField(subItem, toAdminDoc, key);//adds privilege lvl
        //return result to client
        if((addOne == true) && (addTwo == true)){
          return({add: true});
        }
        else{
          return({add: false});
        }
      }
      else if(((adminCheck == 2) || (adminCheck == 1)) && (command >= 2) && (command <= 5)){ 
        if(command == 2){ //add university
          addOne = await addDoc(item, toCourse);
          addTwo = await addDoc(item, toDegree);
          //return result to client
          if((addOne == true) && (addTwo == true)){ 
            return({add: true});
          }
          else{
            return({add: false});
          }
        }
        else if(command == 3){ //add degree
          addOne = await addField(subItem, toDegreeDoc, subItem);
          //return result to client
          if((addOne == true)){ 
            return({add: true});
          }
          else{
            return({add: false});
          }
        }
        else if(command == 4){ //add course
          addOne = await addField(subItem, toCourseDoc, subItem);
          //return result to client
          if((addOne == true)){ 
            return({add: true});
          }
          else{
            return({add: false});
          }
        }
        else{ //command 5, add interest
          addOne = await addField(subItem, toInterests, subItem);
          //return result to client
          if((addOne == true)){ 
            return({add: true});
          }
          else{
            return({add: false});
          }
        }
      }
      else{
        console.log("ERROR: User has an insufficient privilege level");
        throw new functions.https.HttpsError('aborted', "ERROR: Insufficient privilege level!");
      }
    }
    else{
      console.log("ERROR: User is not an admin");
      throw new functions.https.HttpsError('aborted', "ERROR: User is not an admin");
    }
  } 
  else{
    console.log("ERROR: Command request is of incorrect type/value");
    throw new functions.https.HttpsError('failed-precondition', 'ERROR: Command request is of incorrect type/value');
  }
});

function addDoc(item, toLocation){
  return new Promise(function(resolve, reject){
    try{
      var data = {

      } 
      var location = toLocation.doc(item);
      location.set(data).then(function(){
        console.log('doc saved to collection ', toLocation);
        resolve(true);
      }).catch(function (error){
        reject(console.log('ERROR: doc save fail: ', error));
        throw new functions.https.HttpsError('aborted', 'ERROR: doc save fail: ', error);
      });
    }
    catch(e){
      reject(e);
    }
  });
}

function addField(subItem, toLocation, key){
  return new Promise(function(resolve, reject){
    try{
      var data = {
        [key]: subItem,
      }
      toLocation.update(data).then(function(){
        console.log('field saved to document: ', subItem);
        resolve(true);
      }).catch(function (error){
        reject(console.log('ERROR: field save fail: ', error));
        throw new functions.https.HttpsError('aborted', 'ERROR: field save fail: ', error);
      });
    }
    catch(e){
      reject(e);
    }
  });
}

function isAdmin(uid){
  return new Promise(async function(resolve, reject){
    try{
      //creates a reference to the users match list
      var adminRef = db.collection('admin').doc(uid);
      //attempts to retrieve admin
      const getAdmin = await adminRef.get();
      if(getAdmin.exists){
        const adminPro = await Object.assign(getAdmin.data());
        var privLevel = adminPro.privilege_level;
        resolve(privLevel);
      }else{
        console.log("User is not an admin [error]")
        resolve(false);
      }
    }catch(e){
      reject(e);
    }
  });
}

//deletes a user and all of its related data from database
function deleteUser(uid, item){
  return new Promise(async function(resolve, reject){
    try{
      var uidCheck = await isAdmin(uid);
      var itemCheck = await isAdmin(item);
      var checkPoint = false;
      var secondCheckPoint = false;
      var adminSelfDel = false;
      
      if(uidCheck == false){//user calling function is not an admin
        if(uid == item){//user is deleting own account
          checkPoint = true;
        }
        else{
          resolve(false);
        }
      }
      
      if((uidCheck != false) || (checkPoint == true)){//either user is an admin or regular user is self deleting
        if(itemCheck == false){//target is not an admin
          secondCheckPoint = true;
        }
        else if(itemCheck != false){//target is an admin
          if(uid == item){//admin deleting self
            secondCheckPoint = true;
            adminSelfDel = true;
          }
        }

        if(secondCheckPoint == true){//either target is not an admin or user is self deleting
          var friendListRef = db.collection('friends').doc(item);
          var matchListRef = db.collection('match').doc(item);
          var ratingsRef = db.collection('ratings').doc(item);
          var profileRef = db.collection('student').doc(item);
          if(adminSelfDel == true){ 
            //creates reference to admin
            var adminRef = db.collection('admin').doc(item);
            //delete admin from database
            await deleteDoc(adminRef);
          }
          //rest of delete here
          await deleteDoc(friendListRef);
          await deleteDoc(matchListRef);
          await deleteDoc(ratingsRef);
          await deleteDoc(profileRef); //admin may not have a student profile?
          //delete target from other user friend lists
          await delFromfList(item);
          //delete target from other user match lists  
          await removeUserMatches(item);
          resolve(true);
        }
        else{
          resolve(false);
        }
      }

    }catch(e){
      reject(e);
    }
  });
}

function delFromfList(uid){
  return new Promise(function(resolve, reject){
    try{
      var friendColRef = db.collection('friends');
      friendColRef.get().then(snapshot => {
        snapshot.forEach(async doc => {
          //student friend list object
          var friendList = doc.data();
          for(var rkey in friendList){
            if(friendList.hasOwnProperty(rkey)){
              if(rkey.localeCompare(uid) == 0){
                var friendColDocRef = db.collection('friends').doc(doc.id);
                console.log('The student: ', rkey ,' is being removed from -> ',doc.id);
                //delete user from friends list
                deleteFieldByKey(uid, friendColDocRef);//fix this passing stuff
              }
            }
          }
        });
        resolve(true);
      }).catch(err => {
        reject(console.log('Error getting documents', err));
      });
    }
    catch(e){
      reject(e);
    }
  });
}

//removes tarField from tarCollectionDoc in Database
function deleteFieldByKey(tarField, tarCollectionDoc){ //TODO: might need to make another function that actually deletes both key and value
  return new Promise(function(resolve, reject) {
    try{
      tarCollectionDoc.update({
        [tarField]: FieldValue.delete(),
      }).then(function() {
        console.log("Successfully removed ", tarField, " from ", tarCollectionDoc)
        resolve(true);
      }).catch(function(){
        reject(console.log("ERROR: failed to remove ", tarField, " from ", tarCollectionDoc));
      });
    }
    catch(e){
      reject(e);
    }
  });
}

//removes tarDoc from tarCollection in Database
function deleteDoc(tarCollectionDoc){
  return new Promise(function(resolve, reject) {
    try{
      tarCollectionDoc.delete().then(function() {
        console.log("Successfully removed ", tarCollectionDoc);
        resolve(true);
      }).catch(function(error){
        reject(console.log("ERROR: failed to remove ", ' -> ', error));
      });
    }
    catch(e){
      reject(e);
    }
  });
}

//loops through and removes certain items (fields) from student profiles
function studentRemoveControl(command, item){
  return new Promise(function(resolve, reject) {
    try{
      var studProfile = db.collection('student');

      if(command == 2){//Delete University (removing related info from student profiles)
        //query for all students with university field == to item
        studProfile.where('university', '==', item).get().then(snapshot => {
          snapshot.forEach(async doc => {
            //student profile object
            var userProfile = doc.data();
            console.log('The student: ', userProfile.uid ,' is having there profile cleaned by remove Uni function');
            //reset courses, uni and degree to null
            studProfile.doc(doc.id).update({
              course_1: null,
              course_2: null,
              course_3: null,
              course_4: null,
              course_5: null,
              course_6: null,
              current_degree: null,
              university: null,
            });
          });
          resolve(true);
        }).catch(err => {
          reject(console.log('Error getting documents', err));
        });
      }
      else if(command == 3){//Delete Degree (removing related info from student profiles)
        //query for all students with degree field == to item
        studProfile.where('current_degree', '==', item).get().then(snapshot => {
          snapshot.forEach(async doc => {
            //student profile object
            var userProfile = doc.data();
            console.log('The student: ', userProfile.uid ,' is having there profile cleaned by remove Degree function');
            //reset courses and degree to null
            studProfile.doc(doc.id).update({
              course_1: null,
              course_2: null,
              course_3: null,
              course_4: null,
              course_5: null,
              course_6: null,
              current_degree: null,
            });
          });
          resolve(true);
        }).catch(err => {
          reject(console.log('Error getting documents', err));
        });
      }
      else if(command == 4){//Remove a course from student profile
        //query for all students 
        studProfile.get().then(snapshot => {
          snapshot.forEach(async doc => {
            //student profile object
            var userProfile = doc.data();
            console.log('The student: ', userProfile.uid ,' is having there profile cleaned by remove Course function');
            //reset course to null
            if(userProfile.course_1 == item)
            {
              studProfile.doc(doc.id).update({
                course_1: null,
              });
            }
            else if(userProfile.course_2 == item){
              studProfile.doc(doc.id).update({
                course_2: null,
              });
            }
            else if(userProfile.course_3 == item){
              studProfile.doc(doc.id).update({
                course_3: null,
              });
            }
            else if(userProfile.course_4 == item){
              studProfile.doc(doc.id).update({
                course_4: null,
              });
            }
            else if(userProfile.course_5 == item){
              studProfile.doc(doc.id).update({
                course_5: null,
              });
            }
            else if(userProfile.course_6 == item){
              studProfile.doc(doc.id).update({
                course_6: null,
              });
            }
          });
          resolve(true);
        }).catch(err => {
          reject(console.log('Error getting documents', err));
        });
      }
      else if(command == 5){//Remove an interest from student profile
        //query for all students 
        studProfile.get().then(snapshot => {
          snapshot.forEach(async doc => {
            //student profile object
            var userProfile = doc.data();
            console.log('The student: ', userProfile.uid ,' is having there profile cleaned by remove Interest function');
            //reset course to null
            if(userProfile.interest_1 == item)
            {
              studProfile.doc(doc.id).update({
                interest_1: null,
              });
            }
            else if(userProfile.interest_2 == item){
              studProfile.doc(doc.id).update({
                interest_2: null,
              });
            }
            else if(userProfile.interest_3 == item){
              studProfile.doc(doc.id).update({
                interest_3: null,
              });
            }
            else if(userProfile.interest_4 == item){
              studProfile.doc(doc.id).update({
                interest_4: null,
              });
            }
          });
          resolve(true);
        }).catch(err => {
          reject(console.log('Error getting documents', err));
        });
      }
      else{
        reject(console.log("ERROR: incorrect command has been requested"));
      }
    }
    catch(e){
      reject(e);
    }
  });
}

