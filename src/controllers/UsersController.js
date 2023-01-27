const crypto = require('crypto');
const connection = require('../database/connection');

const nodemailer = require("nodemailer");

module.exports = {   
    async index (request, response) {
        const users = await connection('usuarios')
        .orderBy('usrNome')
        .select('*');
    
        return response.json(users);
    },    
        
    async signIn(request, response) {
        let email = request.params.email;
        let senha = request.params.password;

        //console.log(email);
        //console.log(senha);

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const user = await connection('usuarios')
            .where('usrEmail', email)
            .where('usrPassword', encodedVal)
            .select('usrId', 'usrNome')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou usuário com este ID'});
        } 

        return response.json(user);
    },
    
    async create(request, response) {
        //console.log(request.body);
        const {nome, cpf, nascimento, email, celular , password} = request.body;
        var status = 'A'; 
        var senha = crypto.createHash('md5').update(password).digest('hex');
        const [usrId] = await connection('usuarios').insert({
            usrNome: nome, 
            usrEmail: email, 
            usrPassword: senha,
            usrCelular: celular, 
            usrCpf: cpf, 
            usrNascimento: nascimento, 
            usrStatus: status
        });
           
        return response.json({usrId});
    },

    async solPassword (request, response) {
        let emailUsuario = request.params.email;

        //console.log('email solicitado:', emailUsuario)

        const user = await connection('usuarios')
            .where('usrEmail', emailUsuario)
            .select('usrNome')
            .first();

        if (!user) {
            return response.status(400).json({ error: 'Não encontrou usuario com este email'});
        } 

        let codSeguranca = '123456';         
        await connection('usuarios').where('usrEmail', emailUsuario)  
        .update({
           usrCodSeguranca: codSeguranca,           
        });

        const admEmail = process.env.EMAIL_USER;
        //console.log('Email usuario:', admEmail)

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
            tls: {
              rejectUnauthorized: false,
            },
        });

        const mailSent = await transporter.sendMail({
            text: "Texto do E-mail teste",
            subject: "Assunto do e-mail",
            from: "Gilson Fábio <gilsonfabio@innvento.com.br",
            to: ["gilsonfabio@gmail.com"],
            html: `
            <html>
            <body>
              <strong>Conteúdo HTML</strong></br>Do E-mail
            </body>
          </html> 
            `,
        });
        //console.log(mailSent);
        return response.status(200).send();  
    },    

    async updPassword(request, response) {
        let id = request.params.idUsr;         
        const { password } = request.body;
 
        var senha = crypto.createHash('md5').update(password).digest('hex');
        await connection('usuarios').where('usrId', id)   
        .update({
            usrSenha: senha,           
        });
           
        return response.status(204).send();
    },
};

