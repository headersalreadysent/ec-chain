
const { generateKeyPairSync, createPublicKey, sign, constants, verify } = require('crypto');
const keccak256 = require('keccak256')
const fs = require('fs')
const chalk = require('chalk');

module.exports = (program) => {

	program.command('generate')
		.description('Generate a wallet public and private keys')
		.option('-s, --key-size <type>', 'Modules length')
		.option('-o, --output <name>', 'Output file name')
		.action((options) => {
			options = Object.assign({
				keySize: 2048,
				output: 'wallet.json'
			}, options)
			try {
				//generate keys
				let { publicKey, privateKey } = generateKeyPairSync('rsa', {
					modulusLength: parseInt(options.keySize),
					publicKeyEncoding: {
						type: 'spki',
						format: 'pem'
					},
					privateKeyEncoding: {
						type: 'pkcs8',
						format: 'pem',
					}
				})

				//generate wallet id
				let wallet = keccak256(publicKey).toString('hex');

				//generate random data to verify
				const verifyData = Buffer.from(Array(5).fill('').map(i => Math.random().toString(32).slice(3)).join(''));
				//generate signature with private
				const signature = sign("sha256", verifyData, {
					key: privateKey,
					padding: constants.RSA_PKCS1_PSS_PADDING,
				});
				//verify it with public
				let isVerified = verify("sha256", verifyData, {
					key: publicKey,
					padding: constants.RSA_PKCS1_PSS_PADDING,
				}, signature);

				if (isVerified) {
					//if data verified it works
					if (!options.output.endsWith('.json')) {
						//add json
						options.output = options.output + '.json'
					}
					//generate object
					var resultJson = {
						date: new Date(),
						wallet: wallet,
						publicKey: publicKey.replace(/-----[A-Z ]*-----/ig, '').trim(),
						privateKey: privateKey.replace(/-----[A-Z ]*-----/ig, '').trim()
					}
					//output to file
					fs.writeFileSync('./' + options.output, JSON.stringify(resultJson, null, 4))
					//tell to user
					console.log(chalk.green.bold(`Wallet Generated and saved to '${options.output}' file.`))
					console.log(chalk.blue(`${JSON.stringify(resultJson, null, 4)}`))

				} else {
					//warn
					console.log(chalk.red.bold("Generated random test value cant be verified. Try again :("))
				}
			} catch (error) {
				//tell error
				console.log(chalk.red.bold(`ERROR
${error.message}`))
			}

		});
}