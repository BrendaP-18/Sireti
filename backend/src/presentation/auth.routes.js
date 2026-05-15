// PAC - PRESENTATION: Rutas de Autenticación
const router = require('express').Router();
const AuthController = require('../control/auth.controller');
const { verificarToken } = require('../control/auth.middleware');

router.post('/login',    AuthController.login);
router.post('/register', AuthController.register);
router.get('/me',        verificarToken, AuthController.me);

module.exports = router;
