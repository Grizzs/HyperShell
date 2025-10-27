<template>
<div ref="HyperShell" class="terminal-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import banner from '../../assets/MainBanner.txt?raw';
import ws from '../../utils/initWs';
import { initTerminal } from '../../utils/initTerminalEvent.js';

const HyperShell = ref(null);
let term;
let fitAddon;

let resizeTimeout;

const canFitBanner = (cols) => {
  const bannerLines = banner.split('\n');
  const maxLineLength = Math.max(...bannerLines.map(line => line.length));
  return cols >= maxLineLength;
};


const displayBanner = () => {
  const cols = term.cols;
  
  if (canFitBanner(cols)) {
    term.write(`\x1b[1;32m${banner}\x1b[0m`);
  } else {
    term.writeln('\x1b[1;32m╔════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;32m║      HyperShell (HS)                   ║\x1b[0m');
    term.writeln('\x1b[1;32m║  Not A Corporation. All Hype reserved. ║\x1b[0m');
    term.writeln('\x1b[1;32m╚════════════════════════════════════════╝\x1b[0m');
    term.writeln('');

      term.writeln('');
      term.writeln('Bem vindo ao HyperShell');
      term.writeln('');
      term.writeln('Curso Técnico em Desenvolvimento de Sistemas - IFsul CAVG');
      term.writeln('');
  }
  

};

onMounted(() => {
  term = new Terminal({
    cursorBlink: true,
    cursorStyle: "underline",
    cursorInactiveStyle: "block",
    fontSize: 20,
    theme: {
      background: '#131e1e',
      foreground: '#79FA05',
    },
    rows: 24,
    cols: 80
  });

  fitAddon = new FitAddon();
  term.loadAddon(fitAddon);


  term.open(HyperShell.value);
  fitAddon.fit();
  term.focus();

  displayBanner();

  let userInput = '';
  initTerminal(term)
  

  ws.onmessage = (event) => {
    const { type, data, url } = JSON.parse(event.data);
    
    switch(type) {
      case "output":
        term.writeln(data);
        break;
      case "clear":
        term.clear();
        displayBanner();
        break;
      case "prompt":
        term.write("\r\n" + data);
        break;
      case "url":
        console.log('Pegou a URL', url);
        window.open(url);
        break;
      case "banner":
        displayBanner();
        break;
      case "clearAll":
        term.clear();
        break;
    }
  };

  term.onData((data) => {
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
}
</style>