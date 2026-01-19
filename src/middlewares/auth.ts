import {Request, Response, NextFunction} from 'express'
import { verifyJWT } from '../utils/jwt'
import User, { IUser } from '../models/User'

declare global {
    namespace Express {
        interface Request {
            user: IUser
        }
    }
}

export async function authenticate (req : Request, res : Response, next : NextFunction) {
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('No autenticado')
        return res.status(401).json({error : error.message})
    }
    const token = bearer.split(' ')[1]
    try {
        const decoded = verifyJWT(token)
        const user = await User.findById(decoded.id).select('-password')
        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(401).json({error : error.message})
        }
        req.user = user
        next()
    } catch (error) {
        res.status(401).json({error: 'Token no válido'})
    }
}