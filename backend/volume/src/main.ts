import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { PrismaService } from './services/prisma/prisma.service';
import { PrismaService } from './prisma/prisma.service';
// var cors = require('cors')




async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const prismaService = app.get(PrismaService)
	await prismaService.enableShutdownHooks(app)

	// If IP variable is set in ENV, this will add it as host.
	const server_host = "http://" + process.env["SERVER_HOST"] + ":8000" ;
	console.log("Server host: ", server_host);
	
	// Index all floor/row/seat addresses for Codam imac DNSs.
	let codam_dns: string[] = ['http://127.0.0.1:8000'];
	for (var f=0; f<2; f++)
	{
		for(var r=1; r<7; r++)
		{
			for(var s=1; s<30; s++)
			{
				const dns_for_imac = "http://f"+f+"r"+r+"s"+s+".codam.nl:8000";
				codam_dns.push(dns_for_imac);
			}
		}
	}
	
	// Allow CORS for all the above, and localhost/127.0.0.1
	let origin_array = ['http://localhost:8000', 'http://127.0.0.1:8000', server_host];
	origin_array = origin_array.concat(codam_dns);
	// console.log(origin_array);
	
	app.enableCors({
	origin: origin_array,
	//Default vals if not specified:
	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
	"preflightContinue": false,
	"optionsSuccessStatus": 204
	}
	);
	await app.listen(3000)
}
bootstrap()
