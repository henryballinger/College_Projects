/*
C14489558

This file is for creating tables, normalising the data and adding attributes that I believe should be there

The data is normlaised into six tables: Customer, Repair, Repairparts, Stock, Supplier, Bikes
- Customer is to hold the customer details of the bikes being repaired
- Repair is to hold the details of each repair
- Repairparts is to facilitate the many to many relationship between Repair and Stocks, 
meaning that one repair can use many parts and one part number can be used in many repairs
- Stock is to hold all information about the parts the bike shop has available
- Supplier is to hold the information about the suppliers of the parts and bikes
- Bikes is to hold the information about the various models of bikes
- Bikeparts is to hold the information about which parts are used in which bikes,
facilitates the many to many relationship between stock and bikes, as one part can be 
used in many bikes and one bike can use many parts
*/


/* ALLDATA 
- Set unique model numbers for each bike
- Delete multiple usage of partno 5
    - It was listed as being in the same repars multiple times, some with quantity used as 1, others with quantity used as 2 */
update alldata set modelno = 'FL200UPG' where rtrim(brand) = 'Falcon' and rtrim(frametype) = 'upright' and rtrim(modelname) like 'Gents 20cm up';
update alldata set modelno = 'FL200UPL' where rtrim(brand) = 'Falcon' and rtrim(frametype) = 'upright' and rtrim(modelname) like 'Ladies 20cm up';
update alldata set modelno = 'BX200OFG' where rtrim(brand) = 'BMX' and rtrim(frametype) = 'offroad' and rtrim(modelname) like 'Gents 20cm';
update alldata set modelno = 'BX200OFL' where rtrim(brand) = 'BMX' and rtrim(frametype) = 'offroad' and rtrim(modelname) like 'Ladies 20cm';
update alldata set modelno = 'RL200UPG' where rtrim(brand) = 'Raleigh' and rtrim(frametype) = 'upright' and rtrim(modelname) like 'Gents 20cm up';
update alldata set modelno = 'RL200UPL' where rtrim(brand) = 'Raleigh' and rtrim(frametype) = 'upright' and rtrim(modelname) like 'Ladies 20cm up';
update alldata set modelno = 'TR200UPG' where rtrim(brand) = 'Triumph' and rtrim(frametype) = 'upright' and rtrim(modelname) like 'Gents 20cm up';
update alldata set modelno = 'TR200UPL' where rtrim(brand) = 'Triumph' and rtrim(frametype) = 'upright' and rtrim(modelname) like 'Ladies 20cm up';
delete from alldata where repairno = 1 and partno = 5 and qtyused = 1;


/* DROPS AND CREATES */
drop table bs_customer cascade constraints purge;
drop table bs_repair cascade constraints purge;
drop table bs_repairparts cascade constraints purge;
drop table bs_stock cascade constraints purge;
drop table bs_supplier cascade constraints purge;
drop table bs_bikes cascade constraints purge;
drop table bs_bikeparts cascade constraints purge;
create table bs_customer as select distinct cname, contactno from alldata;
create table bs_repair as select distinct repairno, repairdate, servicedesc, repairdesc, labourcost, status from alldata;
create table bs_repairparts as select distinct repairno, partno, qtyused from alldata;
create table bs_stock as select distinct partno, ispartof, qtyinstock, partname, description, supplierid from alldata;
create table bs_supplier as select distinct supplierid, sname, saddress from alldata;
create table bs_bikes as select distinct modelno, modelname, frametype, nogears, geartype, wheelsize, brand, supplierid from alldata;
create table bs_bikeparts as select distinct modelno, partno from alldata;


/* CUSTOMERS TABLE 
- Add customer id column to customer table
- Update existing cusotmers with ids
- Add three new customers */
alter table bs_customer add customerid number(10);
drop sequence custseq;
create sequence custseq start with 101 increment by 1;
update bs_customer set customerid = custseq.nextval where cname = 'John Browne';
update bs_customer set customerid = custseq.nextval where cname = 'Paul Browne';
insert into bs_customer (cname, contactno, customerid) values ('Jane Smart', 35673892, custseq.nextval);
insert into bs_customer (cname, contactno, customerid) values ('Tim Doyle', 38901294, custseq.nextval);
insert into bs_customer (cname, contactno, customerid) values ('Anthony Byrne', 33672842, custseq.nextval);


/* SUPPLIERS TABLE
- Add two new suppliers
- Change supplier of some parts
- Change supplier of some bikes
*/
insert into bs_supplier (supplierid, sname, saddress) values (2, 'Smiths', 'Cork');
insert into bs_supplier (supplierid, sname, saddress) values (3, 'Wiggle', 'London');
update bs_stock set supplierid = 3 where partno = 1 or partno = 7 or partno = 5;
update bs_bikes set supplierid = 2 where modelno in ('BX200OFG', 'BX200OFL', 'TR200UPL', 'TR200UPG');


