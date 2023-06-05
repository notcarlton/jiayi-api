import { IPostSchema, schema } from '../error/validate';
interface ILogData {
  log_messages: ILogMsg[];
  user?: {
    name: string;
    discrim: string;
  };
  error: {
    name: string;
    location: {
      file_name: string;
      line: number;
    };
  };
}

interface ILogMsg {
  timestamp: string;
  sender: string;
  level: IPostSchema['past_log'][0]['level'];
  msg: string;
}

export function parseLog(file: string): ILogData {
  const lines = file.split('\n');

  let discordUser: ILogData['user'];
  let errorStartIdx: number = 0;

  const logMessages: ILogMsg[] = lines
    .map((x, lineIdx) => {
      const timestamp = x.match(
        /(?<=\[)(\d{2}:){2}\d{2}(?=\] \[(\w+ - \w+)\]: .+)/i
      )?.[0];
      const sender = x.match(
        /(?<=\[(\d{2}:){2}\d{2}\] \[)(\w+)(?= - \w+\]: .+)/i
      )?.[0];

      const level = x.match(
        /(?<=\[(\d{2}:){2}\d{2}\] \[(\w+ - ))(\w+)(?=\]: .+)/i
      )?.[0];

      const msg = x.match(
        /(?<=\[(\d{2}:){2}\d{2}\] \[(\w+ - \w+)\]: )(.+)/i
      )?.[0];

      if (!timestamp || !sender || !level || !msg) return;

      if (sender.match(/exception/i)) {
        errorStartIdx = lineIdx + 1;
      }

      if (!discordUser) {
        const discordUserMatch = msg.match(/(?<=Connected to )(\w+#\d{4})/i);
        if (discordUserMatch) {
          const user = discordUserMatch[0].split('#');
          discordUser = {
            name: user[0],
            discrim: user[1],
          };
          return;
        }
      }

      return {
        timestamp,
        sender,
        level,
        msg,
      } as ILogMsg;
    })
    .filter(Boolean);

  const errorSender = logMessages[logMessages.length - 1].sender;

  const fileName = lines[errorStartIdx + 1].match(
    /(?<=\\)\w+\.(.+)(?=:line \d+)/i
  )?.[0];
  const lineNumber = lines[errorStartIdx + 1].match(/(?<=:line )\d+/i)?.[0];

  return {
    log_messages: logMessages,
    user: discordUser,
    error: {
      name: errorSender,
      location: {
        file_name: fileName || 'Unknown',
        line: parseInt(lineNumber || '0'),
      },
    },
  };
}
