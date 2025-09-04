<template>
<div ref="HyperShell" class="terminal-container"></div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import banner from '../../assets/MainBanner.txt?raw'; 

const HyperShell = ref(null);
let term;

onMounted(() => {
  term = new Terminal({
    cols: 190,
    rows: 40,
    cursorBlink: true,
    fontSize: 15,
    theme: {
      background: '#1e1e1e',
      foreground: '#ffffff'
    }
  });

  const ws = new WebSocket('ws://localhost:3000');
  ws.onopen = () => {
      console.log('Conectado ao WebSocket do backend');
  };
  
  term.open(HyperShell.value);
  term.focus();

  term.write(banner);
  

  let userInput = '';

  ws.onmessage = (event) => {

     const { type, data } = JSON.parse(event.data);

    if (type === "output") {
      term.writeln(data);
    }
    else if (type === "prompt"){
      term.write("\r\n" + data)
    }
  };

  term.onData((data) => {
    if (data === '\r') { 
      term.write("\r\n\n")
      ws.send(userInput);
      userInput = '';
    } else if (data === '\u007F') {
      if (userInput.length > 0) {
        userInput = userInput.slice(0, -1);
        term.write('\b \b');
      }
    } else {
      userInput += data;
      term.write(data);
    }
  });
});




</script>

<style scoped>
.terminal-container {
  width: 100%;
  height: 100%;
}
</style>