/* STOCK TABLE
- Delete duplicate part number 1
- Add additional stock items (parts for bikes) */
update bs_stock set qtyinstock = 11 where partno = 1 and rtrim(description) = 'Standard Wheel';
delete from bs_stock where partno = 1 and qtyinstock = 10;
insert into bs_stock (partno, ispartof, qtyinstock, partname, description, supplierid) values (15, '', 15, 'Cassette', '', 1);
insert into bs_stock (partno, ispartof, qtyinstock, partname, description, supplierid) values (10, '', 45, 'Front brake pads', 'Caliper Brakes', 3);
insert into bs_stock (partno, ispartof, qtyinstock, partname, description, supplierid) values (11, '', 25, 'Rear brake pads', 'Caliper Brakes', 3);
insert into bs_stock (partno, ispartof, qtyinstock, partname, description, supplierid) values (22, '', 5, 'Gear cable', 'Standard gear cable', 3);
insert into bs_stock (partno, ispartof, qtyinstock, partname, description, supplierid) values (24, '', 10, 'Brake cable', '', 3);


/* REPAIR TABLE
- Add column for serial number of bike
- Add column for model number of bike
- Add column for customer id
- Update existing repair details to repair numbers and dates that make more sense, fill in missing information
- Add extra repairs */
alter table bs_repair add serialnum number(38);
alter table bs_repair add modelno varchar(26);
alter table bs_repair add customerid number(10);

update bs_repair set repairdate='10-JAN-20', servicedesc= 'Worn brake pads', repairdesc= 'Replaced pads', labourcost= 15, status= 'F', customerid= 101, serialnum= 934876, modelno= 'RL200UPG' where repairno = 1;
update bs_repair set repairdate = '28-JAN-20', labourcost = 10, status='F', modelno='TR200UPL', customerid = 101, serialnum = 294655 where repairno = 3;
update bs_repair set repairno = 17, repairdate = '08-OCT-20', status='R', modelno='FL200UPG', customerid = 102, serialnum = 736492 where repairno = 500;
update bs_repair set repairno = 18, repairdate = '12-OCT-20', status='R', modelno='RL200UPG', customerid = 104, serialnum = 102384 where repairno = 845;
update bs_repair set repairno = 19, repairdate = '20-OCT-20', status='R', modelno='BX200OFG', customerid = 104, serialnum = 921037 where repairno = 846;

insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (2, '14-JAN-20', 'Wheel rubbing', 'Replaced wheel', 25, 'F', 101, 173589, 'BX200OFL');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (4, '01-FEB-20', 'Broken gear cable', 'Replaced all cables', 50, 'F', 101, 738122, 'FL200UPG');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (5, '28-FEB-20', 'Mended wheel', 'Added spokes', 15, 'F', 101, 645219, 'TR200UPG');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (6, '03-MAR-20', 'Gears slipping', '', 40, 'F', 101, 632809, 'BX200OFG');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (7, '09-MAR-20', 'Worn brake pads', 'Replaced pads', 15, 'F', 101, 107428, 'RL200UPL');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (8, '20-MAR-20', 'Wheel rubbing', 'Replaced wheel', 25, 'F', 101, 810329, 'FL200UPL');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (9, '05-APR-20', 'Mended wheel', 'Added spokes', 15, 'F', 102, 321659, 'BX200OFL');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (10, '23-MAR-20', 'Broken gear cable', 'Replaced all cables', 50, 'F', 102, 211077, 'TR200UPL');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (11, '26-MAR-20', 'Worn brake pads', 'Replaced pads', 15, 'F', 103, 523348, 'TR200UPL');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (12, '17-APR-20', 'Gears slipping', '', 40, 'F', 102, 328890, 'BX200OFL');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (13, '30-APR-20', 'Wheel rubbing', 'Replaced wheels', 25, 'F', 104, 743219, 'FL200UPL');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (14, '20-AUG-20', 'Broken gear cable', 'Replaced all cables', 50, 'C', 102, 658133, 'TR200UPG'); 
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (15, '01-SEP-20', 'Gears sliping', '', 40, 'C', 103, 447298, 'RL200UPL');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (16, '11-SEP-20', 'Broken gear cable', 'Replaced all cables', 50, 'C', 104, 302486, 'FL200UPG');
insert into bs_repair (repairno, repairdate, servicedesc, repairdesc, labourcost, status, customerid, serialnum, modelno)
    values (20, '18-SEP-20', 'Wheel rubbing', 'Replaced wheel', '', 'R', 105, 327489, 'BX200OFG');


