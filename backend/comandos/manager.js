import ws from '../../src/utils/initWs.js';
import { pool } from '../src/db.js';


let last_cmd = ''

export class Manager {
  constructor() {
    this.comandos = {};
    this.registrador();
  }

  registrador() {
    this.comandos['ls'] = {
      descricao: 'Listar Diretórios',
      execute: async (args, ws) => {
        const dirRes = await pool.query(
          `SELECT nome, path FROM diretorio WHERE idpai = $1 ORDER BY nome`,
          [ws.currentDirId]
        );
        const arqRes = await pool.query(
          `SELECT nome_arquivo, path FROM arquivo WHERE idiretorio = $1 ORDER BY nome_arquivo`,
          [ws.currentDirId]
        );
        
        if (!dirRes.rows.length && !arqRes.rows.length) return 'Diretório Vazio';

        let arqDir = []; 

        dirRes.rows.forEach(row => {
          arqDir.push(`\x1b[1;34m ${row.nome.padEnd(20)}\x1b[0m${row.path}`);
        });
        
        arqRes.rows.forEach(row => {
          arqDir.push(`\x1b[1;32m ${row.nome_arquivo.padEnd(20)}        \x1b[0m ${row.path}`);
        });
        
        return arqDir.join('\r\n');
      }
    };

    this.comandos['clear'] = {
      descricao: "Limpa Tela",
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
    this.comandos['pwd'] = {
      descricao: "Listar Caminho",
      execute: async (args, ws) => {
          return `${ws.currentPath}`;
      } 
    }
    this.comandos['whoami'] = {
      descricao: "Quem sou Eu",
      execute: async () => {
        return "User"
      }
    }
    this.comandos['linkedin'] = {
      descricao: "Linkedin do Criador",
      execute: async (args, ws) => {
        ws.send(JSON.stringify({ 
          type: 'url', 
          url: 'https://www.linkedin.com/in/cristian-camillo-49a048236/' 
        }));
        return "Abrindo LinkedIn...";
      }
    }
    this.comandos['banner'] = {
      descricao: "Gera Banner",
      execute: async (args, ws) => {
        ws.send(JSON.stringify({ 
          type: 'banner'
        }));
      }
    }
    this.comandos['help'] = {
      descricao: 'Mostra Comandos',
      execute: async (args, ws) => {
        const comandos = Object.keys(this.comandos);
        let output = [
            '  \x1b[1;36m╔══════════════════════════════════╗\x1b[0m',
            '  \x1b[1;36m║        MANUAL DE COMANDOS        ║\x1b[0m', 
            '  \x1b[1;36m╚══════════════════════════════════╝\x1b[0m', ''];
        
        comandos.sort().forEach(cmd => {
          const desc = this.comandos[cmd].descricao || '';
          output.push(`  \x1b[1;33m${cmd.padEnd(15)}\x1b[0m - ${desc}`);
        });
        
        return output.join('\r\n');
      }
    }
    this.comandos['github'] = {
      descricao: "Github do Criador",
      execute: async (args, ws) => {
        ws.send(JSON.stringify({ 
          type: 'url', 
          url: 'https://github.com/Grizzs' 
        }));
        return "Abrindo Github...";
      }
    };
    this.comandos['sherlock'] = {
      descricao: "Ferramenta de OSINT para facilitar procura de um usuário em redes sociais",
      execute: async (args, ws) => {
        ws.send(JSON.stringify({
          type: 'sherlock'
        }));

      }
    }
    this.comandos['msfconsole'] = {
      descricao: "Interface para executar scripts, payloads, pentest etc",
      execute: async (args, ws) => {
        ws.send(JSON.stringify({
          type: 'msfconsole',
        }))
      }
    }
    this.comandos['cat'] ={
      descricao: "Ler e Criar arquivos de texto",
      execute: async (args, ws) => {
        const nomeArq = args[0];

        if(!nomeArq) {
          return "Use: cat <nome_do_arquivo>";
        }
        try {
          const res = await pool.query(
            `SELECT conteudo
            FROM arquivo 
            WHERE nome_arquivo = $1 AND idiretorio = $2`,
            [nomeArq, ws.currentDirId]
          );


          if (res.rows.length === 0) {
            return `cat ${nomeArq}: não encontrado no diretório atual`;
          }

          const arquivo = res.rows[0];
          ws.send(JSON.stringify({
            type: 'catTxt',
            data: arquivo.conteudo || "Arquivo não vazio"
          }))


        } catch (error) {
          console.error('Erro ao executar cat', error);
          return `cat erro ao ler arquivo ${error.message}`;
        }
      }
    }

    

  }

  async execute(input, ws) {
    const [cmdName, ...args] = input.trim().split(" ");
    const command = this.comandos[cmdName];

    if (!command) {
      return `Comando "${cmdName}" não encontrado`;
    }
    console.log("Executando:", command);
    last_cmd = `${cmdName} ${args.join(' ')}`;

    return await command.execute(args, ws);
  }
}


