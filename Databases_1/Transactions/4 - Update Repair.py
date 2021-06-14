import cx_Oracle
#  Login Details
p_username = "Assignment"
p_password = "oracle"
p_host = "localhost"
p_service = "orcl"
p_port = "1521"
mydsn = p_host + "/" + p_service + ":" + p_port

try:
    # Establish Connection
    con = cx_Oracle.connect(user=p_username, password=p_password, dsn=mydsn)
    cur = con.cursor()

    # TRANSACTION 4
    # Updating repair with labour cost, repair description, changing status to 'C' and saving parts used in repair.

    # Ask user for repair number
    # Checking input is only numbers, not characters
    while True:
        try:
            bs_repairno = int(input('Enter Repair Number: '))
            break
        except:
            print("Invalid Input. Numbers Only. Try Again.")

    try:
        # Check if repair number exists in system
        # If not, there is no point asking for the other details.
        # User will be informed and no time or input will be wasted.
        bs_repcheck = cur.callfunc('updateRepair', str, [bs_repairno, None, None, False, False])
        # If repair exists
        if bs_repcheck == 'Pass':
            # Check if repair has valid status ('R')
            bs_statcheck = cur.callfunc('updateRepair', str, [bs_repairno, None, None, True, False])
            if bs_statcheck == 'Pass':
                # Ask user for repair information: labour cost and description
                # Call function to update repair
                # Checking input is only numbers, not characters
                while True:
                    try:
                        bs_labourcost = float(input('Enter Labour Cost: '))
                        break
                    except:
                        print("Invalid Input. Numbers Only. Try Again.")
                bs_repairdesc = input('Enter Repair Description: ')
                repairUpdated = cur.callfunc('updateRepair', str,
                                             [bs_repairno, bs_labourcost, bs_repairdesc, True, True])
                print(repairUpdated)
                # Ask user how many different parts there are to save for this repair
                # Loop for that many parts, asking for part number each time
                # Checking input is only numbers, not characters
                while True:
                    try:
                        bs_numParts = int(input('How many different parts used? '))
                        break
                    except:
                        print("Invalid Input. Numbers Only. Try Again.")
                for x in range(bs_numParts):
                    while True:
                        try:
                            bs_partnumber = input('Enter Part Number: ')
                            break
                        except:
                            print("Invalid Input. Numbers Only. Try Again.")
                    # Check if part exists in stock table
                    bs_stockcheck = cur.callfunc('enterRepairParts', str,
                                                 [bs_repairno, bs_partnumber, None, True, False, False, False])
                    if bs_stockcheck == 'Pass':
                        # If previous checks have passed, check if part is already logged in repair
                        bs_partcheck = cur.callfunc('enterRepairParts', str,
                                                    [bs_repairno, bs_partnumber, None, True, True, False, False])
                        if bs_partcheck == 'Pass':
                            # If previous checks have passed, then ask for quantity of part used
                            # Checking input is only numbers, not characters
                            while True:
                                try:
                                    bs_quantity = int(input('Enter quantity: '))
                                    break
                                except:
                                    print("Invalid Input. Numbers Only. Try Again.")
                            # Check if there is enough stock of that part to cover quantity entered
                            bs_qtycheck = cur.callfunc('enterRepairParts', str, [bs_repairno, bs_partnumber,
                                                                                 bs_quantity, True, True, True, False])
                            if bs_qtycheck == 'Pass':
                                # If all checks have passed, call function to save part as being used in repair
                                partsEntered = cur.callfunc('enterRepairParts', str,
                                                            [bs_repairno, bs_partnumber, bs_quantity, True, True, True,
                                                             True])
                                print(partsEntered)
                            else:
                                # Error message about there not being enough quantity in stock
                                # sent back from function for system to print
                                print(bs_qtycheck)
                        else:
                            # Error message about part already being logged for this repair
                            # sent back from function for system to print
                            print(bs_partcheck)
                    else:
                        # Error message about this part not existing sent back from function for system to print
                        print(bs_stockcheck)
            else:
                # Error message about repair not having valid status sent back from function for system to print
                print(bs_statcheck)
        else:
            # Error message about this repair number not existing sent back from function for system to print
            print(bs_repcheck)

    # Database Error Handling
    except cx_Oracle.DatabaseError as e:
        errorObj, = e.args
        print("There was a database error")
        print("Error Code:", errorObj.code)
        print("Error Message:", errorObj.message)
    cur.close()
    con.close()
except (cx_Oracle.OperationalError, cx_Oracle.DatabaseError, cx_Oracle.InterfaceError)as e:
    errorObj, = e.args
    print("There was a database error")
    print("Error Code:", errorObj.code)
    print("Error Message:", errorObj.message)
    print('The database connection failed')
