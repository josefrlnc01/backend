import { type Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {

    static getAllProjects = async (req : Request, res : Response) => {
        try{
            const projects = await Project.find({
                $or : [
                    {manager : {$in: req.user._id}}
                ]
            })
            res.json(projects)

        } catch (error) {
            
            console.error(error)
        }
    }

    static createProject = async (req : Request, res : Response) => {
        const project = new Project(req.body);
        if(!project){
                const error = new Error('No se encontró el proyecto')
                return res.status(404).json({error :error.message});
            }
            project.manager = req.user.id
        try {
            await project.save();
            res.status(201).json({message: 'Proyecto creado correctamente'});
        } catch (error) {
            console.error(error);
        }
        
    }

    static getProjectById = async (req : Request, res : Response) => {
        const id = req.params.id;
        try{
            const existentProject = await Project.findById(id).populate('tasks')
            if(!existentProject){
                const error = new Error('No se encontró el proyecto')
                return res.status(404).json({error:error.message});
            }
            if (existentProject.manager.toString() !== req.user.id.toString()) {
                const error = new Error('Acción no válida')
                return res.status(404).json({error:error.message});
            }
            res.json(existentProject);
        } catch (error) {
            console.error(error)
        }
    }


    static modifyProject = async (req : Request, res : Response) => {
        const {id} = req.params;
        try {
            const project = await Project.findById(id);

            if(!project){
                const error = new Error('No se encontró el proyecto')
                return res.status(404).json({error :error.message});
            }

            if (project.manager.toString() !== req.user.id.toString()) {
                const error = new Error('Acción no autorizada, solo el manager puede actualizar el proyecto')
                return res.status(404).json({error :error.message});
            }
            
                project.projectName = req.body.projectName;
                project.clientName = req.body.clientName;
                project.description = req.body.description;

                await project.save();
            res.send('Proyecto actualizado');
        } catch (error) {
            console.error(error);
        }
    }


    static deleteProject = async (req : Request, res : Response) => {
        const {id} = req.params;
        try{
            const project = await Project.findById(id);

            if(!project){
                const error = new Error('No se encontró el proyecto')
                return res.status(404).json({error :error.message});
            }

            if (project.manager.toString() !== req.user.id.toString()) {
                const error = new Error('Acción no autorizada, solo el manager puede eliminar el proyecto')
                return res.status(404).json({error :error.message});
            }
            await project.deleteOne();
            res.json('Proyecto eliminado');
        } catch (error) {
            console.error(error)
        }
    }
}
