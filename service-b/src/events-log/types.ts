export type TNATSMessege = {
  query: string;
  resultCount: number;
  timestamp: Date;
  data: unknown;
};

export type TEventLogRecord = {
  event: string;
  data: TNATSMessege;
  timestamp: Date;
};
