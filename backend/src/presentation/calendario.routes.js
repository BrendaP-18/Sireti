// PAC - PRESENTATION: Rutas de Calendario
const router = require('express').Router();
const CalendarioController = require('../control/calendario.controller');
const { verificarToken } = require('../control/auth.middleware');

router.use(verificarToken);
router.get('/proximos', CalendarioController.getProximos);
router.get('/',         CalendarioController.getAll);
router.get('/:id',      CalendarioController.getById);
router.post('/',        CalendarioController.create);
router.put('/:id',      CalendarioController.update);
router.delete('/:id',   CalendarioController.delete);

module.exports = router;
