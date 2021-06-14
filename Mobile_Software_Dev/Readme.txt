Due to the cancelling of the demonstration for this application, the prerequisites and description of how to use the app are explained below.

1. Database

There was several problems with the database emptying itself during the development of this app. Therefore, included are both the database files, as well as the inserts.sql file used to populate the database. 
These will hopefully not be necessary, however, if the database is not populated upon installation on the device (this will be evident by the Interests and Venues pages displaying a blank page), the user can upload the included files to the Device File Explorer of the app using Android Studio.
All the database files are included in the 'Database' sub-folder of the 'Resources' folder of this submission. Using the Device File Explorer within Android Studio, navigate this path: data -> data -> com.example.assignment -> databases.
Right click on this folder (databases), click 'upload' and select the contents of the Databases folder included here. This will upload a populated database to the application.


2. Using the App

Upon landing on the homepage, there will be four links: Moods, Interests, Check In, About.
The first will take the user to the moods page. Here, the user will be asked for permission to use location services, this is necessary for the app, so click 'While Using the App'. The app will then find the device's GPS coordinates and display a list of moods. Clicking on any of these will then display a list of venues associated with that mood, along with the distance to venue, an interest compatibility score (see below) and a maps icon which will link to Google Maps at the venue location.
The second will bring the user to a page where they can edit their interests. The top list displays a list of not yet liked interests, the bottom list displays a list of interests that the user has liked. By clicking on any interest, it will move it to the other list (not liked to liked and vice versa). The floating action button will allow the user to enter a new interest, which will be added to the liked interests list. These liked interests are compared to the interests associated with each venue to generate the interest compatibility score mentioned above. [1]
The third will bring the user to a check in page, designed to let them take a picture of a QR code which will be in the venue the user is visiting.
The final link will bring the user to an about page which gives an outline of the purpose of the application.


3. Contact

If there are any problems with the database or any part of the app process needs explaining, please contact me and I'll be happy to explain or assist: C14489558@mytudublin.ie



[1] - The interests associated with the venues are randomly generated for this assignment and do no reflect real world associations.
