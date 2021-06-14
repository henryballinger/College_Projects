/* Global variables for current user, array of interests and array of interests this profile has liked */
let currentUser;
let interestArray = [];
let likedInterests = [];

/* Ask server for list of interests from database */
const get = $.get('/getInterests');
get.done(displayInterests);

/* Display interests returned from server
* Dynamically create divs for interests so new interests can be added to database and page can adapt dynamically
* Save interests to local global array for easy indexing
* Append divs to page
* Assign click function to each heart on page for liking and disliking of interests */
function displayInterests (interests, status, xhr) {
    for (let i = 0; i < interests.length; i+=3) {
        let elements = `<div class="row">`;
        for (let x = 0; x < 3; x++) {
            let interest = interests[i + x].interest;
            let _interest = interest.replace(/\s/g, '');
            let id = 'interest' + interests[i + x].id;
            interestArray.push(_interest);
            elements += `<div id=${id} class="col-lg-3">${interest}</div>
                     <div class="col-lg-1">
                        <img src="imgs/heart.svg" alt="Full Heart" class="heart" id="${_interest}_heart">
                     </div>`
        }
        $(elements).appendTo('#container');
    }

    $('.heart').click(function() {
        heartClicked(this);
    })
}

/* Ask server for currently logged in user */
const getUser = $.get('/getUser')
getUser.done(saveUser);

/* Save user to local global variable for easy access
* Ask server for interests associated with that user
* Call function to adapt displayed interests to indicated they are liked */
function saveUser(user) {
    currentUser = user;
    let cUser = {
        user: currentUser
    }
    const getUInt = $.post('/getUserInterests', cUser);
    getUInt.done(displayLikedInterests);
}

/* Receive liked interests from database
* Adjust page contents (already displayed interests) to indicate if they have been liked by this profile */
function displayLikedInterests (likedinterests, status, xhr) {
    if (likedinterests.length !== 0) {
        for (let i = 0; i < likedinterests.length; i++) {
            let interest = interestArray[likedinterests[i].interestid - 1];
            interest = interest.replace(/\s/g, '');
            likedInterests.push(interest);
            let id = '#' + interest + "_heart";
            $(id).attr('src', 'imgs/heart-fill.svg');
        }
    }
}

/* Function to handle heart being clicked - This indicates an interest being liked or disliked
* Animate heart when clicked
* Get the interest and heart based on the element clicked
* Assign a boolean based on the source image of the heart (indicates whether interest is liked or not)
* Adjust id based on whether this heart is being clicked from the main list or from the results list
* If interest is not liked (!liked):
*   Change source of heart image, add to liked interest array and assign boolean to indicate interest is liked
* If interest is liked:
*   Change source of heart image, remove from liked interest array and assign boolean to indicate interest is not liked
* Get the index of the interest from the interest array, add one to it, this is the id of the interest in the database
* Create an object of info to pass to the server
* Send to server with a request to update the user interest link to either add or remove this interest */
const heartClicked = (object) => {
    $(object).animate({height: '1.8rem'}, "fast").animate({height: '1.4rem'}, "fast");
    let interest = $(object).attr('id').split("_")[0];
    let heart = $(object).attr('id').split("_")[1];
    let liked = $(object).attr('src') === 'imgs/heart-fill.svg';

    let id = '#' + interest + '_heart1';
    if (heart === 'heart1') {
        id = '#' + interest + '_heart';
    }

    if (!liked) {
        $.merge($(id), $(object)).attr('src', 'imgs/heart-fill.svg');
        if (!likedInterests.includes(interest)) {
            likedInterests.push(interest);
        }
        liked = true;
    }
    else {
        $.merge($(id), $(object)).attr('src', 'imgs/heart.svg');
        likedInterests.splice(likedInterests.indexOf(interest), 1);
        liked = false;
    }

    let index = interestArray.indexOf(interest) + 1;

    let info = {
        user: currentUser,
        interest: index,
        liking: liked
    }

    const post = $.post('/updateInterest', info);
    post.done();
}

/* Function to handle input into search field
* Remove the current search results
* Assign variable to be search input value
* Create an array of all interests that contain the inputted value from the interests array
* Check results array is not equal to interest array (i.e. all interests have been returned)
* Loop through either 5 or results array length (whichever is smaller)
* Check if interests in results are liked interests, assign imgsrc variable to indicate so
* Create divs and append to results container with search results and their corresponding liked or unliked hearts
* Assign clikc function to hearts of those interests to allow for liking or unliking from search results */
$('#search').on('input', () => {
    $('#resultscontainer').empty()
    let input = $('#search')[0].value;

    let results = interestArray.filter (function (str) {
        return str.toLowerCase().includes(input);
    })

    let imgsrc;
    if (results.length !== interestArray.length) {
        for (let i = 0; i < 5 && i < results.length; i++) {
            if (likedInterests.includes(results[i])) {
                imgsrc = `imgs/heart-fill.svg`;
            }
            else {
                imgsrc = `imgs/heart.svg`;
            }
            let heartid = `${results[i]}_heart1`;
            $('#resultscontainer').append(`<div class="row">
                    <div id="result${i + 1}" class="col-md">
                        ${results[i]}
                    </div>
                     <div id="result${i + 1}heart" class="col-md">
                         <img src="${imgsrc}" alt="Full Heart" class="heart" id="${heartid}">
                    </div></div>`)
            $('#' + heartid).click(function() {
                heartClicked(this);
            })
        }
    }
})
