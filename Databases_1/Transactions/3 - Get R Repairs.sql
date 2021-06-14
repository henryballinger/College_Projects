/* FUNCTION 3 - Get All Repairs With 'R' Status

Declare:
Check: For checking there are available repairs
Status: Hold 'R' in variable for easy checking
Repairs: Array of repair numbers
Message: Message to return to call

Method:
- Check if there are any repairs listed with status 'R'
- If not, return error message
- If repairs available, collect them all into array
    - Loop through array, appending each repair number to message
- Return message with all available repair numbers
*/
create or replace function mechanicFindRepairs
    return varchar2 as 
    bs_check integer := 0;
    bs_status bs_repair.status%type := 'R';
    type bs_repairs_array is varray(20) of bs_repair.repairno%type;
    bs_repairs bs_repairs_array := bs_repairs_array();
    bs_message varchar2(200) := chr(10)||'Repairs available under status R: ';
begin
    select count(*) into bs_check from bs_repair where status = bs_status;
    if bs_check > 0 then
        select repairno bulk collect into bs_repairs from bs_repair where status = bs_status;
        for i in 1..bs_repairs.count loop
            bs_message := bs_message||chr(10)||bs_repairs(i);
        end loop;
    else
        bs_message := chr(10)||'No repairs available';
    end if;
    return bs_message;
    exception
        when others then
        rollback;
        raise;
end;