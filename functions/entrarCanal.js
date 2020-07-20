exports.enterChannels = async function enterChannels(client, channel_list) {
    channel_list["channels"].forEach(async channel => {
        if (channel == "texugote") return;
        let mods = await client.mods(channel);
        if (!mods.includes('texugote')) {
            client.say(channel, `Eu não sou mod no seu canal, para eu funcionar direito me dê Mod. Comando: '/mod @texugote'`);
            console.log(`[enterChannels] Texugote não é Mod em ${channel} `);
        }
        client.join(channel).then(() => {
            console.log(`[enterChannels] Conectado ao canal #${channel}`);
        }).catch((err) => {
            console.log(err);
        })
    });

}