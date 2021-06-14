/* Express and body-parser used for dealing with requests to server and accessing data in those requests
* sqlite3 used for managing database
* session, passport and local strategy used for managing login and authentication of users
* bcrypt used for password encryption
* express validator used for validation of form inputs
* multer, fs and path used for managing file uploads and file management */
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const database = new sqlite3.Database('db/masterdatabase.db');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/profile_picture_uploads"));
app.use(session({
    secret: 'YouWillNeverGuessThis',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize(undefined));
app.use(passport.session(undefined));

/* SQL Query Statements - Prepared to avoid SQL Injection */
const findUserPass = `select user_id, password from users where user_id = $1;`;
const findMoods = `select * from moods;`;
const checkEmail = `select * from users where email = $1;`;
const checkUsername = `select * from users where user_id = $2;`;
const insertNewUser = `insert into users (user_id, password, firstName, lastName, email, dob) values ($1, $2, $3, $4, $5, $6);`;
const getMood = `select id from moods where mood = $1;`;
const getVenuesByMood = `select venueid from moodvenuelink where moodid in ($1, $2, $3);`;
const getVenuesById = `select * from venues where id in ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
const findVenue = `select * from venues where id = $1;`;
const getAboutVenues = `select id, venue from venues;`;
const findProfile = `select user_id, firstName, lastName, email from users where user_id = $1;`;
const checkUpdateEmail = `select * from users where email = $1 and user_id != $2;`;
const updateEmail = `update users set email = $1 where user_id = $2;`;
const checkUpdateUsername = `select * from users where user_id = $1 and user_id != $2;`;
const updateUsername = `update users set user_id = $1 where user_id = $2;`;
const updateInterests = `update userinterestlink set user_id = $1 where user_id = $2;`;
const updatePassword = `update users set password = $1 where user_id = $2;`;
const updateFirstName = `update users set firstName = $1 where user_id = $2;`;
const updateLastName = `update users set lastName = $1 where user_id = $2;`;
const deleteUser = `delete from users where user_id = $1;`;
const deleteProfileInterests = `delete from userinterestlink where user_id = $1;`;
const getInterests = `select * from interests;`
const saveInterest = `insert into userinterestlink (user_id, interestid) values ($1, $2);`;
const deleteInterest = `delete from userinterestlink where user_id = $1 and interestid = $2;`;
const getUserInterests = `select interestid from userinterestlink where user_id = $1;`;
const getVenueInterest = `select interestid from venueinterestlink where venueid = $1;`;

/* Global variables
* Salt rounds: number of rounds of password encryption to go through
* Current user: user id of currently logged in user
* Html path: path for html files of site
* Port: port number to use for server */
const saltRounds = 10;
let currentUser;
const htmlPath = __dirname + "/html/";
const port = process.env.PORT || "1000";

/* Passport security
* Checking user and password against database
* Serialising user into session so they can access private pages
* De-serialising user on logout */
passport.use(new LocalStrategy(function(username, password, done) {
        const query = database.prepare(findUserPass);
        query.get(username, function (err, row) {
            if (err) { return done(err); }
            if (!row) { return done(null, false, { message: 'User does not exist' }); }
            bcrypt.compare(password, row.password, function(err, result) {
                if (result) {
                    done(null, { id: row.user_id });
                } else {
                    return done(null, false, { message: 'Password is incorrect' });
                }
            });
        });
    }));
passport.serializeUser(function(user, done) {
    if (user) {
        currentUser = user.id;
        done(null, user.id);
    }
});
passport.deserializeUser(function(id, done) {
    done(null, id);
});
/* Check if user is authenticated and allowed to access private pages of site
* If not, redirect back to homepage */
const isAuthenticated = () => {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();}
        res.redirect('/');
    }
}

/* Assign folder to user for profile picture uploads
* Assign current user plus .jpg extension to be file name to allow for easy retrieval */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'profile_picture_uploads/')
    },
    filename: function(req, file, cb) {
        file.filename = currentUser + ".jpg";
        cb(null, file.filename);
    }
})
const upload = multer({ storage: storage });

/* Start server on predefined port number, log on console that server is running */
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

/* Load pages of site checking for authentication on private pages
* '/'        - index/homepage of site, log any user out on reaching this page, as it's the default redirect for errors
* /moods     - page for selecting mood and then venue, user must be logged in to access
* /about     - about page of site, no authentication needed as public page
* /profile   - page for editing profile of user, user must be logged in to access
* /register  - page for registering new users, no authentication needed as public page
* /interests - page for adding/deleting interests from profile, user must be logged in to access */
app.get("/", function(req, res) {
    req.logout();
    res.sendFile( __dirname + "/index.html");
});
app.get("/moods", isAuthenticated(), function(req, res) {
    res.sendFile(htmlPath + "moods.html");
});
app.get("/about", (req, res) => {
    res.sendFile(htmlPath + "about.html");
})

app.get("/profile", isAuthenticated(), (req, res) => {
    res.sendFile(htmlPath + "profile.html", );
})
app.get("/register", (req, res) => {
    res.sendFile(htmlPath + "register.html");
});
app.get("/interests", isAuthenticated(), (req, res) => {
    res.sendFile(htmlPath + "interests.html");
});

/* Logging user into site using passport, if successful, send user to moods page */
app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!user) {
            res.json(info);
        }
        req.logIn(user, function(err) {
            if (err) {
                console.log(err);
                return next(err);
            }
            return res.send('/moods');
        });
    })(req, res, next);
});

/* Log user out, send back to homepage for new login */
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

/* Register new user in database
* Do validation on incoming fields
* Grab fields from body of incoming data
* Check if email is already registered in the database - Return with boolean indicating so
* If email check passed, check if username is already registered in the database - Return with boolean indicating so
* If username check passed, encrypt password and insert all data into database
* Log user in, return indicating that registration was successful and user is now logged in */
app.post('/registerUser', [
        body('firstName').isLength({min: 3, max: 50}),
        body('lastName').isLength({min: 3, max: 50}),
        body('email').isLength({min: 3, max: 50}).isEmail(),
        body('username').isLength({min: 8, max: 20}),
        body('password').isLength({min: 8, max: 20})],
    (req, res) => {
        const validErrors = validationResult(req);
        if(!validErrors.isEmpty()) {
            console.log(validErrors);
            res.status(400).json({errors: validErrors.array()})
        }
        else {
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const email = req.body.email;
            const username = req.body.username;
            const password = req.body.password;
            const dob = req.body.dob;

            let checks = {
                emailused: true,
                usernameused: true,
                success: false,
                loggedin: false
            }

            const checkemail = database.prepare(checkEmail);
            checkemail.all([email], (error, rows) => {
                if (error) { console.log(error) }
                else {
                    if (rows.length !== 0) {
                        res.json(checks);
                    }
                    else {
                        const checkusername = database.prepare(checkUsername);
                        checkusername.all([username], (error, rows) => {
                            if (error) { console.log(error) }
                            else {
                                if (rows.length !== 0) {
                                    checks.emailused = false;
                                    res.status(200).json(checks);
                                }
                                else {
                                    bcrypt.hash(password, saltRounds, function(err, hash) {
                                        const insert = database.prepare(insertNewUser);
                                        insert.run(username, hash, firstName, lastName, email, dob);
                                        insert.finalize();
                                    });
                                    checks.emailused = false;
                                    checks.usernameused = false;
                                    checks.success = true;

                                    let user = {
                                        id: username
                                    }
                                    req.login(user, function(err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            checks.loggedin = true;
                                        }
                                        res.status(200).json(checks);
                                    });
                                }
                            }
                        })
                    }
                }
            });
        }
});

/* Handle upload of files
* uploadFile handles uploads from registration page - redirects to interests page upon completion
* uploadNewFile handles uploads from profile page - reloads profile page with new image upon completion */
app.post('/uploadFile', upload.single('profilePicUpload'), function(req, res) {
    res.redirect('/interests');
});
app.post('/uploadNewFile', upload.single('picUpload'), function(req, res) {
    res.redirect('/profile');
});


/* Retrieve moods from database */
app.get('/loadMoods', function(req, res){
    const getmoods = database.prepare(findMoods);
    getmoods.all((error, moods) => {
        res.status(200).json(moods);
    });
});

/* Handle mood selection
* Receive mood name from incoming request
* Find the ID of that mood in the database
* Retrieve all venue IDs associated with that mood from the database
* Retrieve venue details for those venue IDs from the database
* Return with that list of venues */
app.post('/moodSelect', function(req, res) {
    const mood = req.body.mood;
    const getMoodID = database.prepare(getMood);
    getMoodID.all([mood], function(error, moods) {
        if (error) { console.log(error); }
        else {
            // Create array of moods in case 'surprise me' option selected
            // If selected, assign three random moods to array
            // Else, apply selected mood to all three elements in array
            // Pass array to query
            let moodstopass = [];
            if (moods[0].id === 6) {
                for (let i = 0; i < 3; i++) {
                    moodstopass[i] = Math.floor(Math.random() * 5);
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    moodstopass[i] = moods[0].id;
                }
            }

            const getVenueIDs = database.prepare(getVenuesByMood);
            getVenueIDs.all([moodstopass[0], moodstopass[1], moodstopass[2],], function (error, venueIDs) {
                if (error) { console.log(error); }
                else {
                    // Shuffle array else it will only take the first mood
                    venueIDs = shuffle(venueIDs);

                    const getVenues = database.prepare(getVenuesById);
                    getVenues.all([venueIDs[0].venueid, venueIDs[1].venueid, venueIDs[2].venueid,
                        venueIDs[3].venueid, venueIDs[4].venueid, venueIDs[5].venueid, venueIDs[6].venueid,
                        venueIDs[7].venueid, venueIDs[8].venueid], function (error, venues) {
                        if (error) { console.log(error); }
                        else {
                            // Shuffle venues for different selection each time
                            venues = shuffle(venues);
                            res.status(200).json(venues);
                        }
                    });
                }
            });
        }
    });
});

/* Get details about specific venue from database */
app.post('/getVenueData', function(req, res) {
    const query = database.prepare(findVenue);
    query.all([req.body.id], function(error, info) {
        if (error) { console.log(error) }
        else {
            res.status(200).json(info);
        }
    })
});

/* Retrieve interests associated with a venue id from database */
app.post('/getVenueInterests', function(req, res) {
    const query = database.prepare(getVenueInterest);
    query.all([req.body.id], function(error, rows) {
        if (error) { console.log(error) }
        else {
            res.status(200).json(rows);
        }
    })
});

/* Retrieve venue details to display on about page
* Get all venues from database, shuffle them so each time about page is loaded, a new selection is displayed
* Get first 8 venues, return with those venues */
app.post('/getAboutVenues', function(req, res) {
    const query = database.prepare(getAboutVenues);
    query.all(function(error, rows) {
        if (error) { console.log(error); }
        else {
            rows = shuffle(rows);
            rows = rows.slice(0, 8);
            res.status(200).json(rows);
        }
    })
})

/* Retrieve list of all interests from database to display on interests page */
app.get('/getInterests', (req, res) => {
    const getinterests = database.prepare(getInterests);
    getinterests.all(function (error, interests) {
        if (error) { console.log(error); }
        else {
            res.status(200).json(interests);
        }
    });
});

/* Return currently logged in user */
app.get('/getUser', function (req, res) {
    res.status(200).json(currentUser);
})

/* Retrieve and return profile for a particular user (logged in user) */
app.post('/getProfile', function (req, res) {
    const getProf = database.prepare(findProfile);
    let user = req.body.user;
    getProf.all([user], (error, profile) => {
        if (error) { console.log(error); }
        else {
            res.status(200).json(profile);
        }
    })
})

/* Check if profile picture exists for current user, if so, return true, if not, return false */
app.get('/checkPicture', function (req, res) {
    const pathToFile = path.join(__dirname + '/profile_picture_uploads/', `${currentUser}.jpg`);
    try {
        if (fs.existsSync(pathToFile)) {
            res.status(200).json(true);
        }
        else {
            res.status(200).json(false);
        }
    } catch (error) {
        console.log(error);
    }
});

/* Update relevant parts of profile
* Get column that's being updated and it's new value from request
* Switch case for each item that can be updated (email, username, name, password)
* For email and username:
*   Check if new value is already present in database (not checking against old value in case user tries to update to same value)
*   If present (i.e. another user is already using that email/username), return with message indicating value can't be used
* Extra for username:
*   Create variable with link to profile picture
*   Check if that file exists (i.e. is User has a profile picture)
*   If so, proceed to change the filename to reflect the new username
* Encrypt password
* Update the database for whichever field is being edited, return with message indicating database updated */
app.post('/updateProfile', function (req, res) {
        const currentuser = req.body.currentuser;
        const item = req.body.item;
        const value = req.body.value;

        switch (item) {
            case 'email':
                const checkemail = database.prepare(checkUpdateEmail);
                checkemail.all([value, currentuser], (error, rows) => {
                    if (error) { console.log(error) }
                    else {
                        if (rows.length !== 0) {
                            res.json('Email Used');
                        }
                        else {
                            const saveNewEmail = database.prepare(updateEmail);
                            saveNewEmail.all([value, currentuser], (error) => {
                                if (error) { console.log(error); }
                                else {
                                    res.json('Email Updated');
                                }
                            });
                        }
                    }
                })
                break;
            case 'user_id':
                const checkusername = database.prepare(checkUpdateUsername);
                checkusername.all([value, currentuser], (error, rows) => {
                    if (error) { console.log(error) }
                    else {
                        if (rows.length !== 0) {
                            res.json('Username Used');
                        }
                        else {
                            const updateUser = database.prepare(updateUsername);
                            updateUser.all([value, currentuser], (error) => {
                                if (error) { console.log(error); }
                                else {
                                    const updateProfileInterests = database.prepare(updateInterests);
                                    updateProfileInterests.all([value, currentuser], (error) => {
                                        if (error) { console.log(error); }
                                    });
                                    const pathToFile = path.join(__dirname + '/profile_picture_uploads/', `${currentuser}.jpg`);
                                    try {
                                        if (fs.existsSync(pathToFile)) {
                                            const newPath = path.join(__dirname + '/profile_picture_uploads/', `${value}.jpg`);
                                            fs.renameSync(pathToFile, newPath)
                                        }
                                    } catch (error) {
                                        console.log(error);
                                    }
                                    currentUser = value;
                                    res.json('Username Updated');
                                }
                            });
                        }
                    }
                })
                break;
            case 'password':
                bcrypt.hash(value, saltRounds, function (err, hash) {
                    const updatePass = database.prepare(updatePassword);
                    updatePass.all([hash, currentuser], (error) => {
                        if (error) { console.log(error); }
                        else {
                            res.json('Password Updated');
                        }
                    });
                })
                break;
            case 'firstName':
                const updateFirst = database.prepare(updateFirstName);
                updateFirst.all([value, currentuser], (error) => {
                    if (error) { console.log(error); }
                    else {
                        res.json('First Name Updated');
                    }
                });
                break;
            case 'lastName':
                const updateLast = database.prepare(updateLastName);
                updateLast.all([value, currentuser], (error) => {
                    if (error) { console.log(error); }
                    else {
                        res.json('Last Name Updated');
                    }
                });
                break;
        }
})

/* Delete profile from database
* Delete all saved interests for that profile
* Find profile picture, check if it exists, if so, delete it
* Logout and return to homepage */
app.post('/deleteProfile', function (req, res) {
    let user = req.body.user_id;
    const deleteProf = database.prepare(deleteUser);
    deleteProf.all([user], (error) => {
        if (error) { console.log(error); }
        else {
            const deleteInterests = database.prepare(deleteProfileInterests);
            deleteInterests.all([user], (error, info) => {
                if (error) { console.log(error); }
                else {
                    const pathToFile = path.join(__dirname + '/profile_picture_uploads/', `${user}.jpg`);
                    try {
                        if (fs.existsSync(pathToFile)) {
                            fs.unlinkSync(pathToFile);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    req.logout();
                    res.status(200).json(info);
                }
            });
        }
    })
})

/* Retrieve all interests associated with requested profile (interests user has already liked) */
app.post('/getUserInterests', function(req, res) {
    const userid = req.body.user;
    const getuserinterests = database.prepare(getUserInterests);
    getuserinterests.all([userid], (error, interests) => {
        if (error) { console.log(error) }
        else {
            if (interests.length !== 0) {
                res.status(200).json(interests);
            }
        }
    })
})

/* Add or Delete interest to/from profile
* Extract user, interest and indicator of add/delete from request
* If adding (liking), insert into database link between user and interest
* If deleting (unliking), delete link between user and interest from database */
app.post('/updateInterest', function(req, res) {
    const userid = req.body.user;
    const interestid = req.body.interest;
    const liking = req.body.liking;

    if (liking === 'true') {
        const saveinterest = database.prepare(saveInterest);
        saveinterest.all([userid, interestid], (error) => {
            if (error) { console.log(error) }
            res.end();
        })
    }
    else {
        const deleteinterest = database.prepare(deleteInterest);
        deleteinterest.all([userid, interestid], (error) => {
            if (error) { console.log(error) }
            res.end();
        })
    }
})

/* Function for shuffling arrays */
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/* 404 Page - If requested page cannot be found, load 404 page indicating to user that something went wrong
 displaying link back to homepage */
app.get('*', function(req, res){
    res.sendFile(htmlPath + "404.html", 404);
});
