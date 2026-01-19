import {Request, Response} from 'express';
import Project from '../models/Project';
import Task from '../models/Task';


export class TaskController {
    static createTask = async (req : Request, res : Response) => {
        const project = req.project;
        try {
            const newTask = new Task(req.body);
            newTask.project = project.id;
            //relacionamos 
            project.tasks.push(newTask.id);

            await Promise.allSettled([newTask.save(), project.save()])
            res.json('Tarea creada correctamente')
        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }


    static getProjectTasks = async (req : Request, res : Response) => {
        
        try {
            const tasks = await Task.find({project : req.project.id}).populate('project')
            res.json({tasks})
        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }


    static getTaskById = async (req : Request, res : Response) => {
        try {
            const {taskId} = req.params
            const task = await Task.findById(taskId)
            if (!task) {
                const error = new Error ('Tarea no encontrada')
                return res.status(404).json({error : error.message})
            }
            res.json(task)
        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }

    static updateTask = async (req : Request, res : Response) => {
        try {
            
            req.task.taskName = req.body.taskName;
            req.task.description = req.body.description;
            await req.task.save();
            res.status(201).json('Tarea actualizada correctamente')
        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }

    static deleteTask = async (req : Request, res : Response) => {
        const {taskId} = req.params;
        try {
            

            req.project.tasks = req.project.tasks.filter(t => t.toString() !== taskId )

            await Promise.allSettled([req.task.deleteOne(), req.project.save()])

            res.json('Tarea eliminada')

        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }

    static updateStatus = async (req : Request, res : Response) => {
        try {
            const {status} = req.body;
            req.task.status = status;
            await req.task.save();
            res.json('Estatus actualizado')
        } catch (error) {
            res.status(500).json({error : 'Hubo un error'})
        }
    }
}