import { pool } from '../src/db.js';

export class Manager {
  constructor(fileSystem) {
    this.fs = fileSystem;
    this.comandos = {};

    this.registrador();
  }

  registrador() {
    this.comandos['ls'] = {
      description: 'Lista diretórios e arquivos',
      execute: async (args) => {
        const currentDirId = 1; 
        const res = await pool.query(`SELECT nome, path FROM diretorio WHERE idpai = $1 ORDER BY nome`,
        [currentDirId]
        );
        if(!res.rows.length) return 'Diretório Vazio';

        return res.rows.map(row => `      ${row.nome}     ${row.path}`)
        .join('\r\n')
    }
    };

  }

  async execute(input) {
    const [cmdName, ...args] = input.trim().split(" ");
    const command = this.comandos[cmdName];
    if (!command) {
      return `Comando "${cmdName}" não encontrado`;
    }
    return await command.execute(args);
  }
}
