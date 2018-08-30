var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the crurrent tab

function showTab(n) {
  // This function will display the specified tab of the form...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  //... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  //... and run a function that will display the correct step indicator:
  fixStepIndicator(n)
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form...
  if (currentTab >= x.length) {
    // ... the form gets submitted:
    document.getElementById("regForm").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");
  // A loop that checks every input field in the current tab:
  for (i = 0; i < y.length; i++) {
    // If a field is empty...
    if (y[i].value == "") {
      // add an "invalid" class to the field:
      y[i].className += " invalid";
      // and set the current valid status to false
      valid = false;
    }
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class on the current step:
  x[n].className += " active";
}


const firestore = firebase.firestore();
const settings = { /* your settings... */
  timestampsInSnapshots: true
};
firestore.settings(settings);

// Loads list of universities from database and adds them to the drop down-list
function loadUniversities() {
  firestore.collection("degree").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      const degrees = doc.data();
      // Add the name of each university to list of options
      $('#university').append( new Option(doc.id,doc.id) );
      console.log(doc.id, " => ", doc.data());
    });
  });
}

// Loads list of degrees from database and adds them to the drop down-list
function loadDegrees() {
  // Make the degree question visible
  $("#degreeQuestion").fadeIn();

  // Remove all existing options from drop-down list
  document.getElementById('degree').options.length = 0;
  // Add the placeholder option
  $('#degree').append( new Option(" -Please select your degree-",""));

  // Retrieve list of degrees from Firestore
  const degreesRef = firestore.doc("degree/" + $('#university').val());
  degreesRef.get().then(function (doc) {
    if (doc && doc.exists) {
      const degrees = doc.data();
      console.log("Retrieved degrees: ", Object.values(degrees));

      // Fill in the degree drop-down list with the new values
      $.each(degrees, function(val, text) {
        $('#degree').append( new Option(text,val) );
      });
      // Display the degree drop-down box
      $("#degree").fadeIn();
      // Load the list of subjects for the next page
      loadSubjects($('#university').val());
    }
  }).catch(function (error) {
    console.log("Failed to retrieve error: ", error)
  });
}

// Loads list of subjects from database and add them to the drop down-lists
function loadSubjects(university) {
  // Remove all existing options from drop-down list
  document.getElementById('subject1').options.length = 0;
  document.getElementById('subject2').options.length = 0;
  document.getElementById('subject3').options.length = 0;
  document.getElementById('subject4').options.length = 0;

  // Add the placeholder option
  $('#subject1').append( new Option(" -Please select your subject-",""));
  $('#subject2').append( new Option(" -Please select your subject-",""));
  $('#subject3').append( new Option(" -Please select your subject-",""));
  $('#subject4').append( new Option(" -Please select your subject-",""));

  const subjectsRef = firestore.doc("course/" + university);
  subjectsRef.get().then(function (doc) {
    if (doc && doc.exists) {
      const subjects = doc.data();
      console.log("Values: ", Object.values(subjects));
      console.log("Count: ", Object.values(subjects).length);

      // Add each subject to the drop down list
      $.each(subjects, function(val, text) {
        $('#subject1').append( new Option(text,val) );
        $('#subject2').append( new Option(text,val) );
        $('#subject3').append( new Option(text,val) );
        $('#subject4').append( new Option(text,val) );
      });
    }
  }).catch(function (error) {
    console.log("Failed to retrieve error: ", error)
  });
}

// Loads list of interests from database and add them to the drop down-lists
function loadInterests() {
  const interestsRef = firestore.doc("interests/interests");
  interestsRef.get().then(function (doc) {
    if (doc && doc.exists) {
      const interests = doc.data();
      console.log("Values: ", Object.values(interests));
      console.log("Count: ", Object.values(interests).length);

      // Add each interest to the drop down list
      $.each(interests, function(val, text) {
        $('#interest1').append( new Option(text,val) );
        $('#interest2').append( new Option(text,val) );
        $('#interest3').append( new Option(text,val) );
      });

    }
  }).catch(function (error) {
    console.log("Failed to retrieve error: ", error)
  });
}

loadUniversities();

loadInterests();