import colors from 'colors'
import mongoose from 'mongoose'


export async function connectToDB(){
    const uri = process.env.URI;
    try {
        const connection = await mongoose.connect(uri)
        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(colors.magenta.bold(`Conectado en ${url}`))
    } catch (error) {
        console.error(colors.red(error.message))
        process.exit(1)
    }
}




