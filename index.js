const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const parser = new Parser();

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// 🔥 RSS officiel Blue Tracker
const RSS_URL = "https://eu.forums.blizzard.com/en/wow/c/development/blue-tracker.rss";

let lastLink = "";

async function checkBluePosts() {
  try {
    const feed = await parser.parseURL(RSS_URL);

    for (const post of feed.items.slice(0, 5)) {
      const title = post.title.toLowerCase();
      const content = (post.contentSnippet || "").toLowerCase();

      // 🎯 filtre Midnight
      if (!title.includes("midnight") && !content.includes("midnight")) {
        continue;
      }

      if (post.link === lastLink) continue;

      lastLink = post.link;

      const channel = await client.channels.fetch(CHANNEL_ID);

      await channel.send(
        `🌙 **Blue Post - Midnight**\n\n` +
        `**${post.title}**\n\n` +
        `🔗 ${post.link}`
      );

      console.log("Posté :", post.title);
      break;
    }

  } catch (error) {
    console.error("Erreur :", error.message);
  }
}

client.once('clientReady', async () => {
  console.log(`Connecté en tant que ${client.user.tag}`);

  await checkBluePosts();

  setInterval(checkBluePosts, 300000); // toutes les 5 min
});

client.login(TOKEN);