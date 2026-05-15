// PAC - PRESENTATION: Rutas de Equipos
const router = require('express').Router();
const EquiposController = require('../control/equipos.controller');
const { verificarToken } = require('../control/auth.middleware');

router.use(verificarToken);
router.get('/',               EquiposController.getAll);
router.get('/:id',            EquiposController.getById);
router.post('/',              EquiposController.create);
router.put('/:id',            EquiposController.update);
router.delete('/:id',         EquiposController.delete);
router.post('/:id/asignar',   EquiposController.asignar);
router.post('/:id/desasignar',EquiposController.desasignar);

module.exports = router;
