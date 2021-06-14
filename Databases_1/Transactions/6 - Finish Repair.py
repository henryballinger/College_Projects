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

    # TRANSACTION 6
    # Closing repair by changing status to 'F'

    # Ask user for repair number and serial number of bike
    # Checking input is only numbers, not characters
    while True:
        try:
            bs_repairno = int(input('Enter Repair Number: '))
            break
        except:
            print("Invalid Input. Numbers Only. Try Again.")

    try:
        # Call function passing repair number, print result
        finishRepair = cur.callfunc('finishRepair', str, [bs_repairno])
        print(finishRepair)

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
