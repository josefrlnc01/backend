import {NextFunction, Request, Response} from 'express'

import Task, { ITask } from "../models/Task";

declare global {
    namespace Express {
        interface Request {
            task : ITask
        }
    }
}

export async function validateTaskExists (req : Request, res : Response, next : NextFunction) {
    try {
        const {taskId} = req.params;

        const task = await Task.findById(taskId)

        if (!task) return res.status(404).json({error : 'Tarea no encontrada'})

        req.task = task;

        next()
    } catch (error) {
        res.status(500).json({error : 'Error en la validación de la tarea'})
    }
}

export async function taskBelongsToProject (req : Request, res : Response, next : NextFunction) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        return res.status(404).json({error : 'Acción no válida, esta tarea no perteneceal proyecto'})
        }
        next()
}