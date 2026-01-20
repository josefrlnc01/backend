import  {  Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import {body, param} from 'express-validator'
import { handleInputErrors } from "../middlewares/validation";
import { TaskController } from "../controllers/TaskController";
import { handleProjectValidation } from "../middlewares/project";
import { taskBelongsToProject, validateTaskExists } from "../middlewares/task";
import { authenticate } from "../middlewares/auth";
import { TeamMemberController } from "../controllers/TeamController";

const router = Router()

//uso del middleware en todas las rutas
router.use(authenticate)

router.get('/', ProjectController.getAllProjects);


router.put('/:id', 
    param('id').isMongoId().withMessage('Id no válido'),
    body('projectName')
    .notEmpty().withMessage('El campo de proyecto no puede ir vacío'),
    body('clientName')
    .notEmpty().withMessage('El campo de cliente no puede ir vacío'),
    body('description')
    .notEmpty().withMessage('El campo de descripción no puede ir vacío'),
    handleInputErrors,
    ProjectController.modifyProject)


router.get('/:id', 
    param('id').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    ProjectController.getProjectById)


router.post('/', 
    body('projectName')
    .notEmpty().withMessage('El campo de proyecto no puede ir vacío'),
    body('clientName')
    .notEmpty().withMessage('El campo de cliente no puede ir vacío'),
    body('description')
    .notEmpty().withMessage('El campo de descripción no puede ir vacío'),
    handleInputErrors,
    ProjectController.createProject);


    router.delete('/:id',
        param('id').isMongoId().withMessage('Id no válido'),
        handleInputErrors,
        ProjectController.deleteProject
    )


    router.post('/:projectId/tasks',
        body('taskName')
            .notEmpty().withMessage('El campo de nombre no puede ir vacío'),
        body('description')
            .notEmpty().withMessage('El campo de descripción no puede ir vacío'),
        param('projectId').isMongoId().withMessage('Id no válido'),
        handleInputErrors,
        handleProjectValidation,
        TaskController.createTask
    )


    router.get('/:projectId/tasks',
        param('projectId').isMongoId().withMessage('Id no válido'),
        handleInputErrors,
        handleProjectValidation,
        TaskController.getProjectTasks
    )

    router.get('/:projectId/tasks/:taskId',
        param('projectId').isMongoId().withMessage('Id no válido'),
        param('taskId').isMongoId().withMessage('Id no válido'),
        handleInputErrors,
        handleProjectValidation,
        validateTaskExists,
        taskBelongsToProject,
        TaskController.getTaskById
    )

    router.put('/:projectId/tasks/:taskId',
        body('taskName')
            .notEmpty().withMessage('El campo de nombre no puede ir vacío'),
        body('description')
            .notEmpty().withMessage('El campo de descripción no puede ir vacío'),
        param('projectId').isMongoId().withMessage('Id no válido'),
        param('taskId').isMongoId().withMessage('Id no válido'),
        handleInputErrors,
        handleProjectValidation,
        validateTaskExists,
        taskBelongsToProject,
        TaskController.updateTask
    )

    router.delete('/:projectId/tasks/:taskId', 
        param('projectId').isMongoId().withMessage('Id no válido'),
        param('taskId').isMongoId().withMessage('Id no válido'),
        handleInputErrors,
        handleProjectValidation,
        validateTaskExists,
        taskBelongsToProject,
        TaskController.deleteTask
    )

    router.post('/:projectId/tasks/:taskId/status',
        param('projectId').isMongoId().withMessage('Id no válido'),
        param('taskId').isMongoId().withMessage('Id no válido'),
        body('status')
            .notEmpty().withMessage('Campo de status obligatorio'),
        handleInputErrors,
        handleProjectValidation,
        validateTaskExists,
        taskBelongsToProject,
        TaskController.updateStatus
    )

    router.get('/:projectId/team',
        param('projectId').isMongoId().withMessage('Id no válido'),
        handleInputErrors,
        handleProjectValidation,
        TeamMemberController.getProjectTeam
    )

    router.post('/:projectId/team/find',
        body('email')
            .isEmail().isLowercase().withMessage('Email no válido'),
        handleInputErrors,
        TeamMemberController.findMemberByEmail
    )

    router.post('/:projectId/team',
        body('id')
            .isMongoId().withMessage('Email no válido'),
        handleInputErrors,
        handleProjectValidation,
        TeamMemberController.addMemberById
    )


    router.delete('/:projectId/team',
        body('id')
            .isMongoId().withMessage('Email no válido'),
        handleInputErrors,
        handleProjectValidation,
        TeamMemberController.removeMemberById
    )

export default router;
