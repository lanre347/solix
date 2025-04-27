#!/bin/bash

# Define paths to your Node.js scripts
AUTOREF_SCRIPT="node autoref.js"
MAIN_SCRIPT="node main.js"
ACCOUNTS_FILE="accounts.txt"

# Infinite loop to check the conditions and run the scripts
while true; do
    # Check if accounts.txt is empty
    if [[ ! -s $ACCOUNTS_FILE ]]; then
        echo "accounts.txt is empty. Running autoref.js..."
        # Run autoref.js if the file is empty
        $AUTOREF_SCRIPT
    else
        # Count the number of lines (accounts) in accounts.txt
        ACCOUNT_COUNT=$(wc -l < $ACCOUNTS_FILE)
        
        # Check if there are 30 accounts
        if [[ $ACCOUNT_COUNT -ge 30 ]]; then
            echo "accounts.txt has $ACCOUNT_COUNT accounts. Running main.js..."
            # Run main.js if there are 30 or more accounts
            $MAIN_SCRIPT
        else
            echo "accounts.txt has less than 30 accounts. Waiting for 5 seconds before checking again..."
        fi
    fi

    # Wait 5 seconds before checking again (you can adjust this interval as needed)
    sleep 5
done
