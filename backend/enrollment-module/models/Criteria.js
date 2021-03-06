module.exports = (sequelize, DataTypes) => {
  return sequelize.define('criteria', {
    'type': {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    'value': {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });
};
