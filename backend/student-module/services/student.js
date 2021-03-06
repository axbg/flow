const crypto = require('crypto');
const sequelize = require('sequelize');
const geolib = require('geolib');

const Student = require('../models').Student;
const StudentOption = require('../models').StudentOption;
const FacultyProfile = require('../models').FacultyProfile;
const Criteria = require('../models').Criteria;
const Faculty = require('../models').Faculty;
const generateError = require('../utils/FlowError').generateError;
const sendMail = require('../utils/moduleAdapter').sendMail;

const CRITERIA_TYPES = require('../config').CRITERIA_TYPES;

const generateRandomPassword = () => {
  return crypto.randomBytes(20).toString('hex');
};

const isEmailUnique = async (email) => {
  const student = await Student.findOne({
    where: {
      email: email,
    },
  });

  return !student ? true : false;
};

const validatePassword = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return regex.test(password);
};

const validateStudent = async (student) => {
  student.email || generateError('Data is not correct: email missing', 400);
  await isEmailUnique(student.email) || generateError('Email is already registered', 400);
  student.firstname || generateError('Data is not correct: firstname missing', 400);
  student.lastname || generateError('Data is not correct: lastname missing', 400);
  student.parentInitial || generateError('Data is not correct: parentInitial missing', 400);
  student.phone || generateError('Data is not correct: phone missing', 400);
  student.address || generateError('Data is not correct: address missing', 400);
  student.cnp || generateError('Data is not correct: cnp missing', 400);
  student.series || generateError('Data is not correct: series missing', 400);
  student.number || generateError('Data is not correct: number missing', 400);
  student.idPublisher || generateError('Data is not correct: idPublisher missing', 400);
  student.bacAverage || generateError('Data is not correct: bacAverage missing', 400);
  student.bacRomanian || generateError('Data is not correct:bacRomanian missing', 400);
  student.average9 || generateError('Data is not correct: average9 missing', 400);
  student.average10 || generateError('Data is not correct: average10 missing', 400);
  student.average11 || generateError('Data is not correct: average11 missing', 400);
  student.average12 || generateError('Data is not correct: average12 missing', 400);
};

const createCriteria = async (studentData, studentId) => {
  Criteria.bulkCreate([
    { type: CRITERIA_TYPES.BAC_AVERAGE, value: studentData.bacAverage, studentId: studentId },
    { type: CRITERIA_TYPES.BAC_RO, value: studentData.bacRomanian, studentId: studentId },
    { type: CRITERIA_TYPES.AVERAGE_9, value: studentData.average9, studentId: studentId },
    { type: CRITERIA_TYPES.AVERAGE_10, value: studentData.average10, studentId: studentId },
    { type: CRITERIA_TYPES.AVERAGE_11, value: studentData.average11, studentId: studentId },
    { type: CRITERIA_TYPES.AVERAGE_12, value: studentData.average12, studentId: studentId },
  ]);
};

const sendRegistrationMail = (student) => {
  const message = 'Ai facut primul pas spre a deveni student ASE, ' + student.firstname +
    '\nDatele de conectare sunt\nusername: ' + student.email + '\nparola: ' + student.password + '\n';

  sendMail('Inregistrare Admitere ASE', message, student.email);
};

const removeSensitiveData = (student) => {
  student.email && delete student.email;
  student.password && delete student.password;
  student.tax && delete student.tax;
  student.withdrawPortoflio && delete student.withdrawPortoflio;
  student.credits && delete student.credits;
  student.orderNumber && delete student.orderNumber;
  return student;
};

const isEnrolled = async (studentId) => {
  const student = await Student.findOne({
    where: {
      id: studentId,
    },
    attributes: ['enrolled'],
  });
  return student.enrolled;
};

const updateCriteria = async (criteria, type, studentId) => {
  Criteria.update(
      {
        value: criteria,
      },
      {
        where: {
          type: type,
          studentId: studentId,
        },
      });
};

const updateCriterias = async (student, studentId) => {
  const criterias = [];

  student.bacAverage && criterias.push(updateCriteria(student.bacAverage, CRITERIA_TYPES.BAC_AVERAGE, studentId));
  student.bacRomanian && criterias.push(updateCriteria(student.bacRomanian, CRITERIA_TYPES.BAC_RO, studentId));
  student.average9 && criterias.push(updateCriteria(student.average9, CRITERIA_TYPES.AVERAGE_9, studentId));
  student.average10 && criterias.push(updateCriteria(student.average10, CRITERIA_TYPES.AVERAGE_10, studentId));
  student.average11 && criterias.push(updateCriteria(student.average11, CRITERIA_TYPES.AVERAGE_11, studentId));
  student.average12 && criterias.push(updateCriteria(student.average12, CRITERIA_TYPES.AVERAGE_12, studentId));

  await Promise.all(criterias);
};

const addTemporaryFaculty = async (studentId, facultyId) => {
  await Student.update({ temporaryFacultyId: facultyId }, { where: { id: studentId } });
};

const getFacultyCoordinates = async (facultyId) => {
  await addTemporaryFaculty(facultyId);
  const faculty = await Faculty.findOne({
    where: {
      id: facultyId,
    },
    attributes: ['coordinates'],
  });

  return faculty.coordinates;
};

const verifyLocation = (location, facultyCoordinates) => {
  const [studentLat, studentLong] = location.split('#');
  const [facultyLat, facultyLong] = facultyCoordinates.split('#');

  return geolib.getDistance(
      { latitude: studentLat, longitude: studentLong }, {
        latitude: facultyLat, longitude: facultyLong,
      }) < 20000;
};

