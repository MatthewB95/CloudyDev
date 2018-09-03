// JavaScript Document

function getStudent(docRef) {
  docRef.get().then(function (doc) {
    if (doc && doc.exists) {
      const student = doc.data();
		
		var courses;
	
		for (var key in student) {
			if key.includes("course_") {
				courses.append()
			}
		}
		
		return {
			name: student.name,
			age: 21,
			gender: student.gender,
			universityName: student.university,
			
			
		}
		
	}
  });
}