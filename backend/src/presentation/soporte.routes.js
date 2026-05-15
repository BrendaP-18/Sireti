// PAC - PRESENTATION: Rutas de Soporte Técnico
const router = require('express').Router();
const SoporteController = require('../control/soporte.controller');
const { verificarToken } = require('../control/auth.middleware');

router.use(verificarToken);
router.get('/recientes', SoporteController.getRecientes);
router.get('/stats',     SoporteController.getStats);
router.get('/',          SoporteController.getAll);
router.get('/:id',       SoporteController.getById);
router.post('/',         SoporteController.create);
router.put('/:id',       SoporteController.update);
router.delete('/:id',    SoporteController.delete);

module.exports = router;
