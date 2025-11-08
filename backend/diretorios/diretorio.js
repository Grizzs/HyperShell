// Esse módulo não é utilizado no código, serviu apenas para testes
import { pool } from '../src/db.js';



let diretorios = [];

export async function loadDiretorio() {
  try {
    const res = await pool.query('SELECT * FROM diretorio');
    diretorios = res.rows;
    console.log('Diretórios carregados:', diretorios.length);
    console.log(diretorios);
  }
  catch(err){
      console.error('Não foi possivel carregar os diretorios: ', err);
  }


}

export function getDiretorio(){
  return diretorios
}