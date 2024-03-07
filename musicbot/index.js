import { config } from 'dotenv';
import { REST, Routes, SlashCommandBuilder, ChannelType, } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import play from 'play-dl';
import { Player } from 'discord-player';
config();
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = "client_id";
const GUILD_ID ="guild_id";
let a=[];
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}


const rest = new REST({ version: '10' }).setToken(TOKEN);
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildVoiceStates,
]
 });
 play.authorization()
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("messageCreate", (message) =>{
  console.log(message.content);
});
client.login(TOKEN);
let player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play
  }
})
let con=0;
let i=0;
player.on(AudioPlayerStatus.Playing,(oldstate,newstate)=>{
  console.log("playing");
});
player.on(AudioPlayerStatus.Idle,(oldstate,newstate)=>{
  if (i<a.length) {
    player.play(a[i]);
    i=i+1;
  }
  if (i==a.length) {
    stopNoMes(player);
  }
});
function stopNoMes(player){
    a=[];
    i=0;
    con=0;
    player.stop(true)
}
function stop1(player){
    a=[];
    i=0;
    con=0;
    player.stop(true);
}
function skip(player){
    if (i<a.length) {
       player.stop(true);
    }
    else if(i+1>=a.length){
      message.content='!stop';
      stop1(player);
    }
}
function pause(player){
    player.pause(true);
}
function unpause(player){
    player.unpause(true);
}
async function main(){
  try{
    console.log('Started refreshing application (/) commands.');    
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      {
        body: [
          new SlashCommandBuilder()
            .setName('play')
            .setDescription('Plays a song')
            .addStringOption(option =>
              option.setName('song')
              .setDescription('The song to play')
              .setRequired(true)),
          new SlashCommandBuilder()
            .setName('stop')
            .setDescription('Stops the song'),
          new SlashCommandBuilder()
            .setName('skip')
            .setDescription('Skips the song'),
          new SlashCommandBuilder()
            .setName('pause')
            .setDescription('Pauses the song'),
          new SlashCommandBuilder()
            .setName('unpause')
            .setDescription('Unpauses the song'),
          new SlashCommandBuilder()
            .setName('addq')
            .setDescription('Adds a song to the queue')
            .addStringOption(option =>
              option.setName('song')
              .setDescription('The song to add')
              .setRequired(true)),
          new SlashCommandBuilder()
            .setName('addl')
            .setDescription('Adds a playlist to the queue')
            .addStringOption(option =>
              option.setName('playlist')
              .setDescription('The playlist to add')
              .setRequired(true)),
          new SlashCommandBuilder()
            .setName('shuffle')
            .setDescription('Shuffles the queue'),
          new SlashCommandBuilder()
            .setName('play1')
            .setDescription('Plays the first song in the queue'),
        ],
      },
    );
  }catch(err){
console.log(err)
  }
}
function joinVoice(interaction){
  if (!interaction.member.voice?.channel) return interaction.channel.send('Connect to a Voice Channel')
    const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    })

    return connection;
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  if (commandName === 'play') {
    
    const song = interaction.options.getString('song').toString();
    interaction.reply(`Playing ${song}`);
    
    
    console.log(interaction)
    let yt_info = await play.search(song, {
        limit: 1
    })
    let stream = await play.stream(yt_info[0].url)
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })
    a.push(resource);
    if (con===0) {
      player.play(a[i]);
      con=con+1;
      i++
    }
    joinVoice(interaction).subscribe(player);
  }
  if (commandName === 'stop') {
    interaction.reply('Stopped the song');
    stop1(player);
  }
  if (commandName === 'skip') {
    interaction.reply('Skipped the song');
    skip(player)
  }
  if (commandName === 'pause') {
    interaction.reply('Paused the song');
    pause(player);
  }
  if (commandName === 'unpause') {
    interaction.reply('Unpaused the song');
    unpause(player);
  }
  if (commandName === 'addq') {
    const song = interaction.options.getString('song');
    interaction.reply(`Added ${song} to the queue`);
    if (!interaction.member.voice?.channel) return interaction.channel.send('Connect to a Voice Channel')
      let yt_info = await play.search(song, {
          limit: 1
      })
      let stream = await play.stream(yt_info[0].url)
      let resource = createAudioResource(stream.stream, {
          inputType: stream.type
      })
      a.push(resource);
  }
  if (commandName === 'addl') {
    const playlist1 = interaction.options.getString('playlist');
    interaction.reply(`Added ${playlist1} to the queue`);
    if (!interaction.member.voice?.channel) return interaction.channel.send('Connect to a Voice Channel')
      let playlist = await play.playlist_info(playlist1);
      let videos = await playlist.all_videos();
      for (let index = 0; index < videos.length; index++) {
        let stream = await play.stream(videos[index].url)
      let resource =  createAudioResource(stream.stream, {
          inputType: stream.type,
      })
      a.push(resource);
      } 
      joinVoice(interaction).subscribe(player);
      player.play(a[0]);
  }
  if (commandName === 'shuffle') {
    interaction.reply('Shuffled the queue');
    shuffle(a);
  }
  if (commandName === 'playStart') {
    interaction.reply('Playing the first song in the queue');
    player.play(a[0]);
  }
});
main();

