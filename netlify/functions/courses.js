// Goal: Kellogg course reviews API!
//
// Business logic:
// - Courses can be taught by more than one lecturer (e.g. Brian Eng's KIEI-451 and Ben Block's KIEI-451)
// - Information on a course includes the course number (KIEI-451) and name (Intro to Software Development)
// - Lecturers can teach more than one course (e.g. Brian Eng teaches KIEI-451 and KIEI-925)
// - Reviews can be written (anonymously) about the lecturer/course combination (what would that be called?)
// - Reviews contain a String body, and a numeric rating from 1-5
// - Keep it simple and ignore things like multiple course offerings and quarters; assume reviews are written
//   about the lecturer/course combination only – also ignore the concept of a "user" and assume reviews
//   are written anonymously
//
// Tasks:
// - (Lab) Think about and write the domain model - fill in the blanks below
// - (Lab) Build the domain model and some sample data using Firebase
// - (Lab) Write an API endpoint, using this lambda function, that accepts a course number and returns 
//   information on the course and who teaches it
// - (Homework) Provide reviews of the lecturer/course combinations 
// - (Homework) As part of the returned API, provide the total number of reviews and the average rating for 
//   BOTH the lecturer/course combination and the course as a whole.

// === Domain model - fill in the blanks ===
// There are 4 models: __Courses___, __Lecturers___, __Reviews___, _____
// There is one many-to-many relationship: _Reviewers____ <-> _Lecturer/Course____, which translates to two one-to-many relationships:
// - One-to-many: _Review____ -> _Course____
// - One-to-many: _Review____ -> __Lecture___
// And one more one-to-many: _____ -> _____
// Therefore:
// - The first model, _Course____, contains the following fields (not including ID): __ID___, _Name____ 
// - The second model, __Lecturer___, contains the following fields: _Lecturer____
// - The third model, __Course/Lecture___, contains the following fields: __Course___, __Lecturer___
// - The fourth model, _Reviews___, contains the following fields, __Review #___, _Review Body____, _Course/Lecture ID____

// allows us to use firebase
let firebase = require(`./firebase`)

// /.netlify/functions/courses?courseNumber=KIEI-451
exports.handler = async function(event) {
  let returnValue = []
  // get the course number being requested
  let courseNumber="KIEI451"
  // establish a connection to firebase in memory
  let db = firebase.firestore()

  // ask Firebase for the course that corresponds to the course number, wait for the response
  let courseQuery = await db.collection('Courses').where(`ID`,`==`,courseNumber).get()
  let courses = courseQuery.docs

  // get the first document from the query
  let firstCourse = courses[0]

  // get the id from the document
  let firstCourseId = firstCourse.id 

  // get the data from the document
  let firstCourseData = firstCourse.data()

  let courseName = firstCourseData.Name

  let firstCourseID = firstCourseData.ID
  // create an object with the course data to hold the return value from our lambda
  let courseObject = {
      id: firstCourseID,
      name: courseName,
      sections: [],
      averageCourseRating: "",
      numberOfReviews:""
  }

  let numberOfReviewsTotal = 0
  let totalRating = 0
  // set a new Array as part of the return value
  
  //console.log(`firstCourseId: ${firstCourseId}`)
  // ask Firebase for the sections corresponding to the Document ID of the course, wait for the response
  let sectionQuery = await db.collection('courseLecturer').where(`course`,`==`,firstCourseId).get()


  // get the documents from the query
  let sections = sectionQuery.docs
  // loop through the documents
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++){
    let section = sections[sectionIndex]

    // get the document ID of the section
    let sectionId = section.id

    // get the data from the section
    let sectionData = section.data()

    // create an Object to be added to the return value of our lambda
    let lecturerId = sectionData.lecturer
    let sectionObject = {
      id: sectionId,
      course: sectionData.course,
      lecturer: [],
      reviewInfo: [],
      averagingSectionRating: ""
    }
    // ask Firebase for the lecturer with the ID provided by the section; hint: read "Retrieve One Document (when you know the Document ID)" in the reference
    let docRef = await db.collection(`lecturers`).doc(sectionData.lecturer).get()
    let item = docRef.data()
    
    // get the data from the returned document
    let lecturerName = item.name
    sectionObject.lecturer.push(lecturerName)

    // add the lecturer's name to the section Object
   
    // add the section Object to the return value
    courseObject.sections.push(sectionObject)

    // 🔥 your code for the reviews/ratings goes here
    //get the review that has a section ID equal to the section ID we are looking at
    //console.log(sectionId)
    let reviewQuery = await db.collection('reviews').where(`section`,`==`,sectionId).get()
    let reviews = reviewQuery.docs
    //console.log(reviews.length)
    //loop through the reviews
    numSectionReviews = 0
    totalSectionRatings = 0

    for (reviewIndex = 0; reviewIndex < reviews.length; reviewIndex ++){
      numberOfReviewsTotal++
      numSectionReviews++
      //get the current review
      //console.log(`In the review loop`)
      review = reviews[reviewIndex]
      let reviewData = review.data()

        //get the body and rating of the review
      reviewBody = reviewData.body
      reviewRating = reviewData.rating
      //console.log(reviewBody)

      totalRating = totalRating + reviewRating
      totalSectionRatings = totalSectionRatings + reviewRating

      //add the body and rating to a review object
      let reviewObject = {
        body: reviewBody,
        rating: reviewRating
      }

      //push the review object to the section object
      sectionObject.reviewInfo.push(reviewObject)


    }

    sectionObject.averagingSectionRating = totalSectionRatings/numSectionReviews
    console.log(totalSectionRatings/numSectionReviews)
    
  }
  console.log(numberOfReviewsTotal)
  courseObject.averageCourseRating = totalRating/numberOfReviewsTotal
  courseObject.numberOfReviews = numberOfReviewsTotal

  // return the standard response
  return {
    statusCode: 200,
    body: JSON.stringify(courseObject)
  }
}
