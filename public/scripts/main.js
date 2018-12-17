// Shortcuts to DOM Elements.
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signInButton2Element = document.getElementById('sign-in-2');
var signOutButtonElement = document.getElementById('sign-out');
var snackbarElement = document.getElementById('snackbar');
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
var contactTableBodyElement = document.getElementById('contact-table-body')

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
        //if(snap.val()['Phone--number'])

        displayContact(snap.key, snap.val()['First--name'], snap.val()['Last--name'], snap.val()['E-mail'],
            (snap.val()['Phone--number']) ? (snap.val()['Phone--number']) : (snap.val()['Work--phone']), snap.val().photoURL);
    };
    firebase.database().ref('/users/' + uid + '/contacts/').on('child_added', callback);
    firebase.database().ref('/users/' + uid + '/contacts/').on('child_changed', callback);
    firebase.database().ref('/users/' + uid + '/contacts/').on('child_removed', function(oldSnap){
        contactTableBodyElement.removeChild(document.getElementById(oldSnap.key));
        expandContactDialogElement.removeAttribute('name');
        expandContactDialogElement.querySelector('.contact-photo').setAttribute('src', 'images/profile_placeholder.png');

    });
}

function contactListEmpty(time = 0) {
    setTimeout(function () {
        if (contactTableBodyElement.innerHTML == ''){
            contactListEmptyElement.removeAttribute('hidden');
            contactsElement.setAttribute('hidden', 'true');
        }else{
            contactListEmptyElement.setAttribute('hidden', true);
            contactsElement.removeAttribute('hidden');
        }
    }, time)
}





