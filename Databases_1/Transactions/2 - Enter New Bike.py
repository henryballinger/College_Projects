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

    # TRANSACTION 2
    # Entering new bike model, supplier and parts. Saving new suppliers and new parts if needed.

    # Ask user if this is a new supplier
    bs_newsup = input('New Supplier? (yes/no): ')

    try:
        # Function defined first so callable, initial code beneath function
        def bs_continue():
            # Check if supplier is valid. If not, there is no point asking for the other details.
            # The user will be informed that that supplier does not exist and no time or input will be wasted.
            bs_supcheck = cur.callfunc('enterNewBike', str, [None, None, False, False, bs_supplierid, None, None,
                                                             None, None, None, None, None])
            # If supplier is valid
            if bs_supcheck == 'Pass':
                # Ask for model number, check if that model is already saved in system
                # If not, there is no point asking for the other details.
                # User will be informed and no time or input will be wasted.
                bs_modelno = input("Enter Model Number: ")
                bs_modelcheck = cur.callfunc('enterNewBike', str, [None, None, True, False, bs_supplierid, bs_modelno,
                                                                   None, None, None, None, None, None])
                # If model is not saved (i.e. new model), ask for details about bike, call function to save new bike
                if bs_modelcheck == 'Pass':
                    bs_modelname = input('Enter Model Name: ')
                    bs_frametype = input('Enter Frame Type: ')
                    bs_nogears = input('Enter Number of Gears: ')
                    bs_geartype = input('Enter Gears Type: ')
                    bs_wheelsize = input('Enter Wheel Size: ')
                    bs_brand = input('Enter Brand: ')
                    newBikeEntered = cur.callfunc('enterNewBike', str, [None, None, True, True, bs_supplierid,
                                                                        bs_modelno, bs_modelname, bs_frametype,
                                                                        bs_nogears, bs_geartype, bs_wheelsize,
                                                                        bs_brand])
                    print(newBikeEntered)
                    # Ask user how many different parts there are to save for this bike
                    # Loop for that many parts, asking for part number each time
                    # Checking input is only numbers, not characters
                    while True:
                        try:
                            bs_numparts = int(input('Number of different parts to enter: '))
                            break
                        except:
                            print("Invalid Input. Numbers Only. Try Again.")
                    for _ in range(bs_numparts):
                        while True:
                            try:
                                bs_part = int(input('Part Number: '))
                                break
                            except:
                                print("Invalid Input. Numbers Only. Try Again.")
                        # Check if that part is already logged for this bike, if so, inform user
                        bs_partcheck = cur.callfunc('newBikeParts', str,
                                                    [bs_modelno, bs_part, 0, 0, None, True, False, False, False])
                        if bs_partcheck == 'Pass':
                            # Check if part exists in stock table, ask for quantity of part in bike
                            bs_stockcheck = cur.callfunc('newBikeParts', str, [bs_modelno, bs_part, 0, 0, None, True,
                                                                               True, False, False])
                            # Checking input is only numbers, not characters
                            while True:
                                try:
                                    bs_qty = int(input('Quantity In Bike: '))
                                    break
                                except:
                                    print("Invalid Input. Numbers Only. Try Again.")
                            # If part exists, call function to save part and quantity to bike model
                            if bs_stockcheck == 'Pass':
                                newPartsEntry = cur.callfunc('newBikeParts', str, [bs_modelno, bs_part, None, bs_qty,
                                                                                   None, True, True, True, False])
                                print(newPartsEntry)
                            # If new part, ask for more details, save to stock table and save part and quantity in bike
                            else:
                                bs_ispartof = input('Is Part Of? Hit Enter if none: ')
                                bs_partname = input('Part Name: ')
                                newPartsEntry = cur.callfunc('newBikeParts', str, [bs_modelno, bs_part, bs_ispartof,
                                                                                   bs_qty, bs_partname, True, True,
                                                                                   True, True])
                                print(newPartsEntry)
                        else:
                            # Error message about part already being saved in this bike model
                            # will be sent back from function for system to print
                            print(bs_partcheck)
                else:
                    # Error message about model already being saved will be sent back from function for system to print
                    print(bs_modelcheck)
            else:
                # Error message about supplier not being valid will be sent back from function for system to print
                print(bs_supcheck)

        # If new supplier, ask for supplier name and address, call function to create new supplier
        #   Assign supplierid to be that of newly created supplier
        # If not new supplier, ask user for supplier id
        #  Continue with adding bike
        # If not yes or no, tell user input is invalid
        if bs_newsup == 'yes':
            bs_supname = input('Enter Supplier Name: ')
            bs_supaddress = input('Enter Supplier Address: ')
            supplierAdd = cur.callfunc('newSupplier', str, [bs_supname, bs_supaddress])
            print(supplierAdd)
            bs_supplierid = cur.callfunc('getSupplierId', int)
            bs_continue()
        elif bs_newsup == 'no':
            # Checking input is only numbers, not characters
            while True:
                try:
                    bs_supplierid = int(input('Enter Supplier ID: '))
                    break
                except:
                    print("Invalid Input. Numbers Only. Try Again.")
            bs_continue()
        else:
            print('Not valid input')

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
