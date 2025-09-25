import { pool } from '../src/db.js';

export class Manager {
  constructor(fileSystem) {
    this.fs = fileSystem;
    this.comandos = {};

    this.registrador();
  }

  registrador() {
    this.comandos['ls'] = {
      descricao: 'Listar diretórios',
      execute: async (args, ws) => {
        const res = await pool.query(
          `SELECT nome, path FROM diretorio WHERE idpai = $1 ORDER BY nome`,
          [ws.currentDirId]
        );

        if (!res.rows.length) return 'Diretório Vazio';

        return res.rows
          .map(row => `      ${row.nome}     ${row.path}`)
          .join('\r\n');
      }
    };

    this.comandos['clear'] = {
      descricao: "Limpa tela",
      execute: async (args, ws) => {
        ws.send(JSON.stringify({ type: 'clear' }));
        return null;
      }
    };

    this.comandos['cd'] = {
      descricao: "Navegar",
      execute: async (args, ws) => {
        const target = args[0];
      
        if (!target) {
          return "Use cd <nome_diretorio>";
        }

        if (target === "/") {
          ws.currentDirId = 1;
          ws.currentPath = "/";
          return "";
        }

        if (target === "..") {
          const res = await pool.query(
            "SELECT idpai FROM diretorio WHERE idiretorio = $1",
            [ws.currentDirId]
          );

          if (res.rows.length && res.rows[0].idpai !== null) {
            const idPai = res.rows[0].idpai;
            const pai = await pool.query(
              "SELECT idiretorio, path FROM diretorio WHERE idiretorio = $1",
              [idPai]
            );

            ws.currentDirId = pai.rows[0].idiretorio;
            ws.currentPath = pai.rows[0].path;
          }
          return "";
        }
        const res = await pool.query(
          "SELECT idiretorio, path FROM diretorio WHERE nome = $1 AND idpai = $2",
          [target, ws.currentDirId]
        );

        if (res.rows.length === 0) {
          return `cd: ${target}: Diretório não encontrado`;
        } 

        ws.currentDirId = res.rows[0].idiretorio;
        ws.currentPath = res.rows[0].path;

        return "";
      }
    };

    // adicionar mais depois

  }

  async execute(input, ws) {
    const [cmdName, ...args] = input.trim().split(" ");
    const command = this.comandos[cmdName];

    if (!command) {
      return `Comando "${cmdName}" não encontrado`;
    }
    console.log("Executando:", command);
    return await command.execute(args, ws);
  }
}
