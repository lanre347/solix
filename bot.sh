#!/bin/bash

# Define the command to run your Node.js script
NODE_SCRIPT="node main2.js"

while true; do
    # Start the Node.js script in the background
    echo "Starting the Node.js script..."
    $NODE_SCRIPT &  
    NODE_PID=$!  # Get the Node.js process ID

    echo "Node.js script started with PID: $NODE_PID"

    # Sleep for 10 seconds before restarting the process
    sleep 5  # Adjust the sleep time as needed

    # Kill the existing Node.js process after the 10 seconds
    echo "Restarting the Node.js script..."
    kill $NODE_PID  # Kill the current Node.js process
done
