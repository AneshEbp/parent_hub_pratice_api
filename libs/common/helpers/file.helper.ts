import { Transform, Writable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as zlib from 'zlib';
import { pipeline } from 'stream/promises';
import { IConversationRepository } from '@app/data-access/conversation-index/iconversation.repository';
import { log } from 'console';

export const prepareArchive = (): {
  writeStream: Writable;
  filePath: string;
  today: string;
} => {
  const archiveDir = path.join(process.cwd(), 'archive');

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const filePath = path.join(archiveDir, `${today}.ndjson`);

  const writeStream = fs.createWriteStream(filePath, { flags: 'a' });

  return { writeStream, filePath, today };
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

export const createNdjsonReducer = (
  writeStream: Writable,
  fileName: string,
  fileDate: Date,
  conversationRepository: IConversationRepository, // 👈 inject from service
) => {
  const seenConversations = new Set<string>();

  return new Transform({
    transform(chunk, _encoding, callback) {
      try {
        const lines = chunk.toString('utf-8').split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          const json = JSON.parse(line);
          const type = json.chat_type?.toLowerCase().trim(); // normalize

          // Generate the unique ID (anesh_hari or group_123)
          const convId =
            type === 'groupchat'
              ? `group_${json.to}`
              : [json.from, json.to].sort().join('_');
          seenConversations.add(convId);
          const reduced = reduceMessage(json);
          writeStream.write(JSON.stringify(reduced) + '\n', 'utf-8');
        }
        callback();
      } catch (err) {
        log(' i m at err');
        callback(err);
      }
    },

    async flush(callback) {
      try {
        log('i m at flush');
        // Use your repository to save the map
        if (seenConversations.size > 0) {
          console.log('i m here', seenConversations);
          await conversationRepository.bulkUpsert(
            Array.from(seenConversations),
            fileName,
            fileDate,
          );
        }
        callback();
      } catch (err) {
        // Log error but don't stop the backup process
        console.log(`Indexing failed for ${fileName}: ${err.message}`);
        callback();
      }
    },
  });
};

export const streamAndAppend = async (
  downloadUrl: string,
  writeStream: Writable,
  fileName: string,
  fileDate: string,
  conversationRepository: IConversationRepository,
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

  // await pipeline(response.data, gunzip, ndjsonReducer(writeStream));

  // Create the reducer for this specific hour
  const reducer = createNdjsonReducer(
    writeStream,
    fileName,
    new Date(fileDate),
    conversationRepository,
  );
  await pipeline(response.data, gunzip, reducer, { end: false });

  // 2. IMPORTANT: Manually end the reducer
  // This is what triggers the flush() method!
  reducer.end();

  // 3. Wait for the reducer to actually finish its flush/async work
  await new Promise((resolve, reject) => {
    reducer.on('finish', resolve); // 'finish' fires after flush() completes
    reducer.on('error', reject);
  });
};
