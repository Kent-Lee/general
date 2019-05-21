module.exports = function(sequelize, DataType) {
    var Scores = sequelize.define('Scores', {
        team: {
            type: DataType.STRING,
            field: 'team',
            allowNull: false
        },
        points: {
            type: DataType.INTEGER,
            field: 'points',
            allowNull: false
        }
    }, {
        timestamps: false
    });
    return Scores;
};

