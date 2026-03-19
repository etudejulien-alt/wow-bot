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

    const $ = cheerio.load(data);

    const firstPost = $('.listview-row').first();
    const linkElement = firstPost.find('a').first();

    const title = linkElement.text().trim();
    const relativeLink = linkElement.attr('href');
    const fullLink = BASE_URL + relativeLink;

    if (!title.toLowerCase().includes("midnight")) {
      console.log("Post ignoré :", title);
      return;
    }

    if (fullLink !== lastPostLink) {
      lastPostLink = fullLink;

      console.log("Nouveau post :", title);

      const { data: postData } = await axios.get(fullLink, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const $$ = cheerio.load(postData);
      const content = $$('.forum-post-body').first().text().trim();

      const channel = await client.channels.fetch(CHANNEL_ID);

      const message = content.substring(0, 1800);

      await channel.send(
        `🌙 **Blue Post Blizzard - Midnight (Classes)**\n\n` +
        `**${title}**\n\n` +
        `${message}...\n\n` +
        `🔗 ${fullLink}`
      );
    }

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