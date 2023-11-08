import Irys from "@irys/sdk";
import { UploadResponse } from "@irys/sdk/build/cjs/common/types";
import multer from 'multer';
import { PassThrough } from 'stream';


const getIrys = async () => {
  const irys = new Irys({
    url: "https://node2.irys.xyz",
    token: "matic",
    key: "ec61deb8b4e80fe30318023384d72e0603071af761c5f91d8968d31d2d74736f"
  });

  return irys;
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('contentFiles');

export default async function handler(
  request: any,
  response: any,
) {
  try {
    await upload(request, response, async (err) => {
      if (err) {
        return response.json({ error: err.message });
      }

      const irys = await getIrys();

      console.log("Attempting to upload fundraiser: " + request.body.contentTextTitle);

      const contentText = {
        tt: request.body.contentTextTitle,
        tb: request.body.contentTextBody
      }

      const textReceipt = await irys.upload(JSON.stringify(contentText));
      console.log(`Text uploaded ==> https://gateway.irys.xyz/${textReceipt.id}`);

      let res: {
        textContent: UploadResponse | undefined,
        filesContent?: UploadResponse[]
      } = { textContent: textReceipt };

      if (request.files && request.files.length > 0) {
        res.filesContent = [];
        for (let file of request.files) {
          const fileStream = new PassThrough();
          fileStream.end(file.buffer);

          console.log("Attempting to upload file: " + file.originalname);
          const fileReceipt = await irys.upload(fileStream);
          console.log(`File uploaded ==> https://gateway.irys.xyz/${fileReceipt.id}`);
          res.filesContent.push(fileReceipt);
        }
      }

      response.json(res);
    });
  } catch (e) {
    response.json(e);
  }
}
