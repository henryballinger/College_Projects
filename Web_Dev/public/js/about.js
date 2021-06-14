/* Dynamically create divs to hold venues
* Saves writing unnecessary code and can easily be altered to add more venues */
function createVenueDivs() {
    let count1 = 1;
    let count2 = 1;
    let venuedivs = '';
    const numRows = 2;
    const numCols = 4;
    for (let j = 0; j < numRows; j++) {
        venuedivs += `<div class="row">`
            for (let x = 0; x < numCols; x++) {
                venuedivs += `
                <div class="col" id="venue${count1}">
                    <h3 class="venuetitle" id="title${count1}"></h3>
                </div>`
                count1++;
            }
        venuedivs += `</div><div class="row">`;
            for (let y = 0; y < numCols; y++) {
                // Generate random number for interest score to be used as example
                let randScore = Math.floor(Math.random() * 100);
                venuedivs += `
                    <div class="col-3">
                        <img src="" alt="Venue Image Placeholder" class="aboutvenues" id="img${count2}">
                            <h4 class="score" id="score${count2}">${randScore}%</h4>
                    </div>`
                    count2++;
            }
        venuedivs += `</div>`;
    }
    $('#container').append(venuedivs);
}
// Call function to create venue divs and append them to page
createVenueDivs();

/* Ask server to get venues from database, call function to handle response */
const post = $.post('/getAboutVenues');
post.done(createImages);

/* Extract information from response, assign to related elements on page */
function createImages(venues) {
    for (let i = 0; i < venues.length; i++) {
        let venue = venues[i].venue;
        let titleid = '#title' + (i + 1);
        let imgid = '#img' + (i + 1);
        let imgsrc = '../../venue_imgs/' + venues[i].id + '.jpg';
        let imgalt = venue + 'Image';

        $(titleid).html(venue);
        $(imgid).attr('src', imgsrc);
        $(imgid).attr('alt', imgalt);
    }
}