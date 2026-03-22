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

let lastPostLink = "";

async function checkBlueTracker() {
  try {
    const { data } = await axios.get(FORUM_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    console.log("Page récupérée");

    const $ = cheerio.load(data);

    // 🔥 sélection fiable
    const first = $('a[href*="/blue-tracker/topic/"]').first();

    const title = first.attr('title') || first.text().trim();
    const fullLink = BASE_URL + first.attr('href');

    console.log("Titre trouvé :", title);

    if (!title || !fullLink) {
      console.log("Titre ou lien invalide");
      return;
    }

    // 🔁 éviter doublons
    if (fullLink === lastPostLink) {
      console.log("Déjà envoyé");
      return;
    }

    lastPostLink = fullLink;

    const channel = await client.channels.fetch(CHANNEL_ID);

    await channel.send(
      `📢 **Blue Post Blizzard (Classes)**\n\n` +
      `**${title}**\n\n` +
      `🔗 ${fullLink}`
    );

    console.log("Message envoyé !");

  } catch (error) {
    console.error("Erreur :", error.message);
  }
}

client.once('clientReady', async () => {
  console.log(`Connecté en tant que ${client.user.tag}`);

  await checkBlueTracker();

  setInterval(checkBlueTracker, 300000);
});

process.on('unhandledRejection', error => {
  console.error('Erreur non gérée:', error);
});

client.login(TOKEN);