/* REPAIRPARTS TABLE
- Delete old parts used as there are multiples
- Add parts used and quantity used for each repair */
delete from bs_repairparts where repairno in (1, 3, 845, 846, 500);
insert into bs_repairparts (repairno, partno, qtyused) values (1, 10, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (1, 11, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (2, 1, 1);
insert into bs_repairparts (repairno, partno, qtyused) values (4, 22, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (4, 24, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (5, 7, 4);
insert into bs_repairparts (repairno, partno, qtyused) values (6, 12, 1);
insert into bs_repairparts (repairno, partno, qtyused) values (7, 10, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (7, 11, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (8, 1, 1);
insert into bs_repairparts (repairno, partno, qtyused) values (9, 7, 3);
insert into bs_repairparts (repairno, partno, qtyused) values (10, 22, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (10, 24, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (11, 10, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (11, 11, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (12, 12, 1);
insert into bs_repairparts (repairno, partno, qtyused) values (13, 1, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (14, 22, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (14, 24, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (15, 15, 1);
insert into bs_repairparts (repairno, partno, qtyused) values (16, 22, 2);
insert into bs_repairparts (repairno, partno, qtyused) values (16, 24, 2);


/* BIKEPARTS TABLE
- Add quantity in bike column
- Update quantities in models so they are not null
- Insert extra parts */
alter table bs_bikeparts add qtyinbike number(5,0);
update bs_bikeparts set qtyinbike = 5;
update bs_bikeparts set qtyinbike = 2 where partno = 1;
update bs_bikeparts set qtyinbike = 8 where partno = 12;
insert into bs_bikeparts (modelno, partno, qtyinbike) values ('FL200UPG', 22, 2);
insert into bs_bikeparts (modelno, partno, qtyinbike) values ('FL200UPG', 24, 2);
insert into bs_bikeparts (modelno, partno, qtyinbike) values ('FL200UPG', 10, 2);
insert into bs_bikeparts (modelno, partno, qtyinbike) values ('BX200OFG', 22, 2);
insert into bs_bikeparts (modelno, partno, qtyinbike) values ('BX200OFG', 24, 2);
insert into bs_bikeparts (modelno, partno, qtyinbike) values ('BX200OFG', 10, 2);
insert into bs_bikeparts (modelno, partno, qtyinbike) values ('TR200UPL', 11, 2);
insert into bs_bikeparts (modelno, partno, qtyinbike) values ('TR200UPL', 15, 1);
insert into bs_bikeparts (modelno, partno, qtyinbike) values ('TR200UPL', 10, 2);


/* PRIMARY KEYS
- Customer table: Customer id
- Repair table: Repair number
- Repairparts table: Part number and Repair number combined
- Stock table: Part number
- Supplier table: Supplier id
- Bikes table: Model number
- Bikeparts table: Model number and Part number combined */
alter table bs_customer add constraint pk_customer primary key (customerid);
alter table bs_repair add constraint pk_repair primary key (repairno);
alter table bs_repairparts add constraint pk_repairparts primary key (partno, repairno);
alter table bs_stock add constraint pk_partno primary key (partno);
alter table bs_supplier add constraint pk_supplier primary key (supplierid);
alter table bs_bikes add constraint pk_model primary key (modelno);
alter table bs_bikeparts add constraint pk_bikeparts primary key (modelno, partno);


/* FOREIGN KEYS
- Repair table: Customer id to customer table
- Repair table: Model number to bikes table
- Repairparts table: Repair number to repair table 
- Reapirparts table: Part number to stock table
- Stock table: Supplier id to supplier table
- Stock table: Is part of to stock table
- Bikes table: Supplier id to supplier table
- Bikeparts table: Model number to bikes table
- Bikeparts table: Part number to stock table */
alter table bs_repair add constraint fk_customer foreign key (customerid) references bs_customer (customerid);
alter table bs_repair add constraint fk_bike foreign key (modelno) references bs_bikes (modelno);
alter table bs_repairparts add constraint fk_repairno foreign key (repairno) references bs_repair (repairno);
alter table bs_repairparts add constraint fk_partno foreign key (partno) references bs_stock (partno);
alter table bs_stock add constraint fk_supplierid foreign key (supplierid) references bs_supplier (supplierid);
alter table bs_stock add constraint fk_ispartof foreign key (ispartof) references bs_stock (partno);
alter table bs_bikes add constraint fk_supplier foreign key (supplierid) references bs_supplier(supplierid);
alter table bs_bikeparts add constraint fk_bikemodel foreign key (modelno) references bs_bikes (modelno);
alter table bs_bikeparts add constraint fk_bikepart foreign key (partno) references bs_stock (partno);


/* NOT NULLS
- Make customer id, serial number and model number on repair table mandatory (not nullable)
as it would be necessary to have customer details, model of the bike and the serial number to 
idenify for each repair in a real bike repair shop */
alter table bs_customer modify contactno not null;
alter table bs_repair modify repairdate not null;
alter table bs_repair modify status not null;
alter table bs_repair modify serialnum not null;
alter table bs_repair modify customerid not null;
alter table bs_repair modify modelno not null;
alter table bs_repairparts modify qtyused not null;
alter table bs_supplier modify sname not null;
alter table bs_stock modify qtyinstock not null;
alter table bs_bikes modify modelname not null;
alter table bs_bikeparts modify qtyinbike not null;

commit;
