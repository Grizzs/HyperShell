import app from './app.js';
import { WebSocketServer } from 'ws';
import { loadDiretorio } from '../diretorios/diretorio.js';
import { Manager } from '../comandos/manager.js';

const PORT = 3000;
const PROMPT = 'user@hypershell:$ ';
const cmdManager = new Manager(null);

const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

console.log("Bombando")

const getPrompt = (ws) => {
  return `user@${ws.currentPath || '/'}:$ `;
};

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client conectado ao WebSocket');

  ws.currentDirId = 20;
  ws.currentPath = 'user';


  ws.on('message', async (message) => {
    const input = message.toString().trim();
    if (!input) return;

    try {
      const output = await cmdManager.execute(input, ws);

      if (output) {
        ws.send(JSON.stringify({
          type: "output", data: `${output}`
        }));
      }
      ws.send(JSON.stringify({ type: "prompt", data: getPrompt(ws)}))
    
    } catch (err) {
      ws.send(JSON.stringify({ type: "output", data: `Erro: ${err.message}` }));
      ws.send(JSON.stringify({ type: "prompt", data: getPrompt(ws)}));
    }
  });
  ws.send(JSON.stringify({
    type: "prompt",
    data: getPrompt(ws)
  }));

  ws.on('close', () => console.log('Client desconectado'));

});