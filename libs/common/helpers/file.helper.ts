import { Transform, Writable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as zlib from 'zlib';
import { pipeline } from 'stream/promises';

export const prepareArchive = (): {
  writeStream: Writable;
  filePath: string;
} => {
  const archiveDir = path.join(process.cwd(), 'archive');

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const filePath = path.join(archiveDir, `${today}.ndjson`);

  const writeStream = fs.createWriteStream(filePath, { flags: 'a' });

  return { writeStream, filePath };
};

// 🔹 Reduce a full message object to essential fields
export const reduceMessage = (msg: any) => {
  return {
    id: msg.msg_id || msg.id || msg.uuid || '',
    from: msg.from,
    to: msg.to,
    msg: msg.payload?.bodies?.[0]?.msg ?? '', // message text
    type: msg.chat_type || msg.type || 'chat',
    ts: msg.timestamp,
  };
};

// 🔹 Transform stream: parse NDJSON line by line, reduce, append
const ndjsonReducer = (writeStream: Writable) =>
  new Transform({
    readableObjectMode: false,
    writableObjectMode: false,
    transform(chunk, _encoding, callback) {
      try {
        const data = chunk.toString('utf-8');
        // Split by newlines, ignore empty lines
        const lines = data.split(/\r?\n/).filter(Boolean);

        for (const line of lines) {
          const json = JSON.parse(line);
          const reduced = reduceMessage(json);
          writeStream.write(JSON.stringify(reduced) + '\n', 'utf-8');
        }

        callback();
      } catch (err) {
        callback(err as Error);
      }
    },
  });

export const streamAndAppend = async (
  downloadUrl: string,
  writeStream: Writable,
): Promise<void> => {
  const response = await axios.get(downloadUrl, {
    responseType: 'stream',
  });

  const gunzip = zlib.createGunzip();

  //   const appendStream = new Writable({
  //     write(chunk, _encoding, callback) {
  //       const lines = chunk
  //         .toString('utf-8')
  //         .split('\n')
  //         .filter((l) => l.trim());
  //       for (const line of lines) {
  //         writeStream.write(line + '\n'); // line-by-line NDJSON
  //       }
  //       callback();
  //     },
  //   });

  await pipeline(response.data, gunzip, ndjsonReducer(writeStream));
};
