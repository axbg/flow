const sequelize = require('sequelize');
const Op = sequelize.Op;
const webpush = require('web-push');

const Student = require('../models').Student;
const Criteria = require('../models').Criteria;
const Faculty = require('../models').Faculty;
const User = require('../models').User;
const Flow = require('../models').Flow;
const StudentOption = require('../models').StudentOption;
const FacultyProfile = require('../models').FacultyProfile;
const generateError = require('../utils/FlowError').generateError;

const PUBLIC_VAPID_KEY = require('../config').PUBLIC_VAPID_KEY;
const PRIVATE_VAPID_KEY = require('../config').PRIVATE_VAPID_KEY;
const VAPID_EMAIL = require('../config').VAPID_EMAIL;

webpush.setVapidDetails(VAPID_EMAIL, PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);

const findStudentByCnp = async (cnp) => {
  return await Student.findOne({
    where: {
      cnp: cnp,
    },
    attributes: {
      exclude: ['password', 'notificationToken'],
    },
    include: [
      { model: Criteria, as: 'criterias', attributes: ['type', 'value'] },
    ],
  });
};

const findStudentByOrderNumber = async (orderNumber, userId) => {
  const students = await Student.findAll({
    where: {
      orderNumber: orderNumber,
    },
    attributes: {
      exclude: ['password', 'notificationToken'],
    },
    include: [
      { model: Criteria, as: 'criterias', attributes: ['type', 'value'] },
      { model: StudentOption, as: 'options', include: { model: FacultyProfile, include: { model: Faculty } } },
    ],
  });

  const volunteer = await User.findOne({
    where: {
      id: userId,
    },
  });

  const student = students.find((student) => {
    for (let i = 0; i < student.options.length; i++) {
      if (student.options[i].faculty_profile.facultyId === volunteer.facultyId) {
        return student;
      }
    }
  });

  if (student) {
    return { ...student.toJSON() };
  }

  return {};
};

const produceOrderNumber = async (studentId, facultyId) => {
  await Faculty.update(
      { currentOrderNumber: sequelize.literal('current_order_number + 1') },
      {
        where:
        { id: facultyId },
      });

  const faculty = await Faculty.findOne({ where: { id: facultyId } });

  Student.update({ orderNumber: faculty.currentOrderNumber }, { where: { id: studentId } });

  return faculty.currentOrderNumber;
};

const sendNotification = async (student) => {
  if (student && student.notificationToken) {
    const payload = JSON.stringify(
        { title: 'Ești următorul!', content: 'Te așteptăm la intrarea în facultate în cel mai scurt timp!' });

    // endpoint, p256dh, auth
    const subscriptionData = student.notificationToken.split('#');
    const keys = { p256dh: subscriptionData[1], auth: subscriptionData[2] };
    const subscription = { endpoint: subscriptionData[0], expirationTime: null, keys: keys };

    webpush.sendNotification(subscription, payload);
  }
};

const findStudent = async (search, userId) => {
  search || generateError('Search field is not present', 400);
  userId || generateError('Faculty identifier is not present', 400);
  return search.length > 10 ? findStudentByCnp(search) : findStudentByOrderNumber(search, userId);
};

const generateOrderNumber = async (student) => {
  student.studentId || generateError('Student identifier is not present', 400);

  const studentOption = await StudentOption.findOne({
    where: {
      studentId: student.studentId,
    },
    include: { model: FacultyProfile, include: { model: Faculty } },
  });

  const facultyId = studentOption.faculty_profile.facultyId ?
    studentOption.faculty_profile.facultyId : student.facultyId;

  facultyId || generateError('Options or FacultyId is required', 400);

  return await produceOrderNumber(student.studentId, facultyId);
};

const notifyStudent = async (studentId) => {
  studentId || generateError('Student identifier not present', 400);
  const student = await Student.findOne({ id: studentId });
  sendNotification(student);
};

const notifyStudents = async (numberOfStudents, userId) => {
  numberOfStudents || generateError('Number of students not present', 400);

  const user = await User.findOne({ where: { id: userId }, include: [{ model: Faculty }] });

  const flows = await Flow.findAll({ where: { facultyId: user.facultyId }, raw: true });
  const currentOrderNumber = flows.reduce((total, flow) => total + flow.flow, 0);

  const students = await Student.findAll({
    attributes: ['notificationToken', 'temporaryFacultyId'],
    where: { orderNumber: { [Op.between]: [currentOrderNumber, currentOrderNumber + numberOfStudents] } },
    include: [{ model: StudentOption, as: 'options', include: { model: FacultyProfile } }],
  });

  students.map((student) => {
    if ((student.options.length !== 0 && student.options[0].faculty_profile.facultyId === user.facultyId) ||
      student.options.length === 0 && student.temporaryFacultyId === user.facultyId) {
      sendNotification(student);
    }
  });
};

module.exports = {
  findStudent,
  generateOrderNumber,
  notifyStudent,
  notifyStudents,
};
