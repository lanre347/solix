const fsPromises = require("fs").promises;
const path = require("path");

// --- CONSTANTS ---
const ACCOUNTS_FILE_PATH = path.resolve("accounts.txt");
const MINIMUM_POINTS_THRESHOLD = 19000.00;
const RETRY_LIMIT = 3;

// --- HELPER FUNCTIONS ---

// Log function with different types
function log(message, type = "info") {
    const logTypes = {
        info: "[INFO]",
        warning: "[WARNING]",
        success: "[SUCCESS]",
        error: "[ERROR]",
        custom: "[CUSTOM]"
    };
    console.log(`${logTypes[type]} ${message}`);
}

// Read accounts file and return a list of accounts
async function readAccountsFile() {
    try {
        const data = await fsPromises.readFile(ACCOUNTS_FILE_PATH, "utf8");
        return data.split("\n").filter(line => line.trim() !== "");
    } catch (error) {
        log(`Failed to read accounts file: ${error.message}`, "error");
        return [];
    }
}

// Write updated account list back to the accounts file
async function writeAccountsFile(updatedList) {
    try {
        await fsPromises.writeFile(ACCOUNTS_FILE_PATH, updatedList.join("\n"), "utf8");
        log("Accounts file updated successfully.", "success");
    } catch (error) {
        log(`Error writing to accounts file: ${error.message}`, "error");
    }
}

// Delete account from accounts list based on email
async function deleteAccountFromFile(email) {
    const accounts = await readAccountsFile();
    const updatedAccounts = accounts.filter(account => !account.startsWith(email));  // Remove account by email
    await writeAccountsFile(updatedAccounts);  // Write the updated accounts back to the file
    log(`Account with email ${email} deleted successfully.`, "success");
}

// --- API SIMULATION ---

// Simulate fetching user data (replace with real API logic)
async function getUserData(email, password) {
    // Simulate fetching user data; real implementation would query actual API
    let referralCode = "ABCD1234";  // Placeholder for the referral code

    return {
        success: true,
        data: {
            referralCode: referralCode,
            email: email,
            isEarning: true
        },
        status: 200,
        error: null
    };
}

// Simulate fetching balance data (replace with real API logic)
async function getBalance(email) {
    // Simulating balance with dynamic points. In reality, you would fetch this from the account system.
    let totalPointEarned = Math.random() * 20000;  // Random points for simulation between 0 and 20,000
    return {
        success: true,
        data: {
            totalPointEarned: totalPointEarned,  // Dynamically generated points
            todayPointEarned: 150.00  // Simulated today's earned points
        },
        status: 200,
        error: null
    };
}

// --- SYNC HANDLING FUNCTION ---

// Sync function for data and account management
async function handleSyncData(email, password) {
    log(`Processing account: ${email}`, "info");

    let userData = { success: true, data: null, status: 0, error: null },
        retries = 0;

    // Retry logic for fetching user data
    do {
        userData = await getUserData(email, password);
        if (userData?.success) break;
        retries++;
    } while (retries < RETRY_LIMIT && userData.status !== 400);

    // Fetch balance data
    const balanceData = await getBalance(email);

    if (userData.success && balanceData.success) {
        const { referralCode, email, isEarning } = userData.data;
        const { totalPointEarned, todayPointEarned } = balanceData.data;

        log(`Ref code: ${referralCode} | Earning today: ${todayPointEarned.toFixed(2)} | Total points: ${totalPointEarned.toFixed(2)}`, "custom");

        // Check if the total points exceed the threshold for deletion
        if (totalPointEarned >= MINIMUM_POINTS_THRESHOLD) {
            log(`Account ${email} has reached 19000 points. Deleting account...`, "success");
            await deleteAccountFromFile(email); // Delete the account from the file
        } else {
            log(`Account ${email} has not yet reached 19000 points. Skipping deletion.`, "info");
        }

    } else {
        log("Error: Can't sync new data. Skipping.", "warning");
    }

    return userData;
}

// --- BATCH HANDLING ---

// Process multiple users and handle account deletions
async function processBatchAccounts(accountList) {
    for (let i = 0; i < accountList.length; i++) {
        const [email, password] = accountList[i].split("|");  // Split the account into email and password
        log(`Processing account: ${email}`, "info");

        // Sync and handle account deletion for each account
        await handleSyncData(email, password);
    }
}

// --- MAIN PROCESS ---

// Main function to start the batch process
async function main() {
    try {
        log("Starting batch process...", "info");

        // Read all accounts from file
        const accounts = await readAccountsFile();

        if (accounts.length === 0) {
            log("No accounts found in the file. Exiting...", "warning");
            return;
        }

        // Process the list of accounts
        await processBatchAccounts(accounts);

    } catch (error) {
        log(`An error occurred: ${error.message}`, "error");
    } finally {
        log("Batch process completed.", "info");
    }
}

// --- MAIN EXECUTION ---

// Call the main function to start the process
main().catch(error => log(error.message, "error"));
