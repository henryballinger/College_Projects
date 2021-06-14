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

    # TRANSACTION 1
    # Entering new repair. Saving new customer if needed.

    # Ask user for bike model number
    bs_model = input("Bike Model Number: ")

    try:
        # Pass just model number to check if that model is serviced by the shop,
        # if not, there is no point asking for the other details.
        # The user will be informed that that model is not serviced and no time or input will be wasted.
        bs_modelcheck = cur.callfunc('repairEntry', str, [None, None, bs_model, None, None, False])
        if bs_modelcheck == 'Pass':
            # If model check has passed, ask for rest of customer and bike details,
            # then pass to function to enter into database
            bs_name = input("Customer Full Name: ")
            # Checking input is only numbers, not characters
            while True:
                try:
                    bs_number = int(input("Customer Contact Number: "))
                    break
                except:
                    print("Invalid Input. Numbers Only. Try Again.")
            while True:
                try:
                    bs_serial = int(input("Bike Serial Number: "))
                    break
                except:
                    print("Invalid Input. Numbers Only. Try Again.")
            bs_descr = input("Service Description: ")
            repairEntry = cur.callfunc('repairEntry', str, [bs_name, bs_number, bs_model, bs_serial, bs_descr, True])
            print(repairEntry)
        else:
            # Error message about model not being serviced will be sent back from function for system to print.
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
