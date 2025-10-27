let ws;

ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
console.log('Conectado ao WebSocket do backend');
};


export default ws;