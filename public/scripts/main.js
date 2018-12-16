// Shortcuts to DOM Elements.
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signInButton2Element = document.getElementById('sign-in-2');
var signOutButtonElement = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');
var welcomeBlockElement = document.getElementById('welcome-block');
var contactsBlockElement = document.getElementById('contacts-block');
var addContactButtonElement = document.getElementById('button-add-contact');
var contactsElement = document.getElementById('contacts');
var createContactButtonElement = document.getElementById('create-contact-btn');
var newContactDialogElement = document.getElementById('new-contact-dialog');
var expandContactDialogElement = document.getElementById('expand-contact-dialog')

var firstNameFieldElement = document.getElementById('First--name');
var lastNameFieldElement = document.getElementById('Last--name');
var numberFieldElement = document.getElementById('Phone--number');

var contactListEmptyElement = document.getElementById('contact-list-empty')

signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);
signInButton2Element.addEventListener('click', signIn);
addContactButtonElement.addEventListener('click', newContactDialog);
//createContactButtonElement.addEventListener('click', addContact);
contactListEmptyElement.querySelector('a').addEventListener('click', newContactDialog);


'use strict';

//----------INIT----------
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

//---------AUTH+OTHER-----------

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

// initialize Firebase
initFirebaseAuth();

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
        contactListEmpty(2000);


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


//--------LOADING LIST OF CONTACTS------
function loadContacts(uid) {
    // Loads all of the contacts
    var callback = function(snap) {
        //Hiding the 'You don't have any contacts + Create new ones' message
        displayContact(snap.key, snap.val()['First--name'], snap.val()['Last--name'], snap.val().photoURL, snap.val()['Phone--number']);
    };
    firebase.database().ref('/users/' + uid + '/contacts/').on('child_added', callback);
    firebase.database().ref('/users/' + uid + '/contacts/').on('child_changed', callback);
}

function contactListEmpty(time = 0) {
    setTimeout(function () {
        if (contactsElement.innerHTML == ''){
            contactListEmptyElement.removeAttribute('hidden');
        }else{
            contactListEmptyElement.setAttribute('hidden', true);
        }
    }, time)
}


//new template MDL:
var CONTACT_TEMPLATE =
    '<div class="contact-container mdl-list__item">'+
    '<span class="mdl-list__item-primary-content">'+
    '<i class="material-icons mdl-list__item-avatar">person</i>'+
    '<span class="name"></span>'+
    '</span>'+
    '</div>';

// Displays user's contacts
function displayContact(key, firstname, lastname, phone) {
    var div = document.getElementById(key);
    if (!div) {
        var container = document.createElement('div');
        container.innerHTML = CONTACT_TEMPLATE;
        div = container.firstChild;
        div.setAttribute('id', key);
        contactsElement.appendChild(div);
        //div.addEventListener('click', function(){expandContactDialog(key); console.log('Clicked on ' + key)});
    }

    div.querySelector('.name').textContent = firstname + ((lastname) ? (' ' + lastname) : '');

    // // Show the card fading-in and scroll to view the new message.
    // setTimeout(function() {div.classList.add('visible')}, 1);
    // messageListElement.scrollTop = messageListElement.scrollHeight;
    // messageInputElement.focus();
}




//--------CREATING NEW CONTACT--------
function newContactDialog(){    //
    newContactDialogElement.showModal();
    newContactDialogElement.querySelector('.close').addEventListener('click', function() {
        document.querySelector('#new-contact-dialog > form').reset();
        document.querySelectorAll('.is-dirty').forEach(function(el){
            el.classList.remove('is-dirty')
        })
        document.getElementById('upload-contact-photo-filename').innerHTML = 'Upload contact photo';
        newContactDialogElement.close();
    });
   // newContactDialogElement.querySelector('#create-contact-btn').addEventListener('click', addContact);
}
//old:
// function addContact() {
//     //переделать
//     contactListEmpty();
//     firebase.database().ref('/users/' + getUserID() + '/contacts/').push({
//         firstname: firstNameFieldElement.value,
//         lastname: lastNameFieldElement.value,
//         number: numberFieldElement.value
//     }).catch(function(error) {
//         console.error('Error writing new message to Realtime Database:', error);
//     });
//     firstNameFieldElement.value ='';
//     lastNameFieldElement.value ='';
//     numberFieldElement.value ='';
//     newContactDialogElement.close();
// }

