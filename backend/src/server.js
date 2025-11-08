import app from './app.js';
import { WebSocketServer } from 'ws';
import { Manager } from '../comandos/manager.js';

const PORT = 3000;
const cmdManager = new Manager();
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
console.log("Bombando")

const currentUsr = 'root'



const getPrompt = (ws) => {
  const PROMPT = ws.currentPath
  return `\x1b[31m${currentUsr}@${PROMPT}:$\x1b[0m ` || '/';
};

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client conectado no WebSocket');

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

  ws.on('close', () => console.log('Desconectado'));

});