// Henry Ballinger McFarlane - C14489558

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include "Practical.h"

// Maximum outstanding connection requests
static const int MAXPENDING = 5;

int main(int argc, char *argv[]) {
	// Buffer for receiving data from client
	char recvbuffer[BUFSIZE];
	// Buffer for sending data to the client
	// This will contain the "Proceed, Denied or Attempts Left" message
	char sendbuffer[BUFSIZE];
	// Delimiter for splitting incoming data stream into username and password
	char delim[] = " \n";
	// Chars for storing correct username and password, for testing against incoming data
	char corrusername[] = "admin";
	char corrpassword[] = "pass";
	// Assign integers for checking username and password are correct or incorrect
	int usercorrect = 0;
	int passcorrect = 0;
	// Assign variable for checking number of incoming bytes
	int numBytes = 0;

	// Test for correct number of arguments, if not, inform that port number for server was not supplied and end
	if (argc != 2) {
		DieWithUserMessage("Parameter(s)", "<Server Port>");
	}

	// First argument is the local port, assign to variable
	in_port_t servPort = atoi(argv[1]);

	/* Create socket for incoming connections */
	// Socket descriptor for server
	int servSock;
	// Establish and test socket connection. If fail, inform that socket() failed and end
	if ((servSock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)) < 0) {
		DieWithSystemMessage("socket() failed");
	}

	/* Construct local address structure */
	// Local address
	struct sockaddr_in servAddr;
	// Zero out structure
	memset(&servAddr, 0, sizeof(servAddr));
	// IPv4 address
	servAddr.sin_family = AF_INET;
	// Any incoming interface
	servAddr.sin_addr.s_addr = htonl(INADDR_ANY);
	// Local port
	servAddr.sin_port = htons(servPort);

	// Bind to local address and test, inform if failure and end
	if (bind(servSock, (struct sockaddr*) &servAddr, sizeof(servAddr)) < 0) {
		DieWithSystemMessage("bind() failed");
	}

	// Listen on server socket for incoming connections and test, inform if failure and end
	if (listen(servSock, MAXPENDING) < 0) {
		DieWithSystemMessage("listen() failed");
	}

	// Infinte loop
	for(;;) {
		// Wait for a client to connect, assign to variable to check
		int clientSock = accept(servSock, (struct sockaddr *) NULL, NULL);

		// If no client socket established, inform of failure and end
		if (clientSock < 0) {
			DieWithSystemMessage("accept() failed");
		}

		// Variable for number of login attempts remaining
		// Declared and assigned here to allow for multiple user logins without needing to restart server
		// i.e. if user has succesfully logged in, client program can be restarted and login attempts can be made, without needing to restart server
		int attemptsRemaining = 3;

		// While incoming message length is greater than 0
		while ((numBytes = recv(clientSock, recvbuffer, BUFSIZE - 1, 0)) > 0) {
			// Assign null to end of recieve buffer
			recvbuffer[numBytes] = '\0';

			// Split incoming buffer using strtok on the predefined delimiter (in this case, a space and newline " \n"),
			// This will determine the username and the password from the incoming data stream
			// As strtok modifies the orginial string, it will put NULL characters at the delimiter position when it is called
			// This means that strtok remembers the next token's starting position and tokens can be tracked.
			// Therefore, when we call strtok the second time, we pass NULL as the first parameter so strtok knows to split the string from the next token's starting position
			char *ptr = strtok(recvbuffer, delim);

			// Print username on server side for visual confirmation
			// This should not be done on a deployed live system, but for this case, allowed for demonstrating purposes
			printf("\nUsername: %s\n", ptr);

			// Use strcmp to check if username received from client matches variable holding correct username
			// Use strcmp as it will check for an exact match, which is what we need for checking login credentials. strcmp will return 0 if strings are a match
			// If so, set usercorrect variable to 1, to indicate True, othewise usercorrect variable will remain at 0, to indicate False
			if (strcmp(corrusername, ptr) == 0) {
				usercorrect = 1;
			}

			// Get next token from incoming buffer, which will be the password. Calling second time, so passing NULL (as mentioned above)
			ptr = strtok(NULL, delim);
			// Print password on server side for visual confirmation
			// This should not be done on a deployed live system, but for this case, allowed for demonstrating purposes
			printf("\nPassword: %s\n", ptr);

			// Use strcmp to check if password received from client matches variable holding correct password
			// // Use strcmp as it will check for an exact match, which is what we need for checking login credentials. strcmp will return 0 if strings are a match
			// Set passcorrect variable to 1, to indicate True, othewise passcorrect variable will remain at 0, to indicate False
			if (strcmp(corrpassword, ptr) == 0) {
				passcorrect = 1;
			}

			// Check if both usercorrect and passcorrect variables are equal to one, indicating that both username and password values are correct and user may proceed
			if (usercorrect == 1 && passcorrect == 1) {
				// Using sprintf, assign "PROCEED\r\n" to the message being passed back to the client, to indicate entry to system is granted
				// '\r\n' being passed as this is the break point on the client side. i.e. how it knows this is the end of the message to interpret.
				sprintf(sendbuffer, "PROCEED\r\n");

				// Print message on server side indicating correct username and password entered and proceeding past authentication
				printf("\nMessage sent to client: %s", sendbuffer);

				// Reset username and password checking variables for next authentication
				usercorrect = 0;
				passcorrect = 0;
			} // End if
			// Else will catch when eiter username or password, or both values are incorrect
			else {
				// Print message on server side indicating incorrect details entered
				printf("\nINCORRECT DETAILS\n\n");
				// Decrement attempts remaining to keep track of how many times user has tried to entered details
				attemptsRemaining = attemptsRemaining - 1;

				// Check if user has not used all available attempts
				if (attemptsRemaining != 0) {
					// If user still has attempts remaining
					// Using sprintf, assign number of attempts remaining to the message being passed back to the client, to indicate to them number remaining
					sprintf(sendbuffer, "You have %d attempt(s) remaining\r\n", attemptsRemaining);
   				} // End if
   				// Else will catch when user has used all of their attempts
   				else {
   					// Once user has used their three attempts, using sprintf, assign "DENIED\r\n" to the message being passed back to the client, to indicate entry to system is denied
   					sprintf(sendbuffer, "DENIED\r\n");

   					// Print message on server side indicating all attempts used and entry to system denied
   					printf("\nMessage sent to client: %s", sendbuffer);
   				} // End else
			} // End else

			// Send message (sendbuffer) back to client using send through client socket, saving the number of bytes sent to check if succesful
			ssize_t numBytesSent = send(clientSock, sendbuffer, strlen(sendbuffer), 0);
			
			// Check if sending of message to client was not successful, inform of failure if not and end
			if (numBytesSent < 0) {
				DieWithSystemMessage("send() failed");
			}

			// Check for end of incoming data in received buffer, break if found
			// Using strstr to check if \r\n\r\n is anywhere in received message
			if (strstr(recvbuffer, "\r\n\r\n") > 0) {
				break;
			}
		} // End while loop

		// Check if anything received from client, inform of failure if not and end
		if (numBytes < 0) {
			DieWithSystemMessage("recv() failed");
		}

		// Close client socket
		close(clientSock);
	} // End infinite for loop
}
