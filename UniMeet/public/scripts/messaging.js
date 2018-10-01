// JavaScript Document

const firestore = firebase.firestore();
const settings = { /* your settings... */
	timestampsInSnapshots: true
};
firestore.settings(settings);

var selectedProfileID = window.localStorage.getItem("selectedProfileID");

var currentUser;
var collectionOfMessagedUsers = {};
var selectedUser;


firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		// User is signed in.
		var user = firebase.auth().currentUser;

		const docRef = firestore.doc("student/" + user.uid);

		getCurrentUser(docRef);

		document.getElementById('submitBtn').addEventListener('click', function () {
			saveMessage(document.getElementById('message').value.trim());
			// Clear message section when message is sent
			document.getElementById('message').value = "";
		});
		document.getElementById('refreshButton').addEventListener('click', function () {
			checkHistory();
		});
		document.getElementById('newConversation').addEventListener('click', function () {
			window.open("/friends.html", "_self");
		});
	} else {
		// No user is signed in.
		// Redirect them to home page
		document.location.href = "/";
	}


});


function getCurrentUser(docRef) {

	docRef.get().then(function (doc) {
		if (doc && doc.exists) {
			const student = doc.data();
			currentUser = student;

			loadUserConversations();

		}
	})

}



function loadUserConversations() {
	firebase.database().ref('/messages/').on('value', function (snapshot) {
		snapshot.forEach(function (childSnapshot) {

			var uids = childSnapshot.key.split("-");

			if (uids.indexOf(currentUser.uid) > -1) {
				let currentUserIndex = uids.indexOf(currentUser.uid);
				let selectedUserID = uids[1 - currentUserIndex];

				firestore.doc("student/" + selectedUserID).get().then(function (doc) {
					if (doc && doc.exists) {
						const user = doc.data();
						collectionOfMessagedUsers[user.uid] = user;
						createUserCell(user);
					}
				})
			}
		});
		//checkHistory();
	});	
}



function createUserCell(user) {

	var cell = document.createElement('div');
	cell.setAttribute('class', 'userCell');
	cell.addEventListener('click', function () {
		console.log("Active");
		selectedProfileID = user.uid;
		// Set active highlight
		$(this).removeClass('userCell').addClass('userCellActive').siblings().removeClass('userCellActive').addClass('userCell');
		loadMessages(user.uid);
	});

	var userImage = document.createElement('img');
	userImage.setAttribute('class', 'userImage');
	userImage.src = user.profile_image;
	cell.appendChild(userImage);

	var textContainer = document.createElement('div');
	textContainer.setAttribute('class', 'textContainer');

	var nameLabel = document.createElement('div');
	nameLabel.setAttribute('class', 'bodyText boldText');
	nameLabel.innerHTML = user.name;
	textContainer.appendChild(nameLabel);

	var messagePreview = document.createElement('div');
	messagePreview.setAttribute('class', 'smallText lightTextColour');
	messagePreview.innerHTML = "Message preview";
	textContainer.appendChild(messagePreview);

	cell.appendChild(textContainer);

	document.getElementById("userBar").appendChild(cell);
}


function checkHistory() {

	// Clear the contents of the user bar
	document.getElementById("userBar").innerHTML = "";

	for (var key in collectionOfMessagedUsers) {
		console.log(key, collectionOfMessagedUsers[key]);
	}

	console.log("Not in history");
	firestore.doc("student/" + selectedProfileID).get().then(function (doc) {
		if (doc && doc.exists) {
			const user = doc.data();
			collectionOfMessagedUsers[user.uid] = user;
			createUserCell(user);
		}
	});

	if (selectedProfileID in collectionOfMessagedUsers) {
		console.log("In history");
		loadMessages(selectedProfileID);
	}
}



// Loads chat messages history and listens for upcoming ones.
function loadMessages(key) {

	if (key in collectionOfMessagedUsers) {
		selectedUser = collectionOfMessagedUsers[key];
	}

	let messageView = document.getElementById('messages')
	while (messageView.firstChild) {
		messageView.removeChild(messageView.firstChild);
	}

	var uids = [key, currentUser.uid].sort();

	// Loads the last 12 messages and listen for new ones.
	var callback = function (snap) {
		var data = snap.val();
		if (data.uid == currentUser.uid) {
			displayMessage(currentUser, data.text);
		} else if (data.uid == selectedUser.uid) {
			displayMessage(selectedUser, data.text);
		} else {
			console.log("ERROR");
		}
	}
	firebase.database().ref('/messages/' + uids[0] + '-' + uids[1]).on('child_added', callback);
	firebase.database().ref('/messages/' + uids[0] + '-' + uids[1]).on('child_changed', callback);
}



