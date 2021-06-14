Below is an outline of the project and an explanation of how to install and use it.

1. Deployment

The following node modules are needed to run this app:
- express
- body-parser
- sqlite3
- express-session
- passport
- passport-local
- bcrypt
- express-validator
- multer
- fs
- path

These will need to be installed before the app will run.
Open a terminal window or command prompt (Mac/Windows) within the app directory and run the following command:

npm install express body-parser sqlite3 express-session passport passport-local brcypt express-validator multer fs path

This will install all the necessary modules. After installation, run the command 'node app.js' (without the quotations) or if you have nodemon installed, 'nodemon app.js' (also without the quotations). This will set up the server on port 1000. If port 1000 is unavailable to run on your machine, there is a variable in app.js called port on line 67 that be changed to whatever port works for you, i.e. 3000.
Open your browser and go to the address: http://localhost:1000/ (swapping 1000 for whichever port number you have chosen)
This will land you on the homepage of the site.


2. Database
The SQLite database will be populated and included in this zip file.
The name of the database is master database.db, containing multiples tables.
If you need to completely re-setup the database, there are two SQL files included, one called creates.sql and another called inserts.sql
- creates.sql contains the SQL needed to create the tables in the database.
- inserts.sql contains the SQL to populate the tables.
To run these, you will need to open a terminal window or command prompt inside the 'db' sub-directory of the root folder (see 4. Project Structure for further information about location of this directory), then using sqlite3, copy the sql code in and run.
If running these, be sure to run in order they are listed, otherwise errors will occur due to primary and foreign keys relationships.
If setting up the database from scratch, there will be no users present. To add a new user, simply go through the registration process within the site, this will insert a new record into the database.


3. Logging In
If using the existing database, there will be a sample account already setup under the following credentials:
username: 'testaccount'
password: 'testpassword' 
Both to be used without quotations. You can login with these credentials, or you can go through the registration process and create a new account to use.


4. Project Structure
The project is structured in the following way:

The root folder contains the app.js file, index.html and the html, db, sql, public and profile pictures sub-directories.
- Main routes and configuration for the server are within the app.js file.
- Homepage of the site is the index.html file.
- The other html pages of the site are located within the sub-directory 'html', each named as pagename.html.
- The database (masterdatabase.db) is located within the sub-directory 'db'.
- The sql files are located within sub-directory 'sql', creates.sql and inserts.sql as mentioned above
- The profile picture of users of the site are located within the sub-directory 'profile_picture_uploads'

The rest of the project is located within the 'public' sub-directory. This directory contains four sub-directories: css, js, imgs and venue_imgs, which are structured as follows:
- 'css' contains all the css style sheets for the various html pages, as well as the custom font file used on the site. Each .css file named as pagename.css, with pagename relating to the html page which it styles. There are two extra .css files (master & common) for common styling across multiple pages.
- 'js' contains all of the JavaScript files which control the behaviours of the various pages of the site. Each file is named as pagename.js, with pagename relating to the html page which it controls.
- 'imgs' contains the various images and icons used for styling (backgrounds), icons (favicon, heart icons), etc. across the site
- 'venue_imgs' contains all of the images of the venues used by the site. Each image is named id.jpg, where id is a number value being the id of the venue in the database.

Diagram of project structure outlined below: 
(-> indicates directory, - indicates file)
* File names in profile_picture_uploads, imgs & venue_imgs directories are not accurate and are simply a representation of files

-> root
	- readme.txt
	- app.js
	- index.html
	-> html
		- about.html
		- moods.html
		- profile.html
		- interests.html
		- register.thml 
		- 404.html
	-> db
		- masterdatabase.db
	-> sql
		- creates.sql
		- inserts.sql
	-> profile_picture_uploads
		- Avatar.png
		- user1.jpg
		- userN.jpg
	-> public
		-> css
			- index.css
			- about.css
			- moods.css
			- venues.css
			- profile.css
			- interests.css
			- register.css
			- 404.css
			- master.css
			- common.css
			- fontfile.ttf
		-> js
			- index.js
			- about.js
			- moods.js
			- profile.js
			- interests.js
			- register.js
		-> imgs
			- background.gif
			- icons.svg
			- favicon.ico
			- symbol.png
		-> venue_imgs
			- 1.jpg
			- 2.jpg
			- 3.jpg
			- n.jpg

