import { CommandInteraction, SlashCommandBuilder } from "discord.js";
export let channelID = ""
export const data = new SlashCommandBuilder()
    .setName("setup")
    .setDescription("setup the bot!");

export async function execute(interaction: CommandInteraction) {
    channelID = interaction.channelId
    return interaction.reply("Setup!");
}

