import app from './app.js';
import { WebSocketServer } from 'ws';
import { loadDiretorio } from '../diretorios/diretorio.js';
import { CommandManager } from '../comandos/manager.js';

const PORT = 3000;
const PROMPT = 'user@hypershell:$ ';
const cmdManager = new CommandManager(null);

const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

(async () => {
  await loadDiretorio();
})();

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client conectado ao WebSocket');

  ws.on('message', async (message) => {
    const input = message.toString().trim();
    if (!input) return;

    try {
      const output = await cmdManager.execute(input);

      if (output) {
        ws.send(JSON.stringify({
          type: "output", data: `\n${output}`
        }));
      }
      ws.send(JSON.stringify({ type: "prompt", data: PROMPT}))
    
    } catch (err) {
      ws.send(JSON.stringify({ type: "output", data: `Erro: ${err.message}` }));
      ws.send(JSON.stringify({ type: "prompt", data: PROMPT }));
    }
  });
  ws.send(JSON.stringify({
    type: "prompt",
    data: PROMPT
  }));

  ws.on('close', () => console.log('Client desconectado'));

});