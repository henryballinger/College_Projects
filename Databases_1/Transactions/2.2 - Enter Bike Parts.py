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

    # TRANSACTION 2.2
    # Entering new parts for bikes. Saving new parts if needed.
    # Extension of Transaction 2
    # Existing as a separate transaction in case extra parts want to be entered for an existing bike

    # Ask user for model number
    bs_model = input('Bike Model Number: ')

    try:
        # Check if model exists in system
        # If not, there is no point asking for the other details.
        # User will be informed and no time or input will be wasted.
        bs_modelcheck = cur.callfunc('newBikeParts', str, [bs_model, 0, 0, 0, None, False, False, False, False])
        # If model exists
        if bs_modelcheck == 'Pass':
            # Ask user how many different parts there are to save for this bike
            # Loop for that many parts, asking for part number each time
            # Checking input is only numbers, not characters
            while True:
                try:
                    bs_numparts = int(input('Number of parts to enter: '))
                    break
                except:
                    print("Invalid Input. Numbers Only. Try Again.")
            for x in range(bs_numparts):
                while True:
                    try:
                        bs_part = int(input('Part Number: '))
                        break
                    except:
                        print("Invalid Input. Numbers Only. Try Again.")
                # Check if that part is already logged for this bike
                bs_partcheck = cur.callfunc('newBikeParts', str,
                                            [bs_model, bs_part, 0, 0, 'null', True, False, False, False])
                if bs_partcheck == 'Pass':
                    # Check if part exists in stock table
                    bs_stockcheck = cur.callfunc('newBikeParts', str,
                                                 [bs_model, bs_part, 0, 0, 'null', True, True, False, False])
                    # If in stock table, ask for quantity and log part as being used in bike
                    if bs_stockcheck == 'Pass':
                        while True:
                            try:
                                bs_qty = int(input('Quantity In Bike: '))
                                break
                            except:
                                print("Invalid Input. Numbers Only. Try Again.")
                        newPartsEntry = cur.callfunc('newBikeParts', str, [bs_model, bs_part, None, bs_qty, None,
                                                                           True, True, True, False])
                        print(newPartsEntry)
                    # If not in stock table, ask for quantity and more details about part
                    # Log part as being used in bike
                    # Save part in stock table
                    else:
                        while True:
                            try:
                                bs_qty = int(input('Quantity In Bike: '))
                                break
                            except:
                                print("Invalid Input. Numbers Only. Try Again.")
                        bs_ispartof = input('Is Part Of? Hit Enter if none: ')
                        bs_partname = input('Part Name: ')
                        newPartsEntry = cur.callfunc('newBikeParts', str, [bs_model, bs_part, bs_ispartof, bs_qty,
                                                                           bs_partname, True, True, True, True])
                        print(newPartsEntry)
                else:
                    # Error message about part already being saved in this bike model
                    # will be sent back from function for system to print
                    print(bs_partcheck)
        else:
            # Error message about model not existing will be sent back from function for system to print
            print(bs_modelcheck)

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
