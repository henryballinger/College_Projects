/* Create global variables of username and password fields for user in functions */
const username = $('#username');
const password = $('#password');

/* Assign on click to page title, linking to about page */
$('#pageTitle').click(() => {
    location.replace('/about');
})

/* Variables to hold show/hide password icons */
const normaleye = 'imgs/eye.svg';
const slasheye = 'imgs/eye-slash.svg'

/* Show/Hide password when icon clicked, change icon to represent change */
$('#eye').click(() => {
    if ($(password).attr('type') === 'password') {
        $(password).attr('type', 'text');
        $('#eye').attr('src', slasheye);
    }
    else {
        $(password).attr('type', 'password');
        $('#eye').attr('src', normaleye);
    }
});

/* Assign submit function to Login button */
$('#loginBtn').click(() => {
    processLogin();
})

/* Let form be submitted when enter key pressed
* Validate form inputs
* Assign submit function */
$('#loginForm').keypress((e) => {
    if (e.keyCode === 13) {
        processLogin();
    }
}).validate({
    rules: {
        username: {
            required: true,
            rangelength: [8, 20]
        },
        password: {
            required: true,
            rangelength: [8, 20]
        }
    },
    // Suppress input error messages to allow for custom styling and placement
    errorPlacement: (error,element) => { return true; },
    submitHandler: processLogin
});

/* Check if input element is valid
* If so, apply black border and black font colour, return true
* If not, apply red border, change font colour to red
* then change text of and show error message, return false */
function validateFields(element) {
    if($(element).valid()) {
         $(element).css("border", "1px solid black").css('color', 'black');
        return true;
    } else {
        $(element).css("border", "2px solid red").css('color', 'red');
        $('#inputError').text('Both fields need 8-20 characters.').css('visibility', 'visible');
        return false;
    }
}

/* Handle form submission
* Check if username and password fields contain valid values
* Get values of input fields, send to server, handle response */
function processLogin() {
    let validUser = validateFields(username);
    let validPass = validateFields(password);

    if (validUser && validPass) {
        const data = {
            username: username[0].value,
            password: password[0].value
        }

        const post = $.post('/login', data);
        post.done(handleResponse);
        post.fail();
    }
}

/* Handle login response
* Redirect to next page if no error message comes back
* Else display error message on page */
function handleResponse(info) {
    if (info.message === undefined) {
        location.replace(info)
    } else {
        $(username).add(password).effect('bounce', 'slow');
        $('#inputError').html(info.message).css('visibility', 'visible');
    }
}

/* On input of data into input fields, check for validity, hide error message */
$(username).add(password).on("input", function() {
    validateFields(this);
    $('#inputError').text('.').css('visibility', 'hidden');
});

/* On inputting into password field, check if caps lock is enabled
* If so, inform user on screen */
$(password).keyup(function(event) {
    if (event.originalEvent.getModifierState("CapsLock")) {
        $('#capslock').css('visibility', 'visible');
    } else {
        $('#capslock').css('visibility', 'hidden');
    }
});

