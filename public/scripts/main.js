'use strict';

// Signs-in Simple Contacts
function signIn() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}
// Signs-out of Simple Contacts
function signOut() {
    // Sign out of Firebase.
    contactsElement.innerHTML='';
    firebase.auth().signOut();
}

// Initiate firebase auth.
function initFirebaseAuth() {
    // Listen to auth state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
    return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}
// Returns the signed-in user's display name.
function getUserName() {
    return firebase.auth().currentUser.displayName;
}
// Returns the signed-in user's UID
function getUserID(){
    return firebase.auth().currentUser.uid;
}


// Returns true if a user is signed-in.
function isUserSignedIn() {
    return !!firebase.auth().currentUser;
}
//
function newContactDialog(){    //
    newContactDialogElement.showModal();
    newContactDialogElement.querySelector('.close').addEventListener('click', function() {
        newContactDialogElement.close();
    });
   // newContactDialogElement.querySelector('#create-contact-btn').addEventListener('click', addContact);
}
function addContact() {
    //переделать
    contactListEmpty();
    firebase.database().ref('/users/' + getUserID() + '/contacts/').push({
        firstname: firstNameFieldElement.value,
        lastname: lastNameFieldElement.value,
        phone: phoneFieldElement.value
    }).catch(function(error) {
        console.error('Error writing new message to Realtime Database:', error);
    });
    firstNameFieldElement.value ='';
    lastNameFieldElement.value ='';
    phoneFieldElement.value ='';
    newContactDialogElement.close();
}
function expandContactDialog(contactID){
    expandContactDialogElement.showModal();
    expandContactDialogElement.querySelector('.mdl-dialog__content').innerHTML = '';

    firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID).once('value').then(function(snapshot) {
        expandContactDialogElement.querySelector('.mdl-dialog__title').innerHTML = snapshot.val().firstname + ' ' + snapshot.val().lastname;
        snapshot.forEach(function(item){
            if(item.val() != '') {
                expandContactDialogElement.querySelector('.mdl-dialog__content').innerHTML += item.key + ' ';
                expandContactDialogElement.querySelector('.mdl-dialog__content').innerHTML += item.val() + ' ';
            }
        });
    });
    expandContactDialogElement.querySelector('.close').addEventListener('click', function() {
        expandContactDialogElement.close();
    });
    expandContactDialogElement.querySelector('.deleteContactButton').addEventListener('click', function() {
        deleteContact(contactID);
        contactsElement.removeChild(document.getElementById(contactID));
        expandContactDialogElement.close();
        contactListEmpty();
    });
}

function deleteContact(contactID) {
    firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID).remove()
        .then(function() {
            console.log("Remove succeeded.")
        })
        .catch(function(error) {
            console.log("Remove failed: " + error.message)
        });
}

function contactListEmpty() {
    setTimeout(function () {
        if (contactsElement.innerHTML == ''){
            contactListEmptyElement.removeAttribute('hidden');
        }else{
            contactListEmptyElement.setAttribute('hidden', true);
        }
    }, 1200)
}


//var userID;
// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
    if (user) { // User is signed in!
        // Get the signed-in user's profile pic and name.
        var profilePicUrl = getProfilePicUrl();
        var userName = getUserName();


        // Set the user's profile pic and name.
        userPicElement.style.backgroundImage = 'url(' + profilePicUrl + ')';
        userNameElement.textContent = userName;
        loadContacts(getUserID());
        contactListEmpty();


        // Show user's profile and sign-out button.
        userNameElement.removeAttribute('hidden');
        userPicElement.removeAttribute('hidden');
        signOutButtonElement.removeAttribute('hidden');
        contactsBlockElement.removeAttribute('hidden');

        // Hide sign-in buttons and welcome text
        signInButtonElement.setAttribute('hidden', 'true');
        welcomeBlockElement.setAttribute('hidden', 'true');


    } else { // User is signed out!
        // Hide user's profile and sign-out button.
        userNameElement.setAttribute('hidden', 'true');
        userPicElement.setAttribute('hidden', 'true');
        signOutButtonElement.setAttribute('hidden', 'true');
        contactsBlockElement.setAttribute('hidden', 'true');

        // Show sign-in buttons and welcome text
        signInButtonElement.removeAttribute('hidden');
        welcomeBlockElement.removeAttribute('hidden');

    }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
