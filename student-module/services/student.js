const generateError = require('../utils/FlowError').generateError;
const Student = require('../models/index').Student;
const StudentOption = require('../models/index').StudentOption;
const Document = require('../models/index').Document;
const Criteria = require('../models/index').Criteria;
const Faculty = require('../models/index').Faculty;
const CRITERIA_TYPES = require('../config/index').CRITERIA_TYPES;
const sendMail = require('../utils/moduleAdapter').sendMail;
const crypto = require('crypto');

const generateRandomPassword = () => {
    return crypto.randomBytes(20).toString('hex');
}

const isEmailUnique = async (email) => {
    const student = await Student.findOne({
        where: {
            email: email
        }
    });

    return !student ? true : false;
}

const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
}

const validateStudent = async (student) => {
    student.email || generateError("Data is not correct: email missing", 400);
    await isEmailUnique(student.email) || generateError("Email is already registered", 400);
    student.firstname || generateError("Data is not correct: firstname missing", 400);
    student.lastname || generateError("Data is not correct: lastname missing", 400);
    student.parentInitial || generateError("Data is not correct: parentInitial missing", 400);
    student.phone || generateError("Data is not correct: phone missing", 400);
    student.address || generateError("Data is not correct: address missing", 400);
    student.cnp || generateError("Data is not correct: cnp missing", 400);
    student.series || generateError("Data is not correct: series missing", 400);
    student.number || generateError("Data is not correct: number missing", 400);
    student.idPublisher || generateError("Data is not correct: idPublisher missing", 400);
    student.bacAverage || generateError("Data is not correct: bacAverage missing", 400);
    student.bacRomanian || generateError("Data is not correct:bacRomanian missing", 400);
    student.average9 || generateError("Data is not correct: average9 missing", 400);
    student.average10 || generateError("Data is not correct: average10 missing", 400);
    student.average11 || generateError("Data is not correct: average11 missing", 400);
    student.average12 || generateError("Data is not correct: average12 missing", 400);
}

const createCriteria = async (studentData, studentId) => {
    Criteria.bulkCreate([
        { type: CRITERIA_TYPES.BAC_AVERAGE, value: studentData.bacAverage, studentId: studentId },
        { type: CRITERIA_TYPES.BAC_RO, value: studentData.bacRomanian, studentId: studentId },
        { type: CRITERIA_TYPES.BAC_RO, value: studentData.bacRomanian, studentId: studentId },
        { type: CRITERIA_TYPES.AVERAGE_10, value: studentData.average10, studentId: studentId },
        { type: CRITERIA_TYPES.AVERAGE_11, value: studentData.average11, studentId: studentId },
        { type: CRITERIA_TYPES.AVERAGE_12, value: studentData.average12, studentId: studentId }
    ]);
}

const sendRegistrationMail = (student) => {
    //add mail template here
    const message = "Welcome to flow " + student.firstname + "\nCredentials\nusername: " + student.email + "\npassword: " + student.password + "\n";
    sendMail("Flow - Welcome", message, student.email);
}

const removeSensitiveData = (student) => {
    student.email && delete student.email;
    student.password && delete student.password;
    student.tax && delete student.tax;
    student.withdrawPortoflio && delete student.withdrawPortoflio;
    student.credits && delete student.credits;
    student.orderNumber && delete student.orderNumber;
    student.notificationToken && delete student.notificationToken;
    return student;
}

const isEnrolled = async (studentId) => {
    const student = await Student.findOne({
        where: {
            id: studentId,
        },
        attributes: ['enrolled']
    });

    return student.enrolled;
}

const updateCriteria = async (criteria, type, studentId) => {
    Criteria.update(
        {
            value: criteria
        },
        {
            where: {
                type: type,
                studentId: studentId
            }
        });
}

const updateCriterias = async (student, studentId) => {
    const criterias = [];

    student.bacAverage && criterias.push(updateCriteria(student.bacAverage, CRITERIA_TYPES.BAC_AVERAGE, studentId));
    student.bacRomanian && criterias.push(updateCriteria(student.bacRomanian, CRITERIA_TYPES.BAC_RO, studentId));
    student.average9 && criterias.push(updateCriteria(student.average9, CRITERIA_TYPES.AVERAGE_9, studentId));
    student.average10 && criterias.push(updateCriteria(student.average10, CRITERIA_TYPES.AVERAGE_10, studentId));
    student.average11 && criterias.push(updateCriteria(student.average11, CRITERIA_TYPES.AVERAGE_11, studentId));
    student.average12 && criterias.push(updateCriteria(student.average12, CRITERIA_TYPES.AVERAGE_12, studentId));

    await Promise.all(criterias);
}



const createStudent = async (student) => {

    await validateStudent(student);

    student.password = generateRandomPassword();

    const registeredStudent = await Student.create(student);

    await createCriteria(student, registeredStudent.id);

    return student;
}

const changePassword = async (newPassword, studentId) => {
    if (validatePassword(newPassword)) {
        return await Student.update(
            {
                password: newPassword
            },
            {
                where: {
                    id: studentId,
                },
                individualHooks: true
            }
        );
    }
}

const loadStudent = async (studentId) => {
    return await Student.findOne({
        where: {
            id: studentId,
        },
        attributes: {
            exclude: ['id', 'password']
        },
        include: [
            { model: StudentOption, as: 'options', include: { model: Faculty } },
            { model: Document, as: 'documents' },
            { model: Criteria, as: 'criterias', attributes: ['type', 'value'] }
        ]
    });
}

const updateStudent = async (student, studentId) => {
    if (await !isEnrolled(studentId)) {
        student = removeSensitiveData(student);
        await updateCriterias(student, studentId);
        await Student.update({ ...student }, { where: { id: studentId } });
        return await loadStudent(studentId);
    }
}

module.exports = {
    validateStudent,
    createStudent,
    sendRegistrationMail,
    changePassword,
    loadStudent,
    updateStudent
}