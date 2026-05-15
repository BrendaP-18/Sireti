// PAC - PRESENTATION: Rutas de Mensajes (Chat)
const router = require('express').Router();
const MensajesController = require('../control/mensajes.controller');
const { verificarToken } = require('../control/auth.middleware');

router.use(verificarToken);
router.get('/',       MensajesController.getAll);
router.post('/',      MensajesController.create);
router.delete('/:id', MensajesController.delete);

module.exports = router;
