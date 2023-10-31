import { createClient } from '@vercel/postgres';
import microCors from 'micro-cors';

const cors = microCors({
  origin: 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Requested-With', 'Accept']
});

async function handler(request: any, response: any) {
  const client = createClient();
  await client.connect();

  try { 
    switch (request.method) {
      case 'POST': {
        const { publicAddress, userInfo } = JSON.parse(request.body);
        if (!publicAddress || !userInfo) {
          return response.status(400).send('publicAddress and userInfo are required');
        }

        const result = await client.sql`
          INSERT INTO public_addresses (address, userinfo) 
          VALUES (${publicAddress}, ${JSON.stringify(userInfo)})
          RETURNING id
        `;
      
        response.status(200).json(result.rows);

        break;
      }
      case 'GET': {
        const result = await client.sql`SELECT userinfo FROM public_addresses where address = ${request.query.publicAddress} LIMIT 1;`;
    
        const userInfos = result.rows.map(row => row.userinfo);
        response.status(200).json(userInfos);

        break;
      }
      default:
        return response.status(404)
    }
    
  } catch (e) {
    response.status(500).json(e);
  } finally {
    await client.end();
  }
}

function wrappedHandler(req: any, res: any) {
  if (process.env.VERCEL_ENV !== 'production') {
    return cors(handler)(req, res);
  } else {
    return handler(req, res);
  }
}

export default wrappedHandler;