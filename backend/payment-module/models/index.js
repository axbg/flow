const database = require('./config');
const Student = database.import('./Student');
const StudentOption = database.import('./StudentOption');
const Faculty = database.import('./Faculty');
const Document = database.import('./Document');
const Criteria = database.import('./Criteria');
const Configuration = database.import('./Configuration');
const FacultyProfile = database.import('./FacultyProfile');

Student.hasMany(StudentOption, { as: 'options' });
Student.hasMany(Document, { as: 'documents' });
Student.hasMany(Criteria, { as: 'criterias' });

StudentOption.belongsTo(FacultyProfile);

FacultyProfile.belongsTo(Faculty);

module.exports = {
  database,
  Student,
  StudentOption,
  Faculty,
  Document,
  Criteria,
  Configuration,
  FacultyProfile,
};