// Displays user's contacts
function displayContact(key, firstname, lastname, email, phone, photoURL) {

    if (!(document.getElementById(key))){
        contactTableBodyElement.innerHTML +=
            `<tr id=${key} class="contact-container">
                <td class="mdl-data-table__cell--non-numeric table-photo-name">
                  <img src="images/profile_placeholder.png" class="table-photo"><span class="table-name"></span>
                </td>
                <td class="mdl-data-table__cell--non-numeric table-email"></td>
                <td class="mdl-data-table__cell--non-numeric table-phone"></td>
             </tr>`;

    }
    contactTableBodyElement.querySelector(`#${key}`).querySelector('.table-name').textContent = firstname + ((lastname) ? (' ' + lastname) : '');
    contactTableBodyElement.querySelector(`#${key}`).querySelector('.table-email').textContent = (email) ? email : '';
    contactTableBodyElement.querySelector(`#${key}`).querySelector('.table-phone').textContent = (phone) ? phone : '';
    if (photoURL) contactTableBodyElement.querySelector(`#${key}`).querySelector('.table-photo').setAttribute('src', photoURL);
    //div.querySelector('.name').textContent = firstname + ((lastname) ? (' ' + lastname) : '');

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
        snackbarElement.MaterialSnackbar.showSnackbar(data);
        document.getElementById('upload-contact-photo').value = '';
        return;
    }else if(file.size > 5242880){
        data = {
            message: 'File should not be larger than 5 MB',
            timeout: 2000
        };
        snackbarElement.MaterialSnackbar.showSnackbar(data);
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
    expandContactDialogElement.querySelector('#expand-contact-table').innerHTML = '';
    expandContactDialogElement.querySelector('.social-media').innerHTML = '';
    expandContactDialogElement.querySelector('.contact-photo').setAttribute('src', 'images/profile_placeholder.png');

    firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID).once('value').then(function(snapshot) {
        expandContactDialogElement.querySelector('.contact-name').innerHTML = snapshot.val()['First--name'] +
            ((snapshot.val()['Last--name']) ? (' ' + snapshot.val()['Last--name']) : '');
        var data = snapshot.val();
        if(data['First--name']){
            expandContactDialogElement.querySelector('#expand-contact-table').innerHTML +=
                `<tr class="First--name">
                <td class="mdl-data-table__cell--non-numeric" style="border-top: none;">First name</td>
                <td class="mdl-data-table__cell--non-numeric" style="border-top: none;">${data['First--name']}</td>
                </tr>` ;
            delete data['First--name'];
        }
        if(data['Middle--name']){
            expandContactDialogElement.querySelector('#expand-contact-table').innerHTML +=
                `<tr class="Middle--name">
                <td class="mdl-data-table__cell--non-numeric">Middle name</td>
                <td class="mdl-data-table__cell--non-numeric">${data['Middle--name']}</td>
                </tr>` ;
            delete data['Middle--name'];
        }
        if(data['Last--name']){
            expandContactDialogElement.querySelector('#expand-contact-table').innerHTML +=
                `<tr class="Last--name">
                <td class="mdl-data-table__cell--non-numeric">Last name</td>
                <td class="mdl-data-table__cell--non-numeric">${data['Last--name']}</td>
                </tr>` ;
            delete data['Last--name'];
        }
        if(data['E-mail']){
            expandContactDialogElement.querySelector('#expand-contact-table').innerHTML +=
                `<tr class="E-mail">
                <td class="mdl-data-table__cell--non-numeric">E-mail</td>
                <td class="mdl-data-table__cell--non-numeric"><a href='mailto:${data['E-mail']}'>${data['E-mail']}</a></td>
                </tr>` ;
            delete data['E-mail'];
        }
        if(data['Phone--number']){
            expandContactDialogElement.querySelector('#expand-contact-table').innerHTML +=
                `<tr class="Phone--number">
                <td class="mdl-data-table__cell--non-numeric">Phone number</td>
                <td class="mdl-data-table__cell--non-numeric"><a href='tel:${data['Phone--number']}'>${data['Phone--number']}</a></td>
                </tr>` ;
            delete data['Phone--number'];
        }
        if(data['Work--phone']){
            expandContactDialogElement.querySelector('#expand-contact-table').innerHTML +=
                `<tr class="Work--phone">
                <td class="mdl-data-table__cell--non-numeric">Work phone</td>
                <td class="mdl-data-table__cell--non-numeric"><a href='tel:${data['Work--phone']}'>${data['Work--phone']}</a></td>
                </tr>` ;
            delete data['Work--phone'];
        }
        if(data['Address']){
            expandContactDialogElement.querySelector('#expand-contact-table').innerHTML +=
                `<tr class="Address">
                <td class="mdl-data-table__cell--non-numeric">Address</td>
                <td class="mdl-data-table__cell--non-numeric"><a href='https://maps.google.com/?q=${data['Address']}' target="_blank">${data['Address']}</a></td>
                </tr>` ;
            delete data['Address'];
        }
        if(data['Birthdate']){
            expandContactDialogElement.querySelector('#expand-contact-table').innerHTML +=
                `<tr class="Birthdate">
                <td class="mdl-data-table__cell--non-numeric">Birthdate</td>
                <td class="mdl-data-table__cell--non-numeric">${data['Birthdate']}</td>
                </tr>` ;
            delete data['Birthdate'];
        }

        for (var field in data){
            switch(field){
                case 'photoURL':
                    expandContactDialogElement.querySelector('.contact-photo').setAttribute('src', data[field]);
                    break;
                case 'VK':
                case 'Instagram':
                case 'Facebook':
                case 'Twitter':
                    expandContactDialogElement.querySelector('.social-media').innerHTML +=
                        `<a href='https://${field}.com/${data[field]}/' target="_blank"><i class="fab fa-${field.toLowerCase()}"></i></a>`;
                    break;
                default:
                    expandContactDialogElement.querySelector('#expand-contact-table').innerHTML +=
                        `<tr class="${field}">
                        <td class="mdl-data-table__cell--non-numeric">${field.replace(/--/g, ' ')}</td>
                        <td class="mdl-data-table__cell--non-numeric">${data[field]}</td>
                        </tr>` ;
                    break;
            }
        }
    });
}
expandContactDialogElement.querySelector('.close').addEventListener('click', function() {
    expandContactDialogElement.removeAttribute('name');
    expandContactDialogElement.querySelector('.contact-photo').setAttribute('src', 'images/profile_placeholder.png');
    expandContactDialogElement.close();
    expandContactDialogElement.querySelector('#expand-contact-table').innerHTML = '';
    expandContactDialogElement.querySelector('.social-media').innerHTML = '';

});
expandContactDialogElement.querySelector('.deleteContactButton').addEventListener('click', function() {
    deleteContact(expandContactDialogElement.getAttribute('name'));
    expandContactDialogElement.close();
    contactListEmpty();
    expandContactDialogElement.querySelector('#expand-contact-table').innerHTML = '';
    expandContactDialogElement.querySelector('.social-media').innerHTML = '';
    expandContactDialogElement.querySelector('.contact-photo').setAttribute('src', 'images/profile_placeholder.png');
});

