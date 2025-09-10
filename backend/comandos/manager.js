export class CommandManager {
  constructor(fileSystem) {
    this.fs = fileSystem;
    this.commands = {};

    this.registerCommands();
  }

  registerCommands() {
    this.commands['ls'] = {
      description: 'Lista diretórios e arquivos',
      execute: async (args) => {
        if (this.fs) {
          return this.fs.ls().join('  ') || 'Diretório vazio';
        }
        return `PASTA2  wannacry.exe  tj.exe  teste.exe`;
      }
    };

  }

  async execute(input) {
    const [cmdName, ...args] = input.trim().split(" ");
    const command = this.commands[cmdName];
    if (!command) {
      return `Comando "${cmdName}" não encontrado`;
    }
    return await command.execute(args);
  }
}
