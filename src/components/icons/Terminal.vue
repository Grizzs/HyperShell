<template>
<div ref="HyperShell" class="terminal-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import banner from '../../assets/MainBanner.txt?raw';
import smallBanner from '../../assets/SmallBanner.txt?raw';
import { criaHandler, handleMessage } from '../../utils/messageHandler.js';
import ws from '../../utils/initWs';
// import { initTerminal } from '../../utils/initTerminalEvent.js';

const HyperShell = ref(null);
let term;
let fitAddon;

let resizeTimeout;

const canFitBanner = (cols) => {
  const bannerLines = banner.split('\n');
  const maxLineLength = Math.max(...bannerLines.map(line => line.length));
  return cols >= maxLineLength;
};

const time = new Date()

const displayBanner = () => {
  const cols = term.cols;
  
  if (canFitBanner(cols)) {
    term.write(`\x1b[1;32m${time}\x1b[0m`)
    term.write(`\x1b[1;32m${banner}\x1b[0m \r\n`);
    term.writeln(`\x1b[1;32mDigite \x1b[36m'help'\x1b[1;32m para visualizar a lista de comandos.\x1b[0m`)
  } else {
    term.write(`\x1b[1;32m${smallBanner}\x1b[0m `); 
    term.writeln(`\x1b[1;32mDigite \x1b[36m'help'\x1b[1;32m para visualizar a lista de comandos.\x1b[0m`)
  }
  

};

onMounted(() => {
  term = new Terminal({
    cursorBlink: true,
    cursorStyle: "underline",
    cursorInactiveStyle: "block",
    fontSize: 16,
    rightClickSelectsWord: true,
    convertEol: true,
    scrollback: 1000,
    theme: {
      background: '#161720',
      foreground: '#00FF00',
      selectionBackground: '#2c2e3d'
    }
  });

  fitAddon = new FitAddon();
  term.loadAddon(fitAddon);


  term.open(HyperShell.value);
  fitAddon.fit();
  term.focus();

  displayBanner();

  let userInput = '';

  const handlers = criaHandler(term, displayBanner);

  ws.onmessage = (m) => {
    handleMessage(m, handlers);
  };

  

  term.onData((data) => {

    if (data === '\x03') {
    document.execCommand('copy');
    return;
    }

    if (data === '\x16') {
      navigator.clipboard.readText().then(text => {
        userInput += text;
        term.write(text);
      });
      return;
    }

    if (data === '\r') {
      term.write("\r\n\n");
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

  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      fitAddon.fit();
    }, 100);
  };
  
  window.addEventListener('resize', handleResize);

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (ws) ws.close();
    if (term) term.dispose();
  });
});
</script>

<style scoped>
.terminal-container {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  box-sizing: border-box;
  zoom: 1.25; 
}

</style>