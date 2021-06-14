/* FUNCTION 5 - Check Status of Repair

Receive:
Repair number and serial number of bike

Declare:
Checks:
    If repair number valid
    If serial number correct
Repair State: For holding status of repair
Message: Message to return to call

Method:
- Check if repair number exists
    If not, return error message
- Check if serial number is correct for repair
    If not, return error message
- If checks passed
    Return relevant message depending on state of repair (F, C, R)
*/
create or replace function checkStatus (
    bs_repairno bs_repair.repairno%type, 
    bs_serialnum bs_repair.serialnum%type)
return varchar2 as
    bs_checkrno integer := 0;
    bs_checkserial integer := 0;
    bs_repairstate varchar2(1) := ' ';
    bs_message varchar2(200) := ' ';
begin
    select count(*) into bs_checkrno from bs_repair where repairno = bs_repairno;
    if bs_checkrno = 1 then
        select count(*) into bs_checkserial from bs_repair where serialnum = bs_serialnum;
        if bs_checkserial = 1 then
            select status into bs_repairstate from bs_repair where repairno = bs_repairno;
            if bs_repairstate = 'F' then
                bs_message := chr(10)||'Repair '||bs_repairno||' is finished and collected.';
            elsif bs_repairstate = 'C' then 
                bs_message := chr(10)||'Repair '||bs_repairno||' is ready for collection.';
            elsif bs_repairstate = 'R' then 
                bs_message := chr(10)||'Repair '||bs_repairno||' is awaiting repair.';
            else
                bs_message := chr(10)||'No status available.';
            end if;
        else
            bs_message := chr(10)||'Serial number incorrect.';
        end if;
    else
        bs_message := chr(10)||'Repair number does not exist.';
    end if;
    return bs_message;
    exception
        when others then
        rollback;
        raise;
end;