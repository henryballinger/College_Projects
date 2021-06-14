/* SQL for creating tables in database */
create table moods (
    id integer primary key autoincrement,
    mood varchar(30) not null
);

create table interests (
    id integer primary key autoincrement,
    interest varchar(50) not null
);

create table venues (
    id integer primary key,
    venue varchar(100) not null,
    gpslon real not null,
    gpslat real not null,
    url varchar(200)
);

create table users (
   user_id varchar primary key,
   password varchar not null,
   firstName varchar(50) not null,
   lastName varchar(50) not null,
   email varchar(50) not null,
   dob date not null
);

create table moodvenuelink (
   moodid integer not null,
   venueid integer not null,
   primary key(moodid, venueid),
   foreign key (moodid) references moods (id),
   foreign key (venueid) references venues (id)
);

create table venueinterestlink (
    venueid integer not null,
    interestid integer not null,
    primary key (venueid, interestid),
    foreign key (venueid) references venues (id),
    foreign key (interestid) references interests (id)
);

create table userinterestlink (
    user_id varchar not null,
    interestid integer not null,
    primary key(user_id, interestid),
    foreign key (user_id) references users (user_id),
    foreign key (interestid) references interests (id)
);