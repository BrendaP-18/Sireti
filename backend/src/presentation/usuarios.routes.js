// PAC - PRESENTATION: Rutas de Usuarios
const router = require('express').Router();
const UsuariosController = require('../control/usuarios.controller');
const { verificarToken } = require('../control/auth.middleware');

router.use(verificarToken);
router.get('/',       UsuariosController.getAll);
router.get('/:id',    UsuariosController.getById);
router.post('/',      UsuariosController.create);
router.put('/:id',    UsuariosController.update);
router.delete('/:id', UsuariosController.delete);

module.exports = router;
