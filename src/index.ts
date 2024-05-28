import { Client, Colors, GatewayIntentBits, Message, TextChannel } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { CronJob } from 'cron';
import { channelID } from './commands/setup'
const fs = require('fs');
let unique = true
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

function isInFile(url: string): boolean {
  let repa = false;

  const data = fs.readFileSync('history.txt', 'utf8', (err: any, data: any) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier:', err);
      return false;
    }
  });

  const urls = data.split('\n').filter(Boolean); // Filtrer pour éviter les lignes vides
  if (urls.includes(url)) {
    repa = true;
  }
  console.log(repa)
  return repa;
  
}

const job = new CronJob(
  '30 18 * * *', // cronTime
  async function () {
    if (!unique) return
    console.log("groscron");
    const data = await fetch("http://api.mediastack.com/v1/news?access_key=3ad38567325109e7388c44f22f338b91&countries=fr&categories=politics,general")
    const json = await data.json();
    let rep: string = "";
    let g: boolean = false
    let p: boolean = false
    json.data.every((article: any) => {
      if (!g && article?.category === "general") {

        if (!isInFile(article?.url)) {

          g = true
          rep += article?.url + ' '
          fs.appendFileSync('history.txt', article?.url + '\n')
        }
      }
      if (!p && article?.category === "politics") {

        if (!isInFile(article?.url)) {

          p = true
          rep += article?.url + ' '
          fs.appendFileSync('history.txt', article?.url + '\n')
        }

      }
      if (p && g) {
        return false
      }
      return true
    }

    )
    
    if (client && channelID) {

      (client.channels.cache.get(channelID) as TextChannel)?.send(rep)
    }



  }, // onTick
  null, // onComplete
  true, // start
  'Europe/Paris' // timeZone
);


client.once("ready", () => {
  console.log("Discord bot is ready! 🤖");
});

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.on("messageCreate", async (message: Message<boolean>) => {
  console.log(message.content)

  if (message.content === ".debug") {
    if (!(message.author.id === "363364672851673089")) return;

    await deployCommands({ guildId: message.guild?.id! });
    await message.reply("Reloaded slash commands");
  }
}
)


client.login(config.DISCORD_TOKEN);
