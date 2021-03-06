const Document = require('../models').Document;
const pdfMake = require('pdfmake/build/pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');
const sendEnrollmentMail = require('./student').sendEnrollmentMail;

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const generateEnrollmentDocument = async (authToken, studentId) => {
  const documentDefintion = {
    content: [
      'Admitere ASE',
      'Procesul de înscriere a luat final',
      'Orice actualizare va fi disponibila in aplicatie',
    ],
  };

  pdfMake.createPdf(documentDefintion).getBase64(async (result) => {
    await Document.create({
      title: 'Bun venit la ASE',
      file: result,
      studentId: studentId,
      iteration: '',
      state: true,
    });
    sendEnrollmentMail(authToken, result, studentId);
  });
};

module.exports = {
  generateEnrollmentDocument,
};
