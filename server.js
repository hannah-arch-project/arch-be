require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// ✅ RDS(MySQL) 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors({
  origin: 'https://www.shndh.kro.kr'
}));
app.use(express.json());

// ✅ 서버 시작 시 테이블 자동 생성
const init = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        timestamp VARCHAR(20) NOT NULL
      )
    `);
    console.log('✅ 테이블 초기화 완료');
  } catch (err) {
    console.error('❌ 테이블 생성 중 오류 발생:', err.message);
    process.exit(1);
  }
};

// ✅ 기본 루트
app.get('/', (req, res) => {
  res.send('Hello from Node.js!');
});

// ✅ 게시글 목록 조회
app.get('/posts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM post ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 게시글 저장
app.post('/posts', async (req, res) => {
  const { content, timestamp } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO post (content, timestamp) VALUES (?, ?)',
      [content, timestamp]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 게시글 삭제
app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM post WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 서버 시작 & 초기화
app.listen(PORT, async () => {
  console.log(`🚀 Server running`);
  await init();
});