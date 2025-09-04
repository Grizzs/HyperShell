import cd from './cd.js';
import ls from './ls.js';
import { getCurrentPath } from './cd.js';

export const comandos = {cd, ls};


export function executarCmd(input) {
  const estrutura_cmd = input.trim().split(" ");
  const cmd = estrutura_cmd[0];
  const args = estrutura_cmd.slice(1);

  if (comandos[cmd]) {
    return comandos[cmd](args);
  } else {
    return `Comando "${cmd}" não encontrado`;
  }
}

export { getCurrentPath }