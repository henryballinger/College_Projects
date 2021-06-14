/* Let form be submitted when enter key pressed
* Validate form inputs
* Create error messages for invalid inputs
* Check fields valid when focus moved form input
* Assign submit function
* Assign containers for the invalid input error messages */
$('#registrationForm').keypress((e) => {
    if (e.keyCode === 13) {
        $('#registrationForm').submit();
    }
}).validate({
    rules: {
        firstName: {
            required: true,
            rangelength: [3,50]
        },
        lastName: {
            required: true,
            rangelength: [3,50]
        },
        email: {
            required: true,
            rangelength: [3,50],
            email: true
        },
        username: {
            required: true,
            rangelength: [8,20]
        },
        password: {
            required: true,
            rangelength: [8,20]
        },
        repassword: {
            required: true,
            rangelength: [8,20],
            equalTo: '#password'
        },
        dob: {
            required: true,
        }
    },
    messages: {
        firstName: {
            rangelength: 'Must be between 3 & 50 characters'
        },
        lastName: {
            rangelength: 'Must be between 3 & 50 characters'
        },
        email: {
            email: 'Please enter a valid email address'
        },
        username: {
            rangelength: 'Must be between 8 & 20 characters'
        },
        password: {
            rangelength: 'Must be between 8 & 20 characters'
        },
        repassword: {
            rangelength: 'Must be between 8 & 20 characters',
            equalTo: 'Passwords do not match'
        }
    },
    onfocusout: validateFields,
    submitHandler: registerUser,
    errorContainer: {
        firstName: '#firstNameError',
        lastName: '#lastNameError',
        email: '#emailError',
        username: '#usernameError',
        password: '#passwordError',
        repassword: '#repasswordError'
    }
});

/* Assign click function to register button to submit form */
$('#registerBtn').click( function () {
    $('#registrationForm').submit();
});

/* Show values of password and re-enter password fields when mouse over them */
$('#password, #repassword').mouseover(function() {
    $(this).attr('type', 'text');
}).mouseout(function () {
    $(this).attr('type', 'password');
});

/* Check if input element is valid
* If so, apply green border
* If not, apply red border, change font colour to red */
function validateFields(element) {
    if($(element).valid()){
        $(element).css("border", "1px solid green");
    } else {
        $(element).css("border", "1px solid red");
    }
}

/* Function to register user
* Assemble data to pass to sever into object comprised of values of inputs fields
* Send to server, call functions to handle response */
function registerUser() {
    const registerData = {
        firstName: $('#firstName')[0].value,
        lastName: $('#lastName')[0].value,
        email: $('#email')[0].value,
        username: $('#username')[0].value,
        password: $('#password')[0].value,
        dob: $('#dob')[0].value
    }
    const post = $.post('/registerUser', registerData);
    post.done(processRegister);
    post.fail(processErrors);
}

/* Function to handle response of attempting to register user
* Call function with data, if email used or username used, boolean returns false
* If checks are passed, show profile picture upload */
function processRegister(checks) {
    if (checks.emailused) {
        showError('#email', 'Email has already been used.');
    }
    else if (checks.usernameused) {
        showError('#username', 'Username has already been used.');
    }
    else if (checks.success && checks.loggedin) {
        $('#registrationForm, #registerBtn').hide();
        $('#fileForm, #skipUpload').show();
        // location.replace('/interests');
    }
}
function processErrors() {
    console.log('Validation Errors');
}

/* Assign click function to skip upload button to allow user to bypass uploading a profile picture
* Redirects to interest page */
$('#skipUpload').click(function () {
    location.replace('/interests');
})

/* Function to display error messages regarding email and username already being used
* Change field border to red
* Set error message text, set font colour to red and make visible*/
function showError (id, message) {
    $(id).css('border', '1px solid red').effect('shake');
    id = id + 'Error';
    $(id).html(message).css('color', 'red').css('visibility', 'visible');
}

/* On input to email or password fields, reset border to be default and hide error message */
$('#email, #password').on("input", function() {
    let obj = '#' + $(this).attr('id');
    let objErr = obj + 'Error';
    $(objErr).text('.').css('visibility', 'hidden');
    $(obj).css('border', '1px solid black');
});