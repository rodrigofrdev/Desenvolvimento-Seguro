const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789', // TODO: Não deixe sua senha exposta no código, use variáveis de ambiente
  database: 'nodemysql2',
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL: ' + err.message);
  } else {
    console.log('Conectado ao MySQL');
  }
});

// Configuração do Express
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Rota principal
app.get('/', (req, res) => {
  res.render('login');
});

// Rota de autenticação
app.post('/login', (req, res) => {
  const { login, senha } = req.body;

  // Consulta no banco de dados com vulnerabilidade de SQLi
  // TODO: joao123'; -- " permite logar sem verificar a senha (SELECT * FROM usuarios WHERE login = 'usuário'; -- ' AND senha = 'qualquer_senha';)
  // TODO: "' OR 1=1; -- " permite logar sem verificar a login e senha (SELECT * FROM usuarios WHERE login = 'usuário' AND senha = '' OR 1=1; -- ';)
  // select * from usuarios where login = 'joao123'; -- " and senha = '123456'
  const query = `SELECT * FROM usuarios WHERE login = '${login}' AND senha = '${senha}'`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro na consulta ao banco de dados: ' + err.message);
      res.sendStatus(500);
      return;
    }

    if (results.length > 0) {
      res.redirect('/tarefas/' + results[0].id);
    } else {
      res.send('Login falhou. Verifique suas credenciais.');
    }
  });
});

// Rota para exibir tarefas do usuário
app.get('/tarefas/:usuarioId', (req, res) => {
  const { usuarioId } = req.params;

  // Consulta no banco de dados para obter tarefas do usuário
  const query = `SELECT usuarios.nome, tarefas.descricao FROM tarefas JOIN usuarios ON usuarios.id = tarefas.id_usuario WHERE tarefas.id_usuario = ${usuarioId}`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro na consulta ao banco de dados: ' + err.message);
      res.sendStatus(500);
      return;
    }

    // Renderiza uma página com as tarefas ou envia os dados JSON, dependendo do que você deseja fazer
    res.render('tarefas', { tarefas: results });
  });
});


// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