function saveMessage(messageText) {

	var uids = [selectedUser.uid, currentUser.uid].sort();

	return firebase.database().ref('/messages/' + uids[0] + '-' + uids[1]).push({
		uid: currentUser.uid,
		text: messageText
	}).catch(function (error) {
		console.error('Error writing new message to Firebase Database', error);
	});
}




// Displays a Message in the UI.
function displayMessage(user, text) {

	var container = document.createElement('div');
	container.setAttribute('class', 'messageContainer');

//	var sender = document.createElement('div');
//	sender.setAttribute('class', 'messageName lightTextColour');
//	sender.innerHTML = user.name;
//	container.appendChild(sender);

	if (user.uid == currentUser.uid) {

		var messageBubble = document.createElement('div');
		messageBubble.setAttribute('class', 'messageInlineBlockSent');

		var message = document.createElement('div');
		message.setAttribute('class', 'messageBubbleSent');
		message.innerHTML = text;
		messageBubble.appendChild(message);

		var imageIcon = document.createElement('img');
		imageIcon.setAttribute('class', 'messageImageIconSent');
		imageIcon.src = user.profile_image;
		messageBubble.appendChild(imageIcon);

		container.appendChild(messageBubble);

		document.getElementById('messages').appendChild(container);

	} else {

		var messageBubble = document.createElement('div');
		messageBubble.setAttribute('class', 'messageInlineBlockRecieved');

		var message = document.createElement('div');
		message.setAttribute('class', 'messageBubbleRecieved');
		message.innerHTML = text;
		messageBubble.appendChild(message);

		var imageIcon = document.createElement('img');
		imageIcon.setAttribute('class', 'messageImageIconRecieved');
		imageIcon.src = user.profile_image;
		messageBubble.appendChild(imageIcon);

		container.appendChild(messageBubble);

		document.getElementById('messages').appendChild(container);

	}

	//	if (picUrl) {
	//		div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
	//	}
	//	div.querySelector('.name').textContent = name;
	//	var messageElement = div.querySelector('.message');
	//	if (text) { // If the message is text.
	//		messageElement.textContent = text;
	//		// Replace all line breaks by <br>.
	//		messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
	//	}
	//	} else if (imageUrl) { // If the message is an image.
	//		var image = document.createElement('img');
	//		image.addEventListener('load', function () {
	//			messageListElement.scrollTop = messageListElement.scrollHeight;
	//		});
	//		image.src = imageUrl + '&' + new Date().getTime();
	//		messageElement.innerHTML = '';
	//		messageElement.appendChild(image);
	//	}
	// Show the card fading-in and scroll to view the new message.
	//	setTimeout(function () {
	//		div.classList.add('visible')
	//	}, 1);
	//	messageListElement.scrollTop = messageListElement.scrollHeight;
	//	messageInputElement.focus();
}





