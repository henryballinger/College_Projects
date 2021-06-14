/* FUNCTION 1 - Entering New Repair
 
Receive:
Customer name, number, bike model, serial number, service description
and boolean to indicate if model has been checked 

Declare:
Date: Get today date from system for repair date
Status: Hold 'R' in variable for easy assign to new repairs
Check: For checking counts
    If customer record exists or new customer needs to be made
    If model exists on record (i.e. if model can be serviced)
Id: For getting existing customer id or for creating new customer id
Repairnum: For creating new repair number
Message: Message to return to call

Method:
- Check boolean to see if model number has already been checked
    - If not, check if model number exists in bikes record table
        - If not, return message that bike is not serviced here
            (This will stop any further wasted input of customer details)
        - If bike exists, return pass message to allow further input
    - If model has been checked, check if customer details exist
        - If they do, retrieve customer id
        - If not, create new customer record by incrementing id of 
            previous customer record
    - Create new repair number by incrementing number of previous repair
    - Insert new details
*/
create or replace function repairEntry (
    bs_name bs_customer.cname%type,
    bs_number bs_customer.contactno%type,
    bs_model bs_repair.modelno%type,
    bs_serial bs_repair.serialnum%type,
    bs_description bs_repair.servicedesc%type,
    bs_modelchecked boolean)
return varchar2 as
    bs_date  bs_repair.repairdate%type := sysdate;
    bs_status bs_repair.status%type := 'R';
    bs_check integer := 0;
    bs_id bs_customer.customerid%type;
    bs_repairnum bs_repair.repairno%type;
    bs_message varchar2(200) := ' ';
begin
    if bs_modelchecked = false then
        select count(*) into bs_check from bs_bikes where modelno = upper(bs_model);
        if bs_check = 0 then
            bs_message := chr(10)||'Sorry we do not repair that model of bike'||chr(10);
            return bs_message;
        else
            bs_message := 'Pass';
            return bs_message;
        end if;
    else
        select count(*) into bs_check from bs_customer where lower(cname) = lower(bs_name) and contactno = bs_number;
        if bs_check = 1 then
            select customerid into bs_id from bs_customer where lower(cname) = lower(bs_name) and contactno = bs_number;
            bs_message := chr(10)||'Customer exists, details retrieved. Customer ID: '||bs_id||chr(10);
        else
            select * into bs_id from (select customerid from bs_customer order by customerid desc) where rownum = 1;
            bs_id := bs_id + 1;
            insert into bs_customer(customerid, cname, contactno) values (bs_id, bs_name, bs_number);
            commit;
            bs_message := chr(10)||'New customer, details saved.'||chr(10)||
                'Name: '||bs_name||chr(10)||
                'Number: '||bs_number||chr(10)||
                'New ID: '||bs_id||chr(10);
        end if;
        select * into bs_repairnum from (select repairno from bs_repair order by repairno desc) where rownum = 1; 
        bs_repairnum := bs_repairnum + 1;
        insert into bs_repair (repairno, repairdate, servicedesc, status, customerid, serialnum, modelno) values
            (bs_repairnum, bs_date, bs_description, bs_status, bs_id, bs_serial, upper(bs_model));
        commit;
        bs_message := bs_message||chr(10)||'Repair logged, details:'||chr(10)||
            'Repair number: '||bs_repairnum||chr(10)||
            'Service description: '||bs_description||chr(10)||
            'Status: '||bs_status||chr(10);
    end if;
    return bs_message;
    exception
        when others then
        rollback;
        raise;
end;