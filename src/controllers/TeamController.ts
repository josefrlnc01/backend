import type { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Project"

export class TeamMemberController {
    static findMemberByEmail = async (req : Request, res : Response) => {
        try {
            const { email } = req.body
            const user = await User.findOne({email}).select('id email name')
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error : error.message})
            }

            res.json(user)
        } catch (error) {
            return res.status(500).json({error : 'Hubo un error'})
        }
    }


    static addMemberById = async (req : Request, res : Response) => {
        try {
            if (!req.project) {
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({error: error.message})
            }
            const {id} = req.body
            const user = await User.findById(id)
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error : error.message})
            }
            
            if (req.project.team.some(t => t.toString() === user.id.toString())) {
                const error = new Error('El usuario ya existe en el proyecto')
                return res.status(409).json({error : error.message})
            }
        
            req.project.team.push(user.id)
            await req.project.save()
            res.send('Usuario agregado correctamente')
        } catch (error) {
            console.log(error)
            return res.status(500).json({error : error.message})
        }
    }


    static removeMemberById = async (req : Request, res : Response) => {
        try {
            const {userId} = req.params;
            console.log('userId:', userId);
            console.log('team:', req.project.team);
            if (!req.project.team.some(team => team.toString() === userId)) {
                const error = new Error('El usuario no existe en el proyecto')
                return res.status(409).json({error : error.message})
            }
            req.project.team = req.project.team.filter(m => m.toString() !== userId)
            console.log('team after filter:', req.project.team);
            await req.project.save()
            res.send('Usuario eliminado correctamente')
        } catch (error) {
            console.log('error:', error);
            return res.status(500).json({error : 'Hubo un error'})
        }
    }


    static getProjectTeam = async (req : Request, res : Response) => {
        try {
            const project = await Project.findById(req.project.id).populate({
                path : 'team',
                select : 'id email name'
            })
            res.json(project.team)
        } catch (error) {
            return res.status(500).json({error : 'Hubo un error'})
        }
    }
}