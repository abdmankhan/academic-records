const Joi = require('joi');

const certificateSchema = Joi.object({
    id: Joi.string().required(),
    studentId: Joi.string().required(),
    studentName: Joi.string().required(),
    course: Joi.string().required(),
    grade: Joi.string().required(),
    issuedAt: Joi.date().iso().required()
});

const certificateUpdateSchema = Joi.object({
    studentName: Joi.string(),
    course: Joi.string(),
    grade: Joi.string(),
    issuedAt: Joi.date().iso()
}).min(1);

exports.validateCertificate = (req, res, next) => {
    const { error } = certificateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
};

exports.validateCertificateUpdate = (req, res, next) => {
    const { error } = certificateUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
};