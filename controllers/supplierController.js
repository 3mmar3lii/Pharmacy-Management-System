const SupplierModel = require("../models/Supplier");
const factory = require("../utils/handleFactory");

exports.createSupplier = factory.createOne(SupplierModel);

exports.getAllSuppliers = factory.getAll(SupplierModel);

exports.getSupplier = factory.getOne(SupplierModel);

exports.updateSupplier = factory.updateOne(SupplierModel);

exports.deleteSupplier = factory.deleteOne(SupplierModel);
