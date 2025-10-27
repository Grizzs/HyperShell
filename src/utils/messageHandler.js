import sherlock from '../assets/sherlock.txt?raw';
import { randomChooser } from './mathChooser';

const modulosMsf = import.meta.glob('../assets/metasploitAssets/*.txt', { 
  query: '?raw',
  eager: true
});
const msfArts = Object.values(modulosMsf).map(module => module.default);


export const criaHandler = (term, displayBanner) => {
  return {
    output: (data) => {
      term.writeln(data);
    },

    clear: () => {
      term.clear();
      displayBanner();
    },

    prompt: (data) => {
      term.write("\r\n" + data);
    },

    url: (data, url) => {
      console.log('Pegou a URL', url);
      window.open(url);
    },

    banner: () => {
      displayBanner();
    },

    clearAll: () => {
      term.clear();
    },

    sherlock: () => {
        term.clear();
        term.write(sherlock)
        term.write('Use sherlock <args..> <username> \n')
        
    },

    msfconsole: () => {
        const escolhido = randomChooser(msfArts)
        term.write(`${escolhido} \n`)
    }
 

  };
};

export const handleMessage = (event, handlers) => {
  const { type, data, url } = JSON.parse(event.data);
  
  const handler = handlers[type];
  if (handler) {
    handler(data, url);
  } else {
    console.warn(`Tipo desconhecido: ${type}`);
  }
};