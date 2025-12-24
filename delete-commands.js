require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('🗑️  Deleting ALL existing global commands...');
        
        // Get all global commands
        const commands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
        
        console.log(`Found ${commands.length} existing commands`);
        
        // Delete each command
        for (const command of commands) {
            await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, command.id));
            console.log(`  ✅ Deleted: ${command.name}`);
        }
        
        console.log('\n✅ All commands deleted successfully!');
        console.log('Now run: node register-commands.js');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
