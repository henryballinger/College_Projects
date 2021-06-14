/* FUNCTION 2 - Entering New Bike

Receive:
Supplier name and address, if new supplier
Two booleans for indicating if suppier and model have been checked
Supplier id, model number, name, frametype, nogears, geartype, wheelsize and brand

Declare:
Check: For checking counts
    If supplier exists
    If model already exists in database
Message: Message to return to call

Method:
- Check boolean to see if supplier has already been checked
    - If not, check if supplier is valid
- Check boolean to see if model has already been checked
    - If not, check if model already exists on system
- If all checks passed, insert new bike details
*/
create or replace function enterNewBike (
    bs_supname bs_supplier.sname%type,
    bs_supadd bs_supplier.saddress%type,
    bs_supcheck boolean,
    bs_modelcheck boolean,
    bs_supplierid bs_bikes.supplierid%type,
    bs_modelno bs_bikes.modelno%type,
    bs_modelname bs_bikes.modelname%type,
    bs_frametype bs_bikes.frametype%type,
    bs_nogears bs_bikes.nogears%type,
    bs_geartype bs_bikes.geartype%type,
    bs_wheelsize bs_bikes.wheelsize%type,
    bs_brand bs_bikes.brand%type)
return varchar2 as
    bs_check integer := 0;
    bs_message varchar2(200) := ' ';
begin
    if bs_supcheck = false then
        select count(*) into bs_check from bs_supplier where supplierid = bs_supplierid;
        if bs_check = 0 then
            bs_message := chr(10)||'Supplier ID: '||bs_supplierid||' does not exist.';
            return bs_message;
        else
            bs_message := 'Pass';
            return bs_message;
        end if;
    else
        if bs_modelcheck = false then
            select count(*) into bs_check from bs_bikes where modelno = upper(bs_modelno);
            if bs_check = 1 then
                bs_message := chr(10)||'This model already exists in the database.';
                return bs_message;
            else
                bs_message := 'Pass';
                return bs_message;
            end if;
        else
            insert into bs_bikes (modelno, modelname, frametype, nogears, geartype, wheelsize, brand, supplierid) 
                values (upper(bs_modelno), bs_modelname, bs_frametype, bs_nogears, bs_geartype, bs_wheelsize, bs_brand, bs_supplierid);
            commit;
            bs_message := chr(10)||'New bike successfully added: '||chr(10)||
                'Supplier ID: '||bs_supplierid||chr(10)||
                'Model number: '||upper(bs_modelno)||chr(10)||
                'Model name: '||bs_modelname||chr(10)||
                'Frame type: '||bs_frametype||chr(10)||
                'Number of gears: '||bs_nogears||chr(10)||
                'Gear type: '||bs_geartype||chr(10)||
                'Wheel size: '||bs_wheelsize||chr(10)||
                'Brand: '||bs_brand||chr(10);
        end if;
    end if;
    return bs_message;
    exception
        when others then
        rollback;
        raise;
end;

/* FUNCTION 2.0.1 - Create New Supplier
Receive:
Supplier name and address

Declare:
Id: For getting and creating new supplier id
Message: Message to return to call

- Get highest current supplier id
- Increment that id
- Create new supplier using new id and supplied name and address
- Return success message
*/
create or replace function newSupplier(
    bs_name bs_supplier.sname%type,
    bs_address bs_supplier.saddress%type)
return varchar2 as
    bs_id bs_supplier.supplierid%type := 0;
    bs_message varchar2(200) := ' ';
begin
    select * into bs_id from (select supplierid from bs_supplier order by supplierid desc) where rownum = 1;
    bs_id := bs_id + 1;
    insert into bs_supplier(supplierid, sname, saddress) values (bs_id, bs_name, bs_address);
    commit;
    bs_message := chr(10)||'New Supplier Added: '||chr(10)||
                'Supplier ID: '||bs_id||chr(10)||
                'Supplier Name: '||bs_name||chr(10)||
                'Supplier Address: '||bs_address||chr(10);
    return bs_message;
    exception
        when others then
        rollback;
        raise;
end;
    
/* FUNCTION 2.0.2 - Get Most Recently Entered Supplier Id
Declare:
Id: For getting supplier id

- Get highest current supplier id (most recently entered)
- Return id
*/
create or replace function getSupplierId
return number as
    bs_id bs_supplier.supplierid%type := 0;
begin
    select * into bs_id from (select supplierid from bs_supplier order by supplierid desc) where rownum = 1;
    return bs_id;
    exception
        when others then
        rollback;
        raise;
end;