//Listening to clicks on contacts
document.addEventListener('click', function (event) {
    if (event.target.closest('tr') && event.target.closest('tr').classList.contains('contact-container')){
        console.log(event.target.closest('tr').id);
        expandContactDialog(event.target.closest('tr').id);
    }
    //trying to copy field
     else if (event.target.closest('tr') && event.target.closest('tbody').id == 'expand-contact-table'){

        navigator.clipboard.writeText(event.target.closest('tr').getElementsByTagName('td')[1].textContent)
            .then(() => {
                var data = {
                    message: event.target.closest('tr').getElementsByTagName('td')[0].textContent + ' copied to clipboard',
                    timeout: 1000
                };
                snackbarElement.MaterialSnackbar.showSnackbar(data);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });

    }
}, false);


//---------------DELETE CONTACT---------------
function deleteContact(contactID) {
    //contactTableBodyElement.removeChild(document.getElementById(contactID));
    firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID + '/photoURL/').once('value').then(function (snapshot) {
        if(snapshot.exists()){//WIP
            var fileRef = firebase.storage().refFromURL(snapshot.val());
            fileRef.delete().then(function() {
                console.log('Contact photo deleted successfully')
            }).catch(function(error) {
                console.log('An error occurred when deleting contact photo: ' + error)
            });
        }
    });
    firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID).remove()
        .then(function() {
            console.log(contactID + " successfully removed")
        })
        .catch(function(error) {
            console.log("Remove failed: " + error.message)
        });
}
//--------EDIT CONTACT---------

document.getElementById('open-contact-edit-btn').addEventListener('click',
    function(){
        openContactEdit(document.getElementById('open-contact-edit-btn').closest('dialog').getAttribute('name'));
    });

function openContactEdit(contactID){
    //clearing everything
    expandContactDialogElement.close();
    document.querySelector('.ecp-img').setAttribute('src', 'images/profile_placeholder.png');
    document.getElementById('edit-contact-dialog').querySelector('.mdl-chip__text').innerHTML = 'Upload contact photo';
    document.getElementById('edit-contact-dialog').querySelector('.ecp-description').innerHTML ='add_a_photo';
    document.getElementById('edit-contact-photo').value = '';

    //filling the form
    document.getElementById('edit-contact-dialog').setAttribute('name', contactID);
    document.getElementById('edit-contact-dialog').querySelectorAll('input[type="text"], input[type="email"]').forEach(function (field){
        field.value = '';
        field.closest('div').classList.remove('is-valid', 'is-invalid', 'is-dirty');

        if(document.querySelector(`.${field.id.split('_')[1]}`)){
            field.value = document.querySelector(`.${field.id.split('_')[1]}`).getElementsByTagName('td')[1].textContent;
            field.closest('div').classList.add('is-dirty');
            field.closest('div').classList.add('is-valid');
        }
    });

    firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID).once('value').then(function(snapshot) {
        if(snapshot.val().VK) {
            document.getElementById('edit_VK').value = snapshot.val().VK;
            document.getElementById('edit_VK').closest('div').classList.add('is-dirty');
        }
        if(snapshot.val().Instagram) {
            document.getElementById('edit_Instagram').value = snapshot.val().Instagram;
            document.getElementById('edit_Instagram').closest('div').classList.add('is-dirty');
        }
        if(snapshot.val().Facebook) {
            document.getElementById('edit_Facebook').value = snapshot.val().Facebook;
            document.getElementById('edit_Facebook').closest('div').classList.add('is-dirty');
        }
        if(snapshot.val().Twitter) {
            document.getElementById('edit_Twitter').value = snapshot.val().Twitter;
            document.getElementById('edit_Twitter').closest('div').classList.add('is-dirty');
        }
        if(snapshot.val().photoURL){
            document.querySelector('.ecp-img').setAttribute('src', snapshot.val().photoURL);
            document.getElementById('edit-contact-dialog').querySelector('.mdl-chip__text').innerHTML = 'Change contact photo';
            document.getElementById('edit-contact-dialog').querySelector('.ecp-description').innerHTML ='edit';
        }
    });
    document.getElementById('edit-contact-dialog').showModal();
}
document.getElementById('edit-contact-dialog').querySelector('.close').addEventListener('click', function() {
    document.getElementById('edit-contact-dialog').removeAttribute('name');
    document.getElementById('edit-contact-dialog').close();
    expandContactDialogElement.showModal();
});
document.getElementById('edit-contact-dialog').querySelector('#edit-contact-btn').addEventListener('click', function() {
    document.getElementById('edit-contact-dialog').close();
    //expandContactDialog(document.getElementById('edit-contact-dialog').getAttribute('name'))
    //document.getElementById('edit-contact-dialog').removeAttribute('name');
});


