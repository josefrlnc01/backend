import {CorsOptions} from 'cors';

export const corsConfig : CorsOptions = {
    
    origin : function (origin, callback) {
        const ACCEPTED_ORIGINS = [
            process.env.FRONTEND_URL
        ]

        if (process.argv[2] === '--api') {
            ACCEPTED_ORIGINS.push(undefined)
        }
        
        if (ACCEPTED_ORIGINS.includes(origin)){
            callback(null, true)
        } else {
            callback(new Error ('Not allowed by cors'))
        }
    }
}