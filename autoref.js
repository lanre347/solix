const fs = require("fs");
const readline = require("readline");
const { sovleCaptcha } = require("./captcha");
const settings = require("./config/config");
const axios = require("axios");
const colors = require("colors");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { loadData, saveJson, sleep } = require("./utils");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function register(email, password, proxy) {
  const captchaToken = await sovleCaptcha();
  if (!captchaToken) {
    console.error("Failed to solve CAPTCHA.");
    return;
  }
  const payload = {
    email: email,
    password: password,
    captchaToken,
    referralCode: settings.REF_CODE || null,
  };
  let proxyAgent = null;
  if (settings.USE_PROXY && proxy) {
    try {
      const proxyIP = await checkProxyIP(proxy);
      console.log("Proxy IP: ".green, proxyIP);
      proxyAgent = new HttpsProxyAgent(proxy);
    } catch (error) {
      console.error("Error checking proxy IP:".red, error.message);
    }
  }

  try {
    const response = await axios.post("https://api.solixdepin.net/api/auth/register", payload, {
      headers: {
        Accept: "*/*",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "none",
        origin: "https://dashboard.solixdepin.net",
        referer: "https://dashboard.solixdepin.net/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      },
      timeout: 120000,
      ...(proxyAgent ? { httpsAgent: proxyAgent, httpAgent: proxyAgent } : {}),
    });
    console.log("Response:".green, response.data);
    if (response.data?.result == "success") {
      console.log(`Registration successful! | Added account ${email} into accounts.txt`.green);
      fs.appendFileSync("accounts.txt", `\n${email}|${password}`);
      // localStorage[email] = response.data;
      // await saveJson(email, JSON.stringify(response.data.data), "localStorage.json");
    } else {
      console.error("Registration failed:".yellow, response.data);
    }
  } catch (error) {
    // console.log(error.response.data);
    if (error?.status == 400) {
      console.error("Error:".red, `Maybe email ${email} already exists!`);
    }
    console.error("Error during registration:".red, error.message);
  }
}

async function checkProxyIP(proxy) {
  try {
    const proxyAgent = new HttpsProxyAgent(proxy);
    const response = await axios.get("https://api.ipify.org?format=json", { httpsAgent: proxyAgent });
    if (response.status === 200) {
      return response.data.ip;
    } else {
      throw new Error(`Cannot check proxy IP. Status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Error checking proxy IP: ${error.message}`);
  }
}

async function main() {
  console.log(colors.yellow("Tool được phát triển bởi nhóm tele Airdrop Hunter Siêu Tốc (https://t.me/airdrophuntersieutoc)"));

  const accounts = loadData("register.txt");
  const proxies = loadData("proxy.txt");

  for (let i = 0; i < accounts.length; i++) {
    const [email, password] = accounts[i].split("|");
    const proxy = proxies[i];
    console.log(`[${i}/${accounts.length}] Processing account:`.blue, email);
    await register(email, password, proxy);
    console.log("\n=====================\n".blue);
  }
  console.log("All accounts processed.".green);
}

// Bắt đầu chương trình
(async () => {
  await main();
  await sleep(1);
  process.exit(0);
})();
