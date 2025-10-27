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