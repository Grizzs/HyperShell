import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.post('/execute', async (req, res) => {
  const { command } = req.body;

  try {
    const result = await pool.query(command);

    const output = result.rows.length ? JSON.stringify(result.rows, null, 2) : 'Nenhum resultado';

    res.json({ output });
  } catch (err) {
    res.json({ output: `Erro ao executar comando: ${err.message}` });
  }
});

export default router;