const produceOrderNumber = async (studentId, facultyId) => {
  await Faculty.update(
      { currentOrderNumber: sequelize.literal('current_order_number + 1') },
      { where: { id: facultyId } },
  );

  const faculty = await Faculty.findOne({ where: { id: facultyId } });

  Student.update({ orderNumber: faculty.currentOrderNumber }, { where: { id: studentId } });

  return faculty.currentOrderNumber;
};

const validateOption = async (option, studentId) => {
  option.facultyProfileId || generateError('Faculty Profile identifier is not present', 400);

  const student = await Student.findOne({ where: { id: studentId }, attributes: ['id', 'credits'] });
  const findOptions = await StudentOption.findAll(
      {
        where:
        { studentId: studentId, facultyProfileId: option.facultyProfileId },
      },
  );

  student.credits > 0 || generateError('Student doesn\'t have enough credits', 400);
  !findOptions.length || generateError('Faculty Profile already selected', 400);
  student.credits = student.credits - 1;
  await student.save();
};

const loadStudentData = async (studentId) => {
  return await Student.findOne({
    where: {
      id: studentId,
    },
    attributes: {
      exclude: ['password'],
    },
    include: [
      { model: StudentOption, as: 'options', include: { model: FacultyProfile } },
      { model: Criteria, as: 'criterias', attributes: ['type', 'value'] },
    ],
  });
};


const createStudent = async (student) => {
  await validateStudent(student);

  student.password = generateRandomPassword();

  const registeredStudent = await Student.create(student);

  await createCriteria(student, registeredStudent.id);

  return student;
};

const changePassword = async (newPassword, studentId) => {
  if (validatePassword(newPassword)) {
    return await Student.update(
        {
          password: newPassword,
          active: true,
        },
        {
          where: {
            id: studentId,
          },
          individualHooks: true,
        },
    );
  }
};

const loadStudent = async (studentId) => {
  const student = await loadStudentData(studentId);
  const faculties = await Faculty.findAll({});

  return { student: student, faculties: faculties };
};

const updateStudent = async (student, studentId) => {
  if (!(await isEnrolled(studentId))) {
    student = removeSensitiveData(student);
    await updateCriterias(student, studentId);
    await Student.update({ ...student }, { where: { id: studentId } });
    return await loadStudent(studentId);
  }

  return null;
};

const generateOrderNumber = async (student, studentId) => {
  const studentOption = await StudentOption.findOne({
    where: {
      studentId: studentId,
    },
    include: { model: FacultyProfile, include: { model: Faculty } },
  });

  const [facultyId, facultyCoordinates] = studentOption.faculty_profile.facultyId ?
    [studentOption.faculty_profile.facultyId, studentOption.faculty_profile.faculty.coordinates] :
    [student.facultyId, await getFacultyCoordinates(facultyId)];

  studentOption.faculty_profile.facultyId || addTemporaryFaculty(studentId, facultyId);

  facultyId || generateError('Options or FacultyId is required', 400);

  student.location && verifyLocation(student.location, facultyCoordinates) ||
    generateError('Location is not valid', 400);

  return await produceOrderNumber(studentId, facultyId);
};

const getOptions = async (studentId) => {
  studentId || generateError('Student identifier is not present', 400);

  const options = await FacultyProfile.findAll({ raw: true });
  const selectedOptions = await StudentOption.findAll({
    where: { studentId: studentId }, include: { model: FacultyProfile },
    order: [['id', 'asc']], raw: true,
  });

  const selectedOptionsIds = selectedOptions.map((options) => options.facultyProfileId);
  const notSelectedOptions = options.filter((option) => !selectedOptionsIds.includes(option.id));

  return { selectedOptions, notSelectedOptions };
};

const createOption = async (option, studentId) => {
  studentId || generateError('Student identifier is not present', 400);

  // if (!(await isEnrolled(studentId))) {
  await validateOption(option, studentId);
  await StudentOption.create({ admitted: false, facultyProfileId: option.facultyProfileId, studentId: studentId });
  // } else {
  //     generateError("Student is already enrolled", 400);
  // }
};

const deleteOption = async (option, studentId) => {
  studentId || generateError('Student identifier is not present', 400);

  if (!(await isEnrolled(studentId))) {
    option.id || generateError('Option identifier is not present');
    await StudentOption.destroy({ where: { id: option.id } });
    const student = await Student.findOne({ where: { id: studentId }, attributes: ['id', 'credits'] });
    student.credits++;
    await student.save();
  } else {
    generateError('Student is already enrolled', 400);
  }
};

const withdrawPortoflio = async (studentId) => {
  return await Student.update({ withdrawPortfolio: true }, { where: { id: studentId } });
};

const subscribeToPush = async (subscription, studentId) => {
  const notificationToken = subscription.endpoint + '#' + subscription.keys.p256dh + '#' + subscription.keys.auth;
  await Student.update({ notificationToken: notificationToken }, { where: { id: studentId } });
};

module.exports = {
  validateStudent,
  createStudent,
  sendRegistrationMail,
  changePassword,
  loadStudent,
  loadStudentData,
  updateStudent,
  generateOrderNumber,
  getOptions,
  createOption,
  deleteOption,
  withdrawPortoflio,
  subscribeToPush,
};
