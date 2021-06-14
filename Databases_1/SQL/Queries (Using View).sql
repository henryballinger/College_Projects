/*
C14489558

This is for the SQL section of the assignment.
This file is doing the queries using a View
There is another file for demonstrating the queries using joins.
*/


-- Create view to use for queries
create or replace view CustRepairBikes as
    (select cname, customerid, repairno, modelno from bs_customer
        join bs_repair using (customerid)
        join bs_bikes using (modelno));
    
    
-- (A - B) Customers who brought RL200UPG but not TR200UPG in for repair
select cname as CustomerName from CustRepairBikes
    where modelno like 'RL200UPG'
minus
select cname from CustRepairBikes
    where modelno like 'TR200UPG';


-- (B - A) Customers who brought TR200UPG but not RL200UPG in for repair
select cname as CustomerName from CustRepairBikes
    where modelno like 'TR200UPG'
minus
select cname from CustRepairBikes
    where modelno like 'RL200UPG';


-- (A ∩ B) Customers who brought both RL200UPG and TR200UPG in for repair
select cname from CustRepairBikes
    where modelno like 'RL200UPG'
intersect
select cname from CustRepairBikes
    where modelno like 'TR200UPG';


-- (A ∪ B) Customers who brought either RL200UPG or TR200UPG in for repair
select cname as CustomerName from CustRepairBikes
    where modelno like 'RL200UPG'
union
select cname from CustRepairBikes
    where modelno like 'TR200UPG';
    
    
-- A xor B (A ∪ B) - (A ∪ B) Customers who brought either RL200UPG or TR200UPG in for repair, but not both
select cname as CustomerName from CustRepairBikes
    where modelno in ('RL200UPG', 'TR200UPG')
minus
(select cname from CustRepairBikes
    where modelno like 'RL200UPG'
intersect
select cname from CustRepairBikes
    where modelno like 'TR200UPG');


-- (A - ¬A) Customers who brought only BX200OFG in for repair
select cname as CustomerName from CustRepairBikes
    where modelno like 'BX200OFG'
minus
(select cname from CustRepairBikes
    where modelno not like 'BX200OFG');
    

-- Customers who brought all bike models in for repair
select cname as CustomerName from bs_customer customer
    where not exists
    (select * from bs_bikes bikes
        where not exists
            (select * from bs_repair repairs
                where repairs.customerid = customer.customerid and repairs.modelno = bikes.modelno));
                