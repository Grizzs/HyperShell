import app from './app.js';
import { WebSocketServer } from 'ws';
import { executarCmd, getCurrentPath } from '../comandos/index.js';
import { loadDiretorio } from '../diretorios/diretorio.js';

const PORT = 3000;

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
      const output = await executarCmd(input);

      if (output) {
        ws.send(JSON.stringify({
          type: "output", data: `\r${output}`
        }));
      }
      ws.send(JSON.stringify({ type: "prompt", data: `user@hypershell:${getCurrentPath()}$`}))
    
    } catch (err) {
      ws.send(`Erro ao executar comando: ${err.message}\r\n$ `);
    }
  });
  ws.send(JSON.stringify({
    type: "prompt",
    data: `user@hypershell:${getCurrentPath()}$ `
  }));

  ws.on('close', () => console.log('Client desconectado'));

});