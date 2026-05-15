// PAC - PRESENTATION: Rutas de Reportes Trabajador
const router = require('express').Router();
const ReportesController = require('../control/reportes.controller');
const { verificarToken } = require('../control/auth.middleware');

router.use(verificarToken);
router.get('/mis-reportes', ReportesController.getMios);
router.get('/stats',        ReportesController.getStats);
router.get('/',             ReportesController.getAll);
router.get('/:id',          ReportesController.getById);
router.post('/',            ReportesController.create);
router.put('/:id',          ReportesController.update);
router.delete('/:id',       ReportesController.delete);

module.exports = router;
