import type { Request, Response } from "express";
import User, { IUser } from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generate6DigitsToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";
import jwt from 'jsonwebtoken'


declare global {
    namespace Express {
        interface Request {
            user : IUser
        }
    }
}

export class AuthController {
    static createAccount = async (req : Request, res : Response) => {
        try {
            const {password, email} = req.body
            const user = new User(req.body)

            //Prevenir duplicados
            const userExists = await User.findOne({email})
            if (userExists) {
                const error = new Error('Este email ya está registrado')
                return res.status(409).json({error : error.message})
            }

            const token = new Token()
            token.token =  generate6DigitsToken()
            token.user = user.id
            //Crear usuario
            //Hash password
            user.password = await hashPassword(password)
            
            //ENVIAR EMAIL
            AuthEmail.sendEmail({
                email : user.email,
                token : token.token,
                name : user.name
            })
            await Promise.allSettled([await user.save(), await token.save()])
            res.send('Usuario creado correctamente, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }


    static confirmAccount = async (req : Request, res : Response) => {
        try {
            const {token} = req.body
            const tokenExists = await Token.findOne({token})
            if (!tokenExists) {
                const error = new Error('Token no válido')
                return res.status(401).json({error : error.message})
            }
            
            //Confirmamos el usuario
            const user = await User.findById(tokenExists.user)
            user.confirmed = true
            await user.save()
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }


    static authenticateAndLogin = async (req : Request, res : Response) => {
        try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            const error = new Error('El usuario no existe')
            return res.status(404).json({error : error.message})
        }

        if (!user.confirmed) {
            //Creamos nuevo token
            const token = new Token()
            token.user = user.id
            token.token = generate6DigitsToken()

            await token.save()

            //Enviamos nuevo token
            AuthEmail.sendEmail({
                name : user.name,
                email : user.email,
                token : token.token
            })
            const error = new Error('El email no está confirmado, se ha enviado un nuevo token de confirmación, revisa tu correo electrónico')
            return res.status(401).json({error : error.message})
        }

        const isValidPassword = await checkPassword(password,user.password )
        if (!isValidPassword) {
            const error = new Error('La contraseña es incorrecta')
            return res.status(401).json({error : error.message})
        }
        const token = generateJWT({id : user.id})

        try {
            const decoded = jwt.verify(token, process.env.SECRET_JWT)

            if (typeof decoded === 'object' && decoded.id) {
                const user = await User.findById(decoded.id).select('_id name email')
                console.log(user)
                if (user) {
                    req.user = user
                }
            }
            
        } catch (error) {
            return res.status(500).json({error : 'No se pudo obtener el token'})
        }

        return res.send(token)
        } catch (error ) {
            return res.status(500).json({error : 'Hubo un error'})
        }
    }



    static requestConfirmationCode = async (req : Request, res : Response) =>  {
        try {
        const {email} = req.body
        const user = await User.findOne({email})
        if (!user) {
            const error = new Error('El usuario no existe')
            return res.status(404).json({error : error.message})
        }

        if (user.confirmed) {
            const error = new Error('El usuario ya está confirmado')
            return res.status(403).json({error : error.message})
        }
            //Creamos nuevo token
            const token = new Token()
            token.user = user.id
            token.token = generate6DigitsToken()


            //Enviamos nuevo token
            AuthEmail.sendEmail({
                name : user.name,
                email : user.email,
                token : token.token
            })
            await Promise.allSettled([user.save(), token.save()])
        return res.send('Se envió un nuevo token de confirmación')
        }
        catch (error ) {
            return res.status(500).json({error : 'Hubo un error'})
        }
    }


    static forgotPassword = async (req : Request, res : Response) =>  {
        try {
        const {email} = req.body
        const user = await User.findOne({email})
        if (!user) {
            const error = new Error('El usuario no existe')
            return res.status(404).json({error : error.message})
        }

            //Creamos nuevo token
            const token = new Token()
            token.user = user.id
            token.token = generate6DigitsToken()

            await token.save()
            //Enviamos nuevo token
            AuthEmail.sendPasswordResetToken({
                name : user.name,
                email : user.email,
                token : token.token
            })
        return res.send('Revisa tu email para ver las instrucciones')
        }
        catch (error ) {
            return res.status(500).json({error : 'Hubo un error'})
        }
    }


    static validateToken = async (req : Request, res : Response) => {
        try {
            const {token} = req.body
            const tokenExists = await Token.findOne({token})
            if (!tokenExists) {
                const error = new Error('Token no válido')
                return res.status(401).json({error : error.message})
            }
            res.send('Token válido, puedes cambiar tu contraseña')
        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }

    static updatePasswordWithToken = async (req : Request, res : Response) => {
        try {
            const {token} = req.params
            const {password, password_confirmation} = req.body
            const tokenExists = await Token.findOne({token})
            
            if (password !== password_confirmation) {
                const error = new Error('La contraseña no es la misma')
                return res.status(401).json({error : error.message})
            }
            
            //Hasheamos y cambiamos contraseña
            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('Contraseña cambiada correctamente')
        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }


    static user = async (req : Request, res : Response) => {
        return res.json(req.user)
    }
}