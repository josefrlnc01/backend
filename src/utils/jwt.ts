import  jwt  from "jsonwebtoken";
import { Types } from "mongoose";

type UserPayload = {
    id : Types.ObjectId
}

export function generateJWT (payload : UserPayload) {
    const token = jwt.sign(payload, process.env.SECRET_JWT, {
        expiresIn : '180d'
    })

    return token
}

export function verifyJWT(token: string): UserPayload {
    try {
        const decoded = jwt.verify(token, process.env.SECRET_JWT) as UserPayload;
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
}