//
//
//
//
//// Returns the signed-in user's profile Pic URL.
//function getProfilePicUrl() {
//	return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
//}
//
//// Returns the signed-in user's display name.
//function getUserName() {
//	return firebase.auth().currentUser.displayName;
//}
//
//// Returns true if a user is signed-in.
//function isUserSignedIn() {
//	return !!firebase.auth().currentUser;
//}
//
//// Loads chat messages history and listens for upcoming ones.
//function loadMessages() {
//	// Loads the last 12 messages and listen for new ones.
//	var callback = function (snap) {
//		var data = snap.val();
//		displayMessage(snap.key, data.name, data.text, data.profilePicUrl, data.imageUrl);
//	};
//	// Restrict messages displayed
//	// firebase.database().ref('/messages/').limitToLast(12).on('child_added', callback);
//	// firebase.database().ref('/messages/').limitToLast(12).on('child_changed', callback);
//	firebase.database().ref('/messages/').on('child_added', callback);
//	firebase.database().ref('/messages/').on('child_changed', callback);
//}
//
//// Saves a new message on the Firebase DB.
//function saveMessage(messageText) {
//
//	// Add a new message entry to the Firebase database.
//
//
//
//	return firebase.database().ref('/messages/' + selectedProfileID + '-' + currentUserID).push({
//		name: getUserName(),
//		text: messageText,
//		profilePicUrl: getProfilePicUrl()
//	}).catch(function (error) {
//		console.error('Error writing new message to Firebase Database', error);
//	});
//}
//
//// Saves a new message containing an image in Firebase.
//// This first saves the image in Firebase storage.
//function saveImageMessage(file) {
//	// 1 - We add a message with a loading icon that will get updated with the shared image.
//	firebase.database().ref('/messages/').push({
//		name: getUserName(),
//		imageUrl: LOADING_IMAGE_URL,
//		profilePicUrl: getProfilePicUrl()
//	}).then(function (messageRef) {
//		// 2 - Upload the image to Cloud Storage.
//		var filePath = firebase.auth().currentUser.uid + '/' + messageRef.key + '/' + file.name;
//		return firebase.storage().ref(filePath).put(file).then(function (fileSnapshot) {
//			// 3 - Generate a public URL for the file.
//			return fileSnapshot.ref.getDownloadURL().then((url) => {
//				// 4 - Update the chat message placeholder with the image’s URL.
//				return messageRef.update({
//					imageUrl: url,
//					storageUri: fileSnapshot.metadata.fullPath
//				});
//			});
//		});
//	}).catch(function (error) {
//		console.error('There was an error uploading a file to Cloud Storage:', error);
//	});
//}
//
//// Saves the messaging device token to the datastore.
//function saveMessagingDeviceToken() {
//	firebase.messaging().getToken().then(function (currentToken) {
//		if (currentToken) {
//			console.log('Got FCM device token:', currentToken);
//			// Saving the Device Token to the datastore.
//			firebase.database().ref('/fcmTokens').child(currentToken)
//				.set(firebase.auth().currentUser.uid);
//		} else {
//			// Need to request permissions to show notifications.
//			requestNotificationsPermissions();
//		}
//	}).catch(function (error) {
//		console.error('Unable to get messaging token.', error);
//	});
//}
//
//// Requests permissions to show notifications.
//function requestNotificationsPermissions() {
//	console.log('Requesting notifications permission...');
//	firebase.messaging().requestPermission().then(function () {
//		// Notification permission granted.
//		saveMessagingDeviceToken();
//	}).catch(function (error) {
//		console.error('Unable to get permission to notify.', error);
//	});
//}
//
//// Triggered when a file is selected via the media picker.
//function onMediaFileSelected(event) {
//	event.preventDefault();
//	var file = event.target.files[0];
//
//	// Clear the selection in the file picker input.
//	imageFormElement.reset();
//
//	// Check if the file is an image.
//	if (!file.type.match('image.*')) {
//		var data = {
//			message: 'You can only share images',
//			timeout: 2000
//		};
//		signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
//		return;
//	}
//	// Check if the user is signed-in
//	if (checkSignedInWithMessage()) {
//		saveImageMessage(file);
//	}
//}
//
//// Triggered when the send new message form is submitted.
//function onMessageFormSubmit() {
//	if (messageInputElement.value) {
//		saveMessage(messageInputElement.value).then(function () {
//			// Clear message text field and re-enable the SEND button.
//			resetMaterialTextfield(messageInputElement);
//			toggleButton();
//		});
//	}
//}
//
//// Triggers when the auth state change for instance when the user signs-in or signs-out.
//function authStateObserver(user) {
//	if (user) { // User is signed in!
//		// Get the signed-in user's profile pic and name.
//		var profilePicUrl = getProfilePicUrl();
//		var userName = getUserName();
//
//		// Set the user's profile pic and name.
//		userPicElement.style.backgroundImage = 'url(' + profilePicUrl + ')';
//		userNameElement.textContent = userName;
//
//		// Show user's profile and sign-out button.
//		userNameElement.removeAttribute('hidden');
//		userPicElement.removeAttribute('hidden');
//		signOutButtonElement.removeAttribute('hidden');
//
//		// Hide sign-in button.
//		signInButtonElement.setAttribute('hidden', 'true');
//
//		// We save the Firebase Messaging Device token and enable notifications.
//		saveMessagingDeviceToken();
//	} else { // User is signed out!
//		// Hide user's profile and sign-out button.
//		userNameElement.setAttribute('hidden', 'true');
//		userPicElement.setAttribute('hidden', 'true');
//		signOutButtonElement.setAttribute('hidden', 'true');
//
//		// Show sign-in button.
//		signInButtonElement.removeAttribute('hidden');
//	}
//}
//
//// Returns true if user is signed-in. Otherwise false and displays a message.
//function checkSignedInWithMessage() {
//	// Return true if the user is signed in Firebase
//	if (isUserSignedIn()) {
//		return true;
//	}
//
//	// Display a message to the user using a Toast.
//	var data = {
//		message: 'You must sign-in first',
//		timeout: 2000
//	};
//	signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
//	return false;
//}
//
//// Resets the given MaterialTextField.
//function resetMaterialTextfield(element) {
//	element.value = '';
//	element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
//}
//
//// Template for messages.
//var MESSAGE_TEMPLATE =
//	'<div class="message-container">' +
//	'<div class="spacing"><div class="pic"></div></div>' +
//	'<div class="message"></div>' +
//	'<div class="name"></div>' +
//	'</div>';
//
//// A loading image URL.
//var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';
//
//// Displays a Message in the UI.
//function displayMessage(key, name, text, picUrl, imageUrl) {
//	var div = document.getElementById(key);
//	// If an element for that message does not exists yet we create it.
//	if (!div) {
//		var container = document.createElement('div');
//		container.innerHTML = MESSAGE_TEMPLATE;
//		div = container.firstChild;
//		div.setAttribute('id', key);
//		messageListElement.appendChild(div);
//	}
//	if (picUrl) {
//		div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
//	}
//	div.querySelector('.name').textContent = name;
//	var messageElement = div.querySelector('.message');
//	if (text) { // If the message is text.
//		messageElement.textContent = text;
//		// Replace all line breaks by <br>.
//		messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
//	} else if (imageUrl) { // If the message is an image.
//		var image = document.createElement('img');
//		image.addEventListener('load', function () {
//			messageListElement.scrollTop = messageListElement.scrollHeight;
//		});
//		image.src = imageUrl + '&' + new Date().getTime();
//		messageElement.innerHTML = '';
//		messageElement.appendChild(image);
//	}
//	// Show the card fading-in and scroll to view the new message.
//	setTimeout(function () {
//		div.classList.add('visible')
//	}, 1);
//	messageListElement.scrollTop = messageListElement.scrollHeight;
//	messageInputElement.focus();
//}
//
//// Enables or disables the submit button depending on the values of the input
//// fields.
//function toggleButton() {
//	if (messageInputElement.value) {
//		submitButtonElement.removeAttribute('disabled');
//	} else {
//		submitButtonElement.setAttribute('disabled', 'true');
//	}
//}
//
//// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
	if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
		window.alert('You have not configured and imported the Firebase SDK. ' +
			'Make sure you go through the codelab setup instructions and make ' +
			'sure you are running the codelab using `firebase serve`');
	}
}
//
//// Checks that Firebase has been imported.
checkSetup();
//
// Shortcuts to DOM Elements.
//var messageListElement = document.getElementById('messages');
//var messageFormElement = document.getElementById('message-form');
//var messageInputElement = document.getElementById('message');
//var submitButtonElement = document.getElementById('submit');
//var imageButtonElement = document.getElementById('submitImage');
//var imageFormElement = document.getElementById('image-form');
//var mediaCaptureElement = document.getElementById('mediaCapture');
//var userPicElement = document.getElementById('user-pic');
//var userNameElement = document.getElementById('user-name');
//var signInButtonElement = document.getElementById('sign-in');
//var signOutButtonElement = document.getElementById('sign-out');
//var signInSnackbarElement = document.getElementById('must-signin-snackbar');
//
//// Saves message on form submit.
//submitButtonElement.addEventListener('click', function() {
//	saveMessage(messageInputElement.value);
//});
////signOutButtonElement.addEventListener('click', signOut);
////signInButtonElement.addEventListener('click', signIn);
//
//// Toggle for the button.
//messageInputElement.addEventListener('keyup', toggleButton);
//messageInputElement.addEventListener('change', toggleButton);
//
//// Events for image upload.
//imageButtonElement.addEventListener('click', function (e) {
//	e.preventDefault();
//	mediaCaptureElement.click();
//});
//mediaCaptureElement.addEventListener('change', onMediaFileSelected);
//
//// initialize Firebase

// Initiate firebase auth.
//initFirebaseAuth();
//
//// We load currently existing chat messages and listen to new ones.
//loadMessages();
