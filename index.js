const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const BASE_URL = "https://www.wowhead.com";
const FORUM_URL = "https://www.wowhead.com/blue-tracker/forums/eu/classes-30";

async function checkBlueTracker() {
  try {
    const { data } = await axios.get(FORUM_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);

    const first = $('a[href*="/blue-tracker/topic/"]').first();

    const title = first.attr('title') || first.text().trim();
    const link = BASE_URL + first.attr('href');

    if (!title || !link) {
      console.log("Aucun post valide");
      return;
    }

    console.log("Post trouvé :", title);

  } catch (error) {
    console.error("Erreur :", error.message);
  }
}

client.once('clientReady', async () => {
  console.log(`Connecté en tant que ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_ID);

  // 🔥 message de test obligatoire
  await channel.send("✅ Bot bien lancé sur Railway !");

  // 🔁 boucle continue (empêche arrêt)
  setInterval(checkBlueTracker, 300000);
});

process.on('unhandledRejection', error => {
  console.error('Erreur non gérée:', error);
});

client.login(TOKEN);