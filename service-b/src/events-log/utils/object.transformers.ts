import { TEventLogRecord, TNATSMessege } from '../types';

export const messegeToEventLog = (
  eventName: string,
  message: TNATSMessege,
): TEventLogRecord => {
  return {
    event: eventName,
    data: message,
    timestamp: message.timestamp,
  };
};