document.getElementById('edit-contact-photo').addEventListener('change', function () {
    var file = document.getElementById('edit-contact-photo').files[0];
    if ((!file.type.match('image/jpeg')) && (!file.type.match('image/png'))) {
        var data = {
            message: 'You can only upload images',
            timeout: 2000
        };
        snackbarElement.MaterialSnackbar.showSnackbar(data);
        document.getElementById('edit-contact-photo').value = '';
        return;
    }else if(file.size > 5242880){
        data = {
            message: 'File should not be larger than 5 MB',
            timeout: 2000
        };
        snackbarElement.MaterialSnackbar.showSnackbar(data);
        document.getElementById('edit-contact-photo').value = '';
        return;
    }

    document.querySelector('.ecp-img').setAttribute('src', URL.createObjectURL(file));
    document.getElementById('edit-contact-dialog').querySelector('.mdl-chip__text').innerHTML = file.name;
    document.getElementById('edit-contact-dialog').querySelector('.ecp-description').innerHTML ='edit';
})


function editContact() {
    var contactID = document.getElementById('edit-contact-dialog').getAttribute('name');
    contactListEmpty();
    var contactRef = firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID + '/');
   // var newContactRef =  contactListRef.push();


    document.getElementById('edit-contact-dialog').querySelectorAll('.mdl-textfield__input').forEach(function(field){
        var fieldName = field.id.split('_')[1];
        if (field.value != '') {
            contactRef.update({
                [fieldName]: field.value
            }).catch(function (error) {
                console.error('Error writing to Realtime Database:', error);
            });
        } else if(fieldName != 'First--name'){
            contactRef.child(fieldName).remove().catch(function (error) {
                console.error('Error writing to Realtime Database:', error);
            });
        }
    });
    //Image upload

    if(document.getElementById('edit-contact-photo').value != '') {
        //deleting previous one
        firebase.database().ref('/users/' + getUserID() + '/contacts/' + contactID + '/photoURL/').once('value').then(function (snapshot) {
            if(snapshot.exists()){//WIP
                var fileRef = firebase.storage().refFromURL(snapshot.val());
                fileRef.delete().then(function() {
                    console.log('Contact photo deleted successfully')
                }).catch(function(error) {
                    console.log('An error occurred when deleting contact photo: ' + error)
                });
            }
        });

        //uploading new one
        var file = document.getElementById('edit-contact-photo').files[0];
        var filePath = firebase.auth().currentUser.uid + '/' + contactID + '/' + file.name;
        firebase.storage().ref(filePath).put(file).then(function (fileSnapshot) {
            return fileSnapshot.ref.getDownloadURL().then(function (url) {
                expandContactDialogElement.querySelector('.contact-photo').setAttribute('src', url)
                return contactRef.update({
                    photoURL: url
                    // storageURL: fileSnapshot.metadata.fullPath
                });
            });
        }).catch(function (error) {
            console.error('There was an error uploading a file to Cloud Storage:', error);
        });
    }

    expandContactDialog(contactID);
}



























