
// Note: You will edit this file in the follow up codelab about the Cloud Functions for Firebase.

// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
admin.initializeApp();

// Adds information about the new user to database
exports.addNewUserInfo = functions.auth.user().onCreate(async (user) => {
    console.log('A new user signed in for the first time.');

    //Saves new user's info to db
    await admin.database().ref('/users/' + user.uid + '/userinfo').set({
        username: user.displayName,
        userid: user.uid,
        userpicurl: user.photoURL
    })
    console.log('New user\'s info written to database.');
});

