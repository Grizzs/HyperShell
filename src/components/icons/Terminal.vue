<template>
<div ref="HyperShell" class="terminal-container"></div>

</template>

<script setup>
import { ref, onMounted, withDirectives } from 'vue';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css'
import banner from '../../assets/MainBanner.txt?raw'; 

const HyperShell = ref(null);
let term;

onMounted(() => {
  term = new Terminal({
    cursorBlink: true,
    cursorStyle: "underline",
    cursorInactiveStyle: "block",
    fontSize: 20,
    theme: {
      background: '#131e1e',
      foreground: '#79FA05'
    },
    fontWeight: 900
  });

  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);

  const ws = new WebSocket('ws://localhost:3000');
  ws.onopen = () => {
      console.log('Conectado ao WebSocket do backend');
  };
  
  term.open(HyperShell.value);
  fitAddon.fit()
  term.focus();

  term.write(`\x1b[1;32m${banner}\x1b[0m`);

  let userInput = '';

 
  ws.onmessage = (event) => {

     const { type, data, url } = JSON.parse(event.data);

    switch(type){ 

      case "output":
        term.writeln(data);
        break;
      case "clear":
        term.write(`\x1b[1;32m${banner}\x1b[0m`)
        term.clear();
        break;
      case "prompt":
        term.write("\r\n" + data);
        break;
      case "url":
        console.log('Pegamos a URL', url);
        window.open(url);
        break;
      case "banner":
        term.write(`\x1b[1;32m${banner}\x1b[0m`);
        break;
      case "clearAll":
        term.clear();
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
