/* FUNCTION 4 - Updating Repair

Receive:
Repair number, labour cost and description
Two booleans to indicate if checks have been performed:
Rep: Check if repair number exists
Stat: Check if repair has valid status

Declare:
Checks:
    If repair number exists
    If status is valid ('R')
Status: Hold 'C' in variable for easy assign to repair
Message: Message to return to call

Method:
- Check boolean to see if repair number has already been checked
    - If not, check if repair exists
        - Return with fail/success indication
- Check boolean to see if repair status has already been checked
    - If not, check if repair has valid status
        - Return with fail/success indication
- If all checks passed, update repair with labour cost and description
- Change status to 'C'
*/
create or replace function updateRepair (
    bs_repairno bs_repair.repairno%type, 
    bs_labourcost bs_repair.labourcost%type, 
    bs_repairdesc bs_repair.repairdesc%type,
    bs_repcheck boolean,
    bs_statcheck boolean)
return varchar2 as
    bs_checkrno integer := 0;
    bs_status bs_repair.status%type := 'C';
    bs_checkstatus bs_repair.status%type := ' ';
    bs_message varchar2(200) := ' ';
begin
    if bs_repcheck = false then
        select count(*) into bs_checkrno from bs_repair where repairno = bs_repairno;
        if bs_checkrno = 1 then
            bs_message := 'Pass';
            return bs_message;
        else
            bs_message := chr(10)||'Repair number does not exist';
            return bs_message;
        end if;
    else
        if bs_statcheck = false then
            select status into bs_checkstatus from bs_repair where repairno = bs_repairno;
            if bs_checkstatus != 'R' then
                bs_message := chr(10)||'Repair already finished. Status: '||bs_checkstatus;
                return bs_message;
            else
                bs_message := 'Pass';
                return bs_message;
            end if;
        else
            update bs_repair set labourcost = bs_labourcost where repairno = bs_repairno;
            update bs_repair set repairdesc = bs_repairdesc where repairno = bs_repairno;
            update bs_repair set status = bs_status where repairno = bs_repairno;
            commit;
            bs_message := chr(10)||
                'Repair '||bs_repairno||' updated.'||chr(10)||
                'Labour cost: '||bs_labourcost||chr(10)||
                'Repair Description: '||bs_repairdesc||chr(10)||
                'Status: '||bs_status||chr(10);
        end if;
    end if;
    return bs_message;
    exception
        when others then
        rollback;
        raise;
end;