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

    # TRANSACTION 4.2
    # Entering parts used in repair
    # Extension of Transaction 4
    # Existing as a separate transaction in case extra parts want to be entered for an existing repair.

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
        bs_repcheck = cur.callfunc('enterRepairParts', str, [bs_repairno, None, None, False, False, False, False])
        # If repair exists
        if bs_repcheck == 'Pass':
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
                # Checking input is only numbers, not characters
                while True:
                    try:
                        bs_partnumber = int(input('Enter Part Number: '))
                        break
                    except:
                        print("Invalid Input. Numbers Only. Try Again.")
                # Check if that part exists in the stock table
                bs_stockcheck = cur.callfunc('enterRepairParts', str,
                                             [bs_repairno, bs_partnumber, None, True, False, False, False])
                # If part exists in stock table, check if part is already logged in repair
                if bs_stockcheck == 'Pass':
                    bs_partcheck = cur.callfunc('enterRepairParts', str,
                                                [bs_repairno, bs_partnumber, None, True, True, False, False])
                    # If this is a new part being added to repair, ask for quantity
                    if bs_partcheck == 'Pass':
                        # Checking input is only numbers, not characters
                        while True:
                            try:
                                bs_quantity = int(input('Enter quantity used: '))
                                break
                            except:
                                print("Invalid Input. Numbers Only. Try Again.")
                        # Check if there is enough stock for entered quantity
                        bs_qtycheck = cur.callfunc('enterRepairParts', str,
                                                   [bs_repairno, bs_partnumber, bs_quantity, True, True, True, False])
                        # If enough stock, save part and quantity being used in repair
                        if bs_qtycheck == 'Pass':
                            partsEntered = cur.callfunc('enterRepairParts', str,
                                                        [bs_repairno, bs_partnumber, bs_quantity, True, True, True,
                                                         True])
                            print(partsEntered)
                        else:
                            # Error message about not enough quantity sent back from function for system to print
                            print(bs_qtycheck)
                    else:
                        # Error message about part already being logged for this repair
                        # sent back from function for system to print
                        print(bs_partcheck)
                else:
                    # Error message about this part not existing in records sent back from function for system to print
                    print(bs_stockcheck)
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
