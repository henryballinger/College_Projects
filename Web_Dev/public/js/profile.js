/* Global variables for current user and their email for use in multiple functions */
let currentUser;
let currentEmail;

/* Ask server for currently logged in user, call function to get profile for that user */
const get = $.get('/getUser');
get.done(getProfile);

/* Ask server for profile of currently logged in user, call function to display the profile information returned */
function getProfile(user) {
    currentUser = user;
    let profile = {
        user: user
    }
    const getProf = $.post('/getProfile', profile);
    getProf.done(showProfile);
}

/* Function to set the profile picture and values of the input fields to the current profile information
* Ask server if profile picture exists for this user
    * Pass result to function
    * If it does, display that picture
    * If not, display avatar picture
* Set all input fields to be disabled and change background colour to reflect that */
function showProfile(profile) {
    const check = $.get('/checkPicture');
    check.done(handleCheck);

    $('#firstName').attr('value', profile[0].firstName);
    $('#lastName').attr('value', profile[0].lastName);
    currentEmail = profile[0].email;
    $('#email').attr('value', profile[0].email);
    $('#user_id').attr('value', profile[0].user_id);
    $('#firstName, #lastName, #email, #user_id, #password')
        .prop('disabled', true).css('background', '#999999');
}
function handleCheck(exists) {
    let picPath;
    if (exists) {
        picPath = '../../' + currentUser + '.jpg';
    }
    else {
        picPath = '../../Avatar.png';
    }
    $('#profilePic').css('background-image', `url(${picPath})`);
}

/* Assign click function to all 'edits' (and 'saves') on page */
$('.edit').click( function(){
    editSaveField(this);
});

/* Handle clicking of edits & saves, receive object
* Pull id of element to be edited or saved from the object
* If input field is currently disabled: enable and change 'edit' to be 'save'
* If input field is already enabled (i.e. editing has occurred):
    * Call function to check if field is valid, if so:
        * Change border around input field to be green to indicate so
        * Compile data into object to be passed to server
        * Ask server to update profile on database, call function to handle response
        * Disable input field, change 'save' back to 'edit'
    * If field not valid, change border to be red, display error message */
function editSaveField(object) {
    let item = $(object).attr('id').split("__")[1];
    let id = '#' + item;

    if ($(id).prop('disabled') === true) {
        $(id).prop('disabled', false).css('background', 'white');
        $(object).html('Save');
    }
    else {
        if (checkValid(id)) {
            $(id).css("border", "1px solid green");
            $(id + 'Error').css('color', 'wheat');
            let profile = {
                currentuser: currentUser,
                item: item,
                value: $(id)[0].value
            }

            const post = $.post('/updateProfile', profile);
            post.done(processUpdate);

            $(id).prop('disabled', true).css('background', '#999999');
            $(object).html('Edit: ');
        }
        else {
            $(id).css("border", "1px solid red");
            $(id + 'Error').css('visibility', 'visible').css('color', 'orangered');
        }
    }
}

/* Function to check if field input is valid
* Extract element and value information from object passed to function
* Switch case for field being updated (using fall through cases to check multiple fields in one case)
    * For first name, last name, username and password, check length
    * For email, check if valid email format
    * If field being checked is not valid, update error message, return false. Else return true */
function checkValid (toCheck) {
    let errField = toCheck + 'Error';
    let element = $(toCheck)[0];
    let length = element.value.length;
    switch (toCheck) {
        case '#firstName':
        case '#lastName':
            if (length < 3 || length > 50) {
                $(errField).html('Must be between 3 & 50 characters');
                return false;
            }
            return true;
        case '#user_id':
        case '#password':
            if (length < 8 || length > 20) {
                $(errField).html('Must be between 8 & 20 characters');
                return false;
            }
            return true;
        case '#email':
            if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(element.value))) {
                $(errField).html('Must be a valid email address');
                return false;
            }
            return true;
    }
}

/* Function to handle response from server about updating profile
* Switch case for elements that were to be updated, with success and error message for each
* On update fail (email or username already used):
    * Call functions to update and show error text, re-enable input field and change 'edit' to 'save'
    * This allows the user to try another option for email/username
* On update success, use error text message to display success message */
function processUpdate(checks) {
    switch (checks) {
        case 'Email Used':
            handleMessage('#emailError', 'Email is already taken');
            handleRetry('#email', '#edit__email');
            break;
        case 'Email Updated':
            handleMessage('#emailError', checks);
            break;
        case 'Username Used':
            handleMessage('#user_idError', 'Username is already taken');
            handleRetry('#user_id', '#edit__user_id');
            break;
        case 'Username Updated':
            handleMessage('#user_idError', checks);
            currentUser = $('#user_id')[0].value;
            break;
        case 'Password Updated':
            handleMessage('#passwordError', checks);
            break;
        case 'First Name Updated':
            handleMessage('#firstNameError', checks);
            break;
        case 'Last Name Updated':
            handleMessage('#lastNameError', checks);
            break;
    }
}
/* Functions for helping processUpdate function to handle response from server */
function handleMessage(id, message) {
    $(id).html(message).css('visibility', 'visible');
}
function handleRetry(id, editid) {
    $(id).prop('disabled', false).css('background', 'white').effect('bounce', 'slow');
    $(editid).html('Save');
}

/* Click function for delete button
* Hide delete button, show delete confirmation and undo buttons
* Assign click function to those buttons
* This allows for confirmation of profile deleting, in case of accidental click */
$('#delete').click(function() {
    $('#delete').hide();
    $('#confirmation').show().on('click', confirmDelete);
    $('#dontDelete').show().on('click', function() {
        $('#delete').show();
        $('#confirmation, #dontDelete').hide();
    });
})

/* Function to handle confirmation of profile deletion
* Hide profile picture and go back link so user cannot exit page
* Pass user to server with request to delete profile from database
* Empty page contents and append new image and message indicating profile deletion successful
* Wait 3 seconds to allow user to see message, then re-direct to home page */
function confirmDelete() {
    $('#goback, #profilePic').hide();
    let user = {
        user_id: currentUser
    }
    $.post('/deleteProfile', user);
    $('#container').empty()
        .append('<img src="imgs/success.png" alt="Success Symbol" id="success">')
        .append('<br /><h2 id="successmessage">Profile successfully deleted!</h2>');
    setTimeout(() => { location.replace('/') }, 3000);
}
