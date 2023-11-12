import { createClient } from '@vercel/postgres';

export default async function handler(request: any, response: any) {
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
          ON CONFLICT (address) 
          DO UPDATE SET 
            userinfo = EXCLUDED.userinfo,
            updated = NOW()
          RETURNING id
        `;

        response.status(200).json(result.rows);

        break;
      }
      case 'GET': {
        if(request.query.publicAddress) {
          const result = await client.sql`SELECT userinfo FROM public_addresses where address = ${request.query.publicAddress} LIMIT 1;`;

          const userInfos = result.rows.map(row => row.userinfo);
          response.status(200).json(userInfos);

          break;
        } else {
          const result = await client.sql`SELECT address, userinfo FROM public_addresses;`;

          const rows = result.rows.map(row => row);
          response.status(200).json(rows);

          break;
        }
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
