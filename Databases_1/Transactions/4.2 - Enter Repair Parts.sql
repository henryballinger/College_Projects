/* FUNCTION 4.2 - Entering Parts Used in Repair

Receive:
Repair number, part number and quantity of that part used
Four booleans to indicate if checks have been performed:
Rep: Check if repair number exists
Stock: Check if part exists
Part: Check is part has already been logged in repair
Quantity: Check if there is enough stock to cover quantity entered

Declare:
Check: For checking counts
    If repair number exists
    If repair has valid status
    If part number exists
    If part already logged in repair
    If enough stock
Message: Message to return to call

Method:
- Check boolean to see if repair number has already been checked
    - If not, check if repair exists and has valid status
        - Return with fail/success indication
- Check boolean to see if part number has already been checked
    - If not, check
        - Return with fail/success indication
- Check boolean to see if stock has already been checked
    - If not, check
        - Return with fail/success indication
- If all checks passed, save part as being used in repair with quantity
- Update stock by reducing quantity by quantity used in repair
*/
create or replace function enterRepairParts (
    bs_repairno bs_repair.repairno%type,
    bs_partnumber bs_repairparts.partno%type,
    bs_quantity bs_repairparts.qtyused%type,
    bs_repcheck boolean,
    bs_stockcheck boolean,
    bs_partcheck boolean,
    bs_qtycheck boolean)
return varchar2 as
    bs_check integer := 0;
    bs_message varchar2(200) := ' ';
begin
    if bs_repcheck = false then
        select count(*) into bs_check from bs_repair where repairno = bs_repairno;
        if bs_check = 0 then
            bs_message := chr(10)||'Repair number does not exist.';
            return bs_message;
        else
            select count(*) into bs_check from bs_repair where repairno = bs_repairno and status = 'F';
            if bs_check = 1 then
                bs_message := chr(10)||'Repair has been finished. Can not be updated.';
                return bs_message;
            else
                bs_message := 'Pass';
                return bs_message;
            end if;
        end if;
    else
        if bs_stockcheck = false then
            select count(*) into bs_check from bs_stock where partno = bs_partnumber;
            if bs_check = 0 then
                bs_message := chr(10)||'Part number does not exist.'||chr(10);
                return bs_message;
            else
                bs_message := 'Pass';
                return bs_message;
            end if;
        else
            if bs_partcheck = false then
                select count(*) into bs_check from bs_repairparts where repairno = bs_repairno and partno = bs_partnumber;
                if bs_check > 0 then
                    bs_message := chr(10)||'Repair number '||bs_repairno||' has already been listed as using part '||bs_partnumber||'.'||chr(10);
                    return bs_message;
                else
                    bs_message := 'Pass';
                    return bs_message;
                end if;
            else
                if bs_qtycheck = false then
                    select qtyinstock into bs_check from bs_stock where partno = bs_partnumber;
                    if bs_check < bs_quantity then
                        bs_message := chr(10)||'Not enough stock.'||chr(10);
                        return bs_message;
                    else
                        insert into bs_repairparts (repairno, partno, qtyused) values (bs_repairno, bs_partnumber, bs_quantity);
                        update bs_stock set qtyinstock = qtyinstock-bs_quantity where partno = bs_partnumber;
                        bs_check := bs_check-bs_quantity;
                        commit;
                        bs_message := chr(10)||'Part and quanity used recorded.'||chr(10)||
                            'Repair Number: '||bs_repairno||chr(10)||
                            'Logged as using: '||bs_quantity||' of '||chr(10)||
                            'Part number: '||bs_partnumber||'.'||chr(10)||chr(10)||
                            'New stock level of '||bs_partnumber||' is: '||bs_check||chr(10);
                    end if;
                end if;
            end if;
        end if;
    end if;
    return bs_message;
    exception
        when others then
        rollback;
        raise;
end;