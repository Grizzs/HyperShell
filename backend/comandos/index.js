import ls from './ls.js';


export const comandos = {ls};


export async function executarCmd(input) {
  const estrutura_cmd = input.trim().split(" ");
  const cmd = estrutura_cmd[0];
  const args = estrutura_cmd.slice(1);

  if (comandos[cmd]) {
    return await comandos[cmd].execute(args);
  } else {
    return `Comando "${cmd}" não encontrado`;
  }
}
