const { Command } = require('commander');

function bootstrap() {
	const program = new Command();
	const fs = require('fs');
	program
		.name('ec-wallet')
		.description('ec-wallet cli')
		.version('0.8.0');

	//add all commands
	require('./commands/generate.js')(program);
	program.parse();
}

bootstrap();