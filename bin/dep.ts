const ver = Deno.version.deno
const majorVer = parseInt(ver.split('.')[0])

if (majorVer < 1) {
	console.error('Deno version ' + ver + ' is not supported, please use Deno 1.0.0 or higher.')
	Deno.exit(1)
}
else {
	import('../lib/cli.ts')
}
