import { Client, IMessage } from '@stomp/stompjs';

let client: Client | null = null;

export function connect(onMessage: (msg: any) => void) {
  // Construye la URL ws/wss correcta según http/https
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const brokerURL = `${scheme}://${window.location.host}/ws`;

  client = new Client({
    brokerURL,                 // WebSocket nativo (sin SockJS)
    reconnectDelay: 2000,
    onConnect: () => {
      client?.subscribe('/topic/session', (frame: IMessage) => {
        onMessage(JSON.parse(frame.body));
      });
    },
    debug: () => { } // silenciar logs si quieres
  });

  client.activate();
}

export function disconnect() {
  client?.deactivate();
}

export function isConnected() {
  return !!client?.connected;
}
