const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = { 
  apiKey: "AIzaSyC1UjMHGBoujGR7uAzfG-DaMv2fSVcTVpg",
  authDomain: "kiei-451-3b1ee.firebaseapp.com",
  projectId: "kiei-451-3b1ee",
  storageBucket: "kiei-451-3b1ee.appspot.com",
  messagingSenderId: "441179416447",
  appId: "1:441179416447:web:d0fec3b3e07d2c3fc9dc4a"
} // replace

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase