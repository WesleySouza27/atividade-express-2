import express, {request, response} from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

const app = express()

app.use(cors())
app.use(express.json())

const carList = [
    {
        id: uuidv4(),
        modelo: 'uno',
        marca: 'fiat',
        ano: 2010,
        cor: 'branco',
        preco: 20000
    }
]

const users = []

// 1. Endpoint para listar todos os carros
app.get('/cars', (request, response) => {
    if (carList.length === 0) {
        return response.status(404).json({
            message: 'nenhum carro encontado'
        })
    }
    
    const formattedList = carList.map(car => {
        return `ID: ${car.id} | Modelo: ${car.modelo} | Marca: ${car.marca} | Ano: ${car.ano} | Cor: ${car.cor} | Preço: R$${car.preco}`
    })
    
    return response.status(200).send(formattedList.join('\n'))
})


// 2. Endpoint para criar um carro
app.post('/cars', (request, response) => {
    const {modelo, marca, ano, cor, preco} = request.body

        if (!modelo || !marca || !ano || !cor || !preco) {
            return response.status(400).json({
                message: "obrigatório modelo, marca, ano, cor, preço"
            })
        }

        const newCar = {
            id: uuidv4(),
            modelo,
            marca,
            ano,
            cor,
            preco
        }

        carList.push(newCar)

        return response.status(201).json({
            message: 'carro cadastrado com sucesso!',
            newCar
        })
})


// 3. Endpoint para filtrar carros por marca
app.get('/cars/marca/:marca', (request, response) => {
    const { marca } = request.params

    const filteredCars = carList.filter(car => car.marca.toLocaleLowerCase() === marca.toLocaleLowerCase())

    if (filteredCars.length === 0) {
        return response.status(404).json({
            message: `Nenhum carro encontrado para a marca: ${marca}`
        })
    }

    const formattedCars = filteredCars.map(car => {
        return `ID: ${car.id} | Modelo: ${car.modelo} | Cor: ${car.cor} | Preço: ${car.preco}`
    })

    return response.status(200).send(formattedCars.join('\n'))
})


// atualizar cor e preço do veiculo
app.put('/cars/id/:id', (request, response) => {

    const { id } = request.params
    const { cor, preco } = request.body
    const idVerified = carList.find(carr => carr.id === id) 
    const carIndex = carList.findIndex(carr => carr.id === id)
    
    if (carIndex !== -1) {
        if(cor) {
            carList[carIndex].cor = cor
        }
        if (preco) {
            carList[carIndex].preco = preco
        }
        return response.status(200).json({message: 'veículo encontrado', idVerified})
        
    } else {
        return response.status(404).json({ message: 'carro não encontrado'})
    }
})


// deletar carros
app.delete('/cars/id/:id', (request, response) => {
    const { id } = request.params

    const carDelete = carList.findIndex(carr => carr.id === id)

    if (carDelete !== -1) {
        carList.splice(carDelete, 1)
        return response.status(200).json({message: "Veículo excluido!"})
    } else {
        return response.status(404).json({message: "Veículo não encontrado"})
    }
})

// criar usuário
app.post('/users', async (request, response) => {
    try {
        const {nome, email, senha} = request.body

        if (!nome || !email || !senha) {
            return response.status(400).json({
            message: "obrigatório nome, email e senha"
            })
        }
        
        const hashedPassword = await bcrypt.hash(senha, 10)

        const existingUser = users.find(user => user.email === email)

        if (existingUser) {
            return response.status(400).json({
              message: 'Usuário já existe.'
            })
        }

        const newUser = {
            id: uuidv4(),
            nome,
            email,
            senha: hashedPassword
        }

        users.push(newUser)

        return response.status(201).json({
            message: "Usuário cadastrado com sucesso!",
            newUser
        })
    } catch (error) {
        response.status(500).json({
            message: `Error ao registrar usuário. ${error}`
        })
    }
})


// login
app.post('/login', async (request,response) => {
    try {
        const { email, senha} = request.body
        

        if (!email || !senha) {
            return response.status(400).json({
                message: 'Email e senha são obrigatórios'
            })
        }

        const user = users.find(user => user.email === email)

        if (!user) {
            return response.status(404).json({
                message: 'Usuário não encontrado'
            })
        }

        const passwordCompare = await bcrypt.compare(senha, user.senha)

        if (!passwordCompare) {
            return response.status(400).json({
                message: 'Credenciais inválidas.'
            })
        }

        return response.status(200).json({
            message: 'Loguin feito com sucesso!'
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Erro ao fazer loguin."
        })
    }
})

app.listen(3030, () => {
    console.log('servidor rodando na porta 3030')
})