const SupplierModel = require("../models/Supplier");
const handleFactory = require("../utils/handleFactory");

exports.createSupplier = handleFactory.createOne(SupplierModel);
exports.getAllSuppliers = handleFactory.getAll(SupplierModel);
exports.getSupplier = handleFactory.getOne(SupplierModel);
exports.updateSupplier = handleFactory.updateOne(SupplierModel);
exports.deleteSupplier = handleFactory.deleteOne(SupplierModel);
