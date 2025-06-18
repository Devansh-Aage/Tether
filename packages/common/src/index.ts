// packages/common/src/index.ts

// Shared Type Example
export type ServerMessage = {
  id: string;
  timestamp: Date;
  content: string;
  source: 'http' | 'ws';
};

// Shared Utility Function Example
export function formatMessage(message: ServerMessage): string {
  return `[${message.source.toUpperCase()}] ${message.timestamp.toISOString()}: ${message.content}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
