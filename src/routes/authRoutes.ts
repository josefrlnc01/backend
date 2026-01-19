import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { AuthController } from "../controllers/AuthController";
import { AuthEmail } from "../emails/AuthEmail";
import { authenticate } from "../middlewares/auth";
const router = Router()

router.post('/create-account',
    body('name').notEmpty().withMessage('El nombre no puede ir vacío'),
    body('password').isLength({min:8}).withMessage('La contraseña es muy corta, mínimo 8 caracteres'),
    body('password_confirmation').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden')
        }
        return true
    }),
    body('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.createAccount
)


router.post('/confirm-account', 
    body('token').notEmpty().withMessage('El token no puede ir vacío'),
    handleInputErrors,
    AuthController.confirmAccount
)


router.post('/login', 
    body('email').isEmail().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('La contraseña es necesaria'),
    handleInputErrors,
    AuthController.authenticateAndLogin
)


router.post('/request-code', 
    body('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)


router.post('/forgot-password', 
    body('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.forgotPassword
)


router.post('/validate-token', 
    body('token').notEmpty().withMessage('El token no puede ir vacío'),
    handleInputErrors,
    AuthController.validateToken
)


router.post('/update-password/:token', 
    body('password_confirmation').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)


export default router