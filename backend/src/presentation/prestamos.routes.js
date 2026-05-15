// PAC - PRESENTATION: Rutas de Préstamos
const router = require('express').Router();
const PrestamosController = require('../control/prestamos.controller');
const { verificarToken } = require('../control/auth.middleware');

router.use(verificarToken);
router.get('/',       PrestamosController.getAll);
router.get('/:id',    PrestamosController.getById);
router.post('/',      PrestamosController.create);
router.put('/:id',    PrestamosController.update);
router.delete('/:id', PrestamosController.delete);

module.exports = router;
