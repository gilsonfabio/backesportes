const crypto = require('crypto');
const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        const tecnicos = await connection('tecnicos')
        .orderBy('tecNome')
        .select('*');
    
        return response.json(tecnicos);
    },    
        
    async signIn(request, response) {
        let email = request.params.email;
        let senha = request.params.password;

        //console.log(email);
        //console.log(senha);

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const tecnico = await connection('tecnicos')
            .where('tecEmail', email)
            .where('tecPassword', encodedVal)
            .select('tecId', 'tecNome')
            .first();
          
        if (!tecnico) {
            return response.status(400).json({ error: 'Não encontrou usuário com este ID'});
        } 

        return response.json(tecnico);
    },
    
    async create(request, response) {
        
        //console.log(request.body);
        
        const {nome, cpf, nascimento, email, celular , password} = request.body;
        var status = 'A'; 
        var senha = crypto.createHash('md5').update(password).digest('hex');
        const [tecId] = await connection('tecnicos').insert({
            tecNome: nome, 
            tecEmail: email, 
            tecPassword: senha,
            tecCelular: celular, 
            tecCpf: cpf, 
            tecNascimento: nascimento, 
            tecStatus: status
        });
           
        return response.json({tecId});
    },

    async dadTecnicos (request, response) {        
        let id = request.params.idTec;
        let status = 'A';
        const tecnico = await connection('tecnicos')
        .where('tecStatus', status)
        .where('tecId', id)
        .orderBy('tecNome')
        .select('tecnicos.*');

        return response.json(tecnico);
    },

    async updTecnico(request, response) {
        let id = request.params.idTec;        
        const {tecNome, tecNascimento, tecCpf, tecEmail, tecCelular} = request.body;

        await connection('tecnicos')
        .where('tecId', id)
        .update({
            tecNome, 
            tecNascimento, 
            tecCpf, 
            tecEmail, 
            tecCelular 
        });
           
        return response.status(204).send();
    },
};
