const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

const TOKEN =  process.env.TOKEN;

// prefix
const PREFIX = "t!";

// cooldown storage
const cooldowns = new Map();

const prompts = [
  "What's your favorite movie?",
  "If you could travel anywhere, where would you go?",
  "What's your dream job?",
  "What do you do in your free time?",
  "What's your comfort food?"
];

client.on("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ignore messages without prefix
  if (!message.content.startsWith(PREFIX)) return;

  const command = message.content.slice(PREFIX.length).toLowerCase();

  // ================= HELP COMMAND =================
  if (command === "help") {
    return message.reply(`
🤖 **Tomo Bot Commands**

💬 \`t!match\` → Find a random user to chat with  
⏳ Cooldown → 1 minute  
📖 \`t!help\` → Show all commands  

Have fun connecting! ✨
    `);
  }

  // ================= MATCH COMMAND =================
  if (command === "match") {

    // cooldown
    const now = Date.now();
    const cooldownTime = 60 * 1000;

    if (cooldowns.has(message.author.id)) {
      const expiration = cooldowns.get(message.author.id) + cooldownTime;

      if (now < expiration) {
        return message.reply("You can match again after 1 min ⏳");
      }
    }

    cooldowns.set(message.author.id, now);

    const guild = message.guild;
    const members = await guild.members.fetch();

    const onlineMembers = members.filter(member =>
      member.presence &&
      member.presence.status !== "offline" &&
      member.id !== message.author.id &&
      !member.user.bot
    );

    if (onlineMembers.size === 0) {
      return message.reply("No online users available right now 😢");
    }

    const randomUser = onlineMembers.random();

    const prompt =
      prompts[Math.floor(Math.random() * prompts.length)];

    message.channel.send(
      `🎉 <@${message.author.id}> 🤝 <@${randomUser.id}> you are matched!\n💬 Prompt: ${prompt}`
    );
  }
});

client.login(TOKEN);