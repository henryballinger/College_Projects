/* FUNCTION 6 - Finish Repair by changing status to 'F'

Receive:
Repair number

Declare:
Checks:
    If repair number exists
    If status is valid ('C')
Status: Hold 'F' in variable for easy assign to repair
Message: Message to return to call

Method:
- Check if repair number exists
    If not, return error message
- Check if repair has valid status to be updated ('C')
    If not, return error message
- If checks passed
    Finish repair (change status to 'F')
*/
create or replace function finishRepair (
    bs_repairno bs_repair.repairno%type)
return varchar2 as 
    bs_checkrno integer := 0;
    bs_status bs_repair.status%type := 'F';
    bs_checkstatus bs_repair.status%type := ' ';
    bs_message varchar2(200) := ' ';
begin
    select count(*) into bs_checkrno from bs_repair where repairno = bs_repairno;
    if bs_checkrno = 1 then
        select status into bs_checkstatus from bs_repair where repairno = bs_repairno;
        if bs_checkstatus = 'C' then
            update bs_repair set status = bs_status where repairno = bs_repairno;
            commit;
            bs_message := chr(10)||'Repair '||bs_repairno||' succesfully updated to Finished';
        else
            bs_message := chr(10)||'Repair is not in postition to be updated. Status: '||bs_checkstatus;
        end if;
    else
        bs_message := chr(10)||'Repair number does not exist';
    end if;
    return bs_message;
    exception
        when others then
        rollback;
        raise;
end;