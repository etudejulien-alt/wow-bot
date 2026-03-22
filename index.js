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

    const posts = $('a[href*="/blue-tracker/topic/"]');

    console.log("Nombre de posts :", posts.length);

    if (posts.length === 0) {
      console.log("Aucun post trouvé !");
      return;
    }

    const first = posts.first();

    const title = first.text().trim();
    const fullLink = BASE_URL + first.attr('href');

    console.log("Titre trouvé :", title);

    // 🔁 éviter doublons
    if (fullLink === lastPostLink) {
      console.log("Déjà envoyé");
      return;
    }

    lastPostLink = fullLink;

    const { data: postData } = await axios.get(fullLink, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $$ = cheerio.load(postData);
    const content = $$('.forum-post-body').first().text().trim();

    const channel = await client.channels.fetch(CHANNEL_ID);

    const message = content.substring(0, 1800);

    await channel.send(
      `📢 **Blue Post Blizzard (Classes)**\n\n` +
      `**${title}**\n\n` +
      `${message}...\n\n` +
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

  setInterval(checkBlueTracker, 300000); // 5 minutes
});

process.on('unhandledRejection', error => {
  console.error('Erreur non gérée:', error);
});

client.login(TOKEN);