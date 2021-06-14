/* Global variables for use in multiple functions */
let moodPicked = '';
let currentUser = '';
let userinterests = [];
let venuescoreid = 0;

/* Get currently logged in user from server, save to local global variable */
const getUser = $.get('/getUser');
getUser.done(saveUser);
function saveUser(user) {
    currentUser = user;
}

/* Ask server for list of moods, call function to handle response and adapt page accordingly */
const getMoods = $.get('/loadMoods');
getMoods.done(createMoods);

/* Function to create list of moods to display based on response from server
* This allows for moods to be added or updated on database and page will adapt dynamically each time
* If surprise me option, assign different id, else apply numbered id
* Create element and append to page
* Add click function */
function createMoods(moods, status, xhr) {
    for (let i = 0; i < moods.length; i++) {
        const mood = `${moods[i].mood}`;
        let id;
        if (mood === 'surprise me') {
            id = 'surprise';
        }
        else {
            id = `mood${moods[i].id}`;
        }
        const moodtitle = `<a id=${id} class="mood">${mood}</a><br />`;
        $(moodtitle).appendTo('#container');
    }
    $('.mood').click(function() {
        moodSelect(this)
    });
}

/* Function to handle when a mood is chosen
* Get the text from that element (mood name)
* Send to database */
function moodSelect (object) {
    let moodtext = $(object).html();
    const mood = {
        mood: moodtext
    }
    moodPicked = moodtext;

    const postMood = $.post('/moodSelect', mood);
    postMood.done(receiveVenues);
}

/* Function to handle receiving venues from server/database and updating page to show venues
* Hide container on moods page, remove all elements inside it, change id to reflect it is now the container for the venues
* Show loading venues animation and text
* Add bootstrap css to handle rows and cols classes of venue divs
* Change local css to be for venues
* Remove extra elements left from moods pages
* Change page heading to reflect the mood that was selected
* Define number of rows of venues to create and variable for holding to-be-created divs
* Create divs (rows and cols) to contain venue title and venue image,
    * assigning unique ids and retrieving relevant venue images
* Attach newly created venue divs to container
* Add back button to go back to moods page
* Assign click function to columns containing images and to venue titles:
    * Get venue data from server/database based on id of venue selected
    * If venue title clicked, call function to open website of that venue
    * If image is clicked, call function to open google maps with that venue location
* Call function to get interests associated with venues
* Set timeout function to only show venues after loading animation has been shown for 1 second */
function receiveVenues (venues, status, xhr) {
    $('#container').hide().empty().attr('id', 'venuecontainer');
    $('#loadingVenues, .loader').show();
    $('head').prepend('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">');
    $('#style').attr('href', 'css/venues.css');
    $('#linkcontainer, #line').remove();
    $('#pageTitle').text(moodPicked);

    const numRows = 3;
    let venuedivs = '';
    for (let i = 0; i < venues.length/numRows; i++) {
        venuedivs += `<div class="row">`;
        for (let j = (i * numRows); j < ((i * numRows) + numRows); j++) {
            venuedivs += `<div class="col">
                            <h3 class="venuetitle" id="${venues[j].id}">${venues[j].venue}</h3>
                          </div>`;
        }
        venuedivs += `</div><div class="row">`;

        for (let x = ((i * numRows) + 1); x < ((i * numRows) + (numRows + 1)); x++) {
            venuedivs += `<div class="col-4" id="${venues[x - 1].id}">
                            <img src="../../venue_imgs/${venues[x - 1].id}.jpg" alt="${venues[x - 1].venue} image" class="venueimg">
                            <h3 class="score" id="score${x}"></h3>
                          </div>`
        }
        venuedivs += `</div>`
    }
    venuedivs += `<br />`;

    $('#venuecontainer').append(venuedivs);
    $('body').append(`<a href="/moods" class="back" id="goback">&#8249;</a>`);

    $('.col-4, .venuetitle').click(function() {
        let venid = $(this).attr('id');
        let id = {
            id: venid
        }
        let post = $.post("/getVenueData", id);
        if ($(this).attr('class') === 'venuetitle') {
            post.done(loadSite);
        }
        else if ($(this).attr('class') === 'col-4') {
            post.done(loadMaps);
        }
    })

    getVenueInterests(venues);

    setTimeout(() => {
        $('#loadingVenues').hide();
        $('.loader').hide();
        $('#venuecontainer').show()
    }, 1000);
}

/* Function to handle loading Google Maps with venue location
* Venue gps received back from server, attached to google maps link
* New tab opened with google maps results for those coordinates */
function loadMaps(gps) {
    let map = 'http://www.google.com/maps/place/' + gps[0].gpslon + ',' + gps[0].gpslat;
    window.open(map);
}

/* Function to handle loading venue website
* Venue website received back from server
* Check if website is not null, i.e. a website exists for it
* If so, new tab opened with website
* If not, new tab opened with google search of venue name */
function loadSite(url) {
    if (url[0].url !== null) {
        window.open(url[0].url);
    }
    else {
        let search = 'http://www.google.com/search?q=' + url[0].venue;
        window.open(search);
    }
}

/* Function to get interests associated with current user and for each venue from database
* Pass current user to server, call function to handle interests returned
* Loop through venues on page, asking server for interests associated with each of them,
* calling function each time to handle response */
function getVenueInterests(venues) {
    let user = {
        user: currentUser
    }

    let getUserInterests = $.post('/getUserInterests', user);
    getUserInterests.done(handleUserInterests);

    for (let i = 0; i < venues.length; i++) {
        let getInterests = $.post('/getVenueInterests', venues[i]);
        getInterests.done(handleInterests);
    }
}

/* Loop through all interests returned for current user, push to local global array */
function handleUserInterests(interests) {
    for (let x = 0; x < interests.length; x++) {
        userinterests.push(interests[x].interestid);
    }
}

/* Loop through all interests received for venue, push to local array
* Pass array to function to calculate interest compatibility score */
function handleInterests(interests) {
    let interestIDs = [];

    for (let x = 0; x < interests.length; x++) {
        interestIDs.push(interests[x].interestid);
    }
    calculateScores(interestIDs);
}

/* Loop through user interests
* Check if each interest exists in the venue interests array
* Increment the counter if so
* Calculate the % score based on how many of the user interests exist in the venue interests
* Assign score to venue using incremented id */
function calculateScores(venueinterests) {
    let count = 0;
    for (let i = 0; i < userinterests.length; i++) {
        if (venueinterests.includes(userinterests[i])) {
            count++;
        }
    }

    let score = Math.floor((count/venueinterests.length) * 100);
    venuescoreid++;
    let id = '#score' + venuescoreid;
    $(id).html(score + '%');
}