// function checkSignedInWithMessage() {
//     // Return true if the user is signed in Firebase
//     if (isUserSignedIn()) {
//         return true;
//     }
//
//     // Display a message to the user using a Toast.
//     var data = {
//         message: 'You must sign-in first',
//         timeout: 2000
//     };
//     signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
//     return false;
// }

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
    if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
        window.alert('You have not configured and imported the Firebase SDK. ' +
            'Make sure you go through the codelab setup instructions and make ' +
            'sure you are running the codelab using `firebase serve`');
    }
}

// Checks that Firebase has been imported.
checkSetup();


// Shortcuts to DOM Elements.
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signInButton2Element = document.getElementById('sign-in-2');
var signOutButtonElement = document.getElementById('sign-out');
//var signInSnackbarElement = document.getElementById('must-signin-snackbar');
var welcomeBlockElement = document.getElementById('welcome-block');
var contactsBlockElement = document.getElementById('contacts-block');
var addContactButtonElement = document.getElementById('button-add-contact');
var contactsElement = document.getElementById('contacts');
var createContactButtonElement = document.getElementById('create-contact-btn');
var newContactDialogElement = document.getElementById('new-contact-dialog');
var expandContactDialogElement = document.getElementById('expand-contact-dialog')

var firstNameFieldElement = document.getElementById('first-name');
var lastNameFieldElement = document.getElementById('last-name');
var phoneFieldElement = document.getElementById('phone');

var contactListEmptyElement = document.getElementById('contact-list-empty')

signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);
signInButton2Element.addEventListener('click', signIn);
addContactButtonElement.addEventListener('click', newContactDialog);
//createContactButtonElement.addEventListener('click', addContact);
contactListEmptyElement.querySelector('a').addEventListener('click', newContactDialog);




// Displays user's contacts
function displayContact(key, firstname, lastname) {
    var div = document.getElementById(key);
    // If an element for that message does not exists yet we create it.
    if (!div) {
        var container = document.createElement('div');
        container.innerHTML = CONTACT_TEMPLATE;
        div = container.firstChild;
        div.setAttribute('id', key);
        contactsElement.appendChild(div);
        div.addEventListener('click', function(){expandContact(key)});
    }

    div.querySelector('.name').textContent = firstname + ' ' + lastname;




    // // Show the card fading-in and scroll to view the new message.
    // setTimeout(function() {div.classList.add('visible')}, 1);
    // messageListElement.scrollTop = messageListElement.scrollHeight;
    // messageInputElement.focus();
}

function expandContact(contactID) {
    expandContactDialog(contactID);
}

// OLD OLD TEMPLATE
// var CONTACT_TEMPLATE =
//     '<div class="contact-container">' +
//     '<div class="spacing"><div class="pic"></div></div>' +
//     '<div class="name"></div>' +
//     '</div>';

//new template MDL:
var CONTACT_TEMPLATE =
    '<div class="contact-container mdl-list__item">'+
    '<span class="mdl-list__item-primary-content">'+
    '<i class="material-icons mdl-list__item-avatar">person</i>'+
    '<span class="name"></span>'+
    '</span>'+
    '</div>';

//new template TABLE MDL:
// var CONTACT_TEMPLATE =
//     '<tr class="not-important">'+
//     '<td class="name">a</td>'+
//     '<td class="phone">b</td>'+
//     '</tr>';




function loadContacts(uid) {
    // Loads all of the contacts
    var callback = function(snap) {
        //Hiding the 'You don't have any contacts + Create new ones' message
        var data = snap.val();
        displayContact(snap.key, data.firstname, data.lastname, data.phone);

    };

    firebase.database().ref('/users/' + uid + '/contacts/').on('child_added', callback);
    firebase.database().ref('/users/' + uid + '/contacts/').on('child_changed', callback);

}

//checking if user has contacts
function contactsNotZero(){

}

// initialize Firebase
initFirebaseAuth();

