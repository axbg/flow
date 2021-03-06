const User = require('../models').User;
const Role = require('../models').Role;
const Faculty = require('../models').Faculty;
const FacultyProfile = require('../models').FacultyProfile;
const Position = require('../models').Position;

module.exports = async () => {
  const roles = await Role.findAll({});

  if (roles.length === 0) {
    await Role.bulkCreate([
      { role: 'VOLUNTEER' },
      { role: 'CASHIER' },
      { role: 'OPERATOR' },
      { role: 'ADMIN' },
    ]);

    await Faculty.bulkCreate([
      { name: 'CSIE', budget: 150, tax: 210, currentOrderNumber: 35 },
      { name: 'FABBV', budget: 110, tax: 120 },
      { name: 'FABIZ', budget: 35, tax: 50 },
      { name: 'EAM', budget: 90, tax: 110 },
      { name: 'ETA', budget: 70, tax: 10 },
    ]);

    await FacultyProfile.bulkCreate([
      { name: 'CSIE - Economic Informatics', type: 'B', availablePositions: 100, busyPositions: 0, facultyId: 1 },
      { name: 'CSIE - Economic Informatics', type: 'T', availablePositions: 210, busyPositions: 0, facultyId: 1 },
      { name: 'CSIE - Economic Cybernetics', type: 'B', availablePositions: 120, busyPositions: 0, facultyId: 1 },
      { name: 'CSIE - Economic Cybernetics', type: 'T', availablePositions: 230, busyPositions: 0, facultyId: 1 },
      { name: 'CSIE - Statistics', type: 'B', availablePositions: 90, busyPositions: 0, facultyId: 1 },
      { name: 'CSIE - Statistics', type: 'T', availablePositions: 110, busyPositions: 0, facultyId: 1 },
    ]);

    await Position.bulkCreate([
      { position: 'EXTERIOR', facultyId: 1 },
      { position: 'ENTRY_DOOR', facultyId: 1 },
      { position: 'FIRST FLOOR', facultyId: 1 },
      { position: 'SECOND FLOOR', facultyId: 1 },
      { position: 'COMPUTERS ROOM', facultyId: 1 },
    ]);

    await User.create({ username: 'admin', password: 'admin', roleId: 4, facultyId: 1 });
    await User.create({ username: 'volunteer', password: 'volunteer', roleId: 1, facultyId: 1, positionId: 2 });
    await User.create({ username: 'cashier', password: 'cashier', roleId: 2, facultyId: 1 });
    await User.create({ username: 'operator', password: 'operator', roleId: 3, facultyId: 1 });
  }
};
