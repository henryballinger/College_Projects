/* FUNCTION 2.2 - Entering Parts in Bikes

Receive: 
Model number, part number and quantity in bike
Is part of and part name if new part
Three booleans to indiciate if checks have been performed:
Model: Check if model exists
Part: Check if part exists in bike
Stock: Check if part is in system
Last boolean, new part to indicate if this is a new part

Declare:
Supplier: Hold supplier id of part
Check: For checking counts
    If model exists
    If part already logged in bike
    If part in stock
Message: Message to return to call

Method:
- Check boolean to see if model has already been checked
    - If not, check
        - Return with fail/success indication
- Check boolean to see if part has already been checked
    - If not, check
        - Return with fail/success indication
- Check boolean to see if stock has already been checked
    - If not, check
        - Return with fail/success indication
- Check if this is a new part
    - If so, insert part into stock table with 0 quantity so part is saved
- If all checks passed, save part as being used in bike with quantity
*/
create or replace function newBikeParts (
    bs_model bs_bikeparts.modelno%type,
    bs_part bs_bikeparts.partno%type,
    bs_ispartof bs_stock.ispartof%type,
    bs_qty bs_bikeparts.qtyinbike%type,
    bs_partname bs_stock.partname%type,
    bs_modelcheck boolean,
    bs_partcheck boolean,
    bs_stockcheck boolean,
    bs_newpart boolean)
return varchar2 as
    bs_supplier bs_stock.supplierid%type;
    bs_check integer := 0;
    bs_message varchar2(200) := ' ';
begin
    if bs_modelcheck = false then
        select count(*) into bs_check from bs_bikes where modelno = upper(bs_model);
        if bs_check = 1 then
            bs_message := 'Pass';
        else 
            bs_message := chr(10)||'Bike model does not exist.'||chr(10);
        end if;
        return bs_message;
    elsif bs_modelcheck = true then
        if bs_partcheck = false then
            select count(*) into bs_check from bs_bikeparts where partno = bs_part and modelno = upper(bs_model);
            if bs_check = 0 then
                bs_message := 'Pass';
            else
                bs_message := chr(10)||'Part already logged in bike.'||chr(10);
            end if;
            return bs_message;
        elsif bs_partcheck = true then
            if bs_stockcheck = false then
                select count(*) into bs_check from bs_stock where partno = bs_part;
                if bs_check = 1 then
                    bs_message := 'Pass';
                end if;
                return bs_message;
            elsif bs_stockcheck = true then
                if bs_newpart = true then
                    select supplierid into bs_supplier from bs_bikes where modelno = upper(bs_model);
                    insert into bs_stock (partno, ispartof, partname, qtyinstock, supplierid) 
                        values (bs_part, bs_ispartof, bs_partname, 0, bs_supplier);
                    commit;
                    bs_message := chr(10)||'New Part. Saved in stock.'||chr(10)||
                        'Part number: '||bs_part||chr(10)||
                        'Is part of: '||bs_ispartof||chr(10)||
                        'Part name: '||bs_partname||chr(10)||
                        'Quantity in stock: 0'||chr(10)||
                        'Supplier id: '||bs_supplier||chr(10);
                end if;
                insert into bs_bikeparts (modelno, partno, qtyinbike) values (upper(bs_model), bs_part, bs_qty);
                commit;
                bs_message := bs_message||chr(10)||'Records saved.'||chr(10)||'Bike '||upper(bs_model)||' has '||bs_qty||' of part '||bs_part||chr(10);
                return bs_message;
            end if;
        end if;
    end if;
    return bs_message;
    exception
        when others then
        rollback;
        raise;
end;