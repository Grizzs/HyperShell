let ws;

ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
console.log('Inicializando WS');
};


export default ws;