function NEWaddContact() {
    contactListEmpty();
    var contactListRef = firebase.database().ref('/users/' + getUserID() + '/contacts/');
    var newContactRef =  contactListRef.push();
    newContactRef.set({'First--name': firstNameFieldElement.value})

    newContactDialogElement.querySelectorAll('.mdl-textfield__input').forEach(function(field){
        if (field.value != '') {
            var fieldName = field.id;
            newContactRef.update({
                [fieldName]: field.value
            }).catch(function (error) {
                console.error('Error writing new message to Realtime Database:', error);
            });
            //field.value = '';
        }
    });
    //Image upload
    if(document.getElementById('upload-contact-photo').value != '') {
        var file = document.getElementById('upload-contact-photo').files[0];
        var filePath = firebase.auth().currentUser.uid + '/' + newContactRef.key + '/' + file.name;
        firebase.storage().ref(filePath).put(file).then(function (fileSnapshot) {
            return fileSnapshot.ref.getDownloadURL().then(function (url) {
                return newContactRef.update({
                    photoURL: url
                   // storageURL: fileSnapshot.metadata.fullPath
                });
            });
        }).catch(function (error) {
            console.error('There was an error uploading a file to Cloud Storage:', error);
        });
    }


    //Resetting the form, closing modal
    document.querySelector('#new-contact-dialog > form').reset();
    document.querySelectorAll('.is-dirty').forEach(function(el){
        el.classList.remove('is-dirty')
    })
    document.getElementById('upload-contact-photo-filename').innerHTML = 'Upload contact photo';
    newContactDialogElement.close();
}

//PICTURE UPLOAD
document.getElementById('upload-contact-photo').addEventListener('change', function () {
    var file = document.getElementById('upload-contact-photo').files[0];
    if ((!file.type.match('image/jpeg')) && (!file.type.match('image/png'))) {
        var data = {
            message: 'You can only upload images',
            timeout: 2000
        };
        signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
        document.getElementById('upload-contact-photo').value = '';
        return;
    }else if(file.size > 5242880){
        data = {
            message: 'File should not be larger than 5 MB',
            timeout: 2000
        };
        signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
        document.getElementById('upload-contact-photo').value = '';
        return;
    }
    document.getElementById('upload-contact-photo-filename').innerHTML =  file.name;
})

//OLD expand contact DO NOT DELETE
// function OLDexpandContactDialog(contactID){
//     expandContactDialogElement.showModal();
//     expandContactDialogElement.querySelector('.mdl-dialog__content').innerHTML = '';
//
//     firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID).once('value').then(function(snapshot) {
//         var firstname = 'First--name';
//         var lastname = 'Last--name';
//         expandContactDialogElement.querySelector('.mdl-dialog__title').innerHTML = snapshot.val(firstname) + ' ' + snapshot.val().[lastname];
//         snapshot.forEach(function(item){
//             if(item.val() != '') {
//                 expandContactDialogElement.querySelector('.mdl-dialog__content').innerHTML += item.key + ' ';
//                 expandContactDialogElement.querySelector('.mdl-dialog__content').innerHTML += item.val() + ' ';
//             }
//         });
//     });
//     expandContactDialogElement.querySelector('.close').addEventListener('click', function() {
//         expandContactDialogElement.close();
//     });
//     expandContactDialogElement.querySelector('.deleteContactButton').addEventListener('click', function() {
//         deleteContact(contactID);
//         contactsElement.removeChild(document.getElementById(contactID));
//         expandContactDialogElement.close();
//         contactListEmpty();
//     });
// }


// function OLDexpandContactDialog(contactID){
//     expandContactDialogElement.showModal();
//     expandContactDialogElement.querySelector('.mdl-dialog__content').innerHTML = '';
//
//     firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID).once('value').then(function(snapshot) {
//         //firstname + ((lastname) ? (' ' + lastname) : '');
//         expandContactDialogElement.querySelector('.mdl-dialog__title').innerHTML = snapshot.val()['First--name'] +
//             ((snapshot.val()['Last--name']) ? (' ' + snapshot.val()['Last--name']) : '');
//         var data = snapshot.val();
//         //console.log(data);
//         for (var field in data){
//             if(field != 'photoURL') {
//                 expandContactDialogElement.querySelector('.mdl-dialog__content').innerHTML +=
//                     `<div id='${field}'>${field.replace(/--/g, ' ')}: ${data[field]} </div>`
//             }else{
//                 expandContactDialogElement.querySelector('.mdl-dialog__content').innerHTML +=
//                     `<div id='${field}' class="contact-photo-container"><img src="${data[field]}" class="contact-photo"></div>`
//             }
//         }
//
//
//     });
//     expandContactDialogElement.querySelector('.close').addEventListener('click', function() {
//
//         expandContactDialogElement.close();
//     });
//     expandContactDialogElement.querySelector('.deleteContactButton').addEventListener('click', function() {
//         deleteContact(contactID);
//         contactsElement.removeChild(document.getElementById(contactID));
//         expandContactDialogElement.close();
//         contactListEmpty();
//     });
// }

//---------EXPANDED CONTACT INFO-----------
function expandContactDialog(contactID){
    expandContactDialogElement.setAttribute('name', contactID);
    expandContactDialogElement.showModal();
    expandContactDialogElement.querySelector('.contact-dialog-lower').innerHTML = '';

    firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID).once('value').then(function(snapshot) {

        expandContactDialogElement.querySelector('.contact-name').innerHTML = snapshot.val()['First--name'] +
            ((snapshot.val()['Last--name']) ? (' ' + snapshot.val()['Last--name']) : '');
        var data = snapshot.val();
        //console.log(data);
        for (var field in data){
            if(field != 'photoURL') {
                expandContactDialogElement.querySelector('.contact-dialog-lower').innerHTML +=
                    `<div id='${field}'>${field.replace(/--/g, ' ')}: ${data[field]} </div>`
            }else{
                expandContactDialogElement.querySelector('.contact-photo').setAttribute('src', data[field]);
            }
        }
    });
}
expandContactDialogElement.querySelector('.close').addEventListener('click', function() {
    expandContactDialogElement.removeAttribute('name');
    expandContactDialogElement.querySelector('.contact-photo').setAttribute('src', 'images/profile_placeholder.png');
    expandContactDialogElement.close();
});
expandContactDialogElement.querySelector('.deleteContactButton').addEventListener('click', function() {

    deleteContact(expandContactDialogElement.getAttribute('name'));
    contactsElement.removeChild(document.getElementById(expandContactDialogElement.getAttribute('name')));
    expandContactDialogElement.removeAttribute('name');
    expandContactDialogElement.querySelector('.contact-photo').setAttribute('src', 'images/profile_placeholder.png');
    expandContactDialogElement.close();
    contactListEmpty();
});

//Listening to clicks on contacts
document.addEventListener('click', function (event) {
    if (event.target.closest('div').classList.contains('contact-container')){
        console.log(event.target.closest('div').id);
        expandContactDialog(event.target.closest('div').id);
    }
}, false);


//---------------DELETE CONTACT---------------
function deleteContact(contactID) {
    firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID + '/photoURL/').once('value').then(function (snapshot) {
        if(snapshot.exists()){//WIP
            var fileRef = firebase.storage().refFromURL(snapshot.val());

            fileRef.delete().then(function() {
               console.log('Contact photo deleted successfully')
            }).catch(function(error) {
                console.log('An error occurred when deleting contact photo: ' + error)
            });
        }
    })
    firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID).remove()
        .then(function() {
            console.log(contactID + " successfully removed")
        })
        .catch(function(error) {
            console.log("Remove failed: " + error.message)
        });
}
//--------EDIT CONTACT---------





























