modele.exports=function(sequelize,DataTypes){
const PaymentMethod = sequelize.define("payment_methods",

    {
        id: {
            type: DataTypes.SMALLINT,
            autoIncrement:true, 
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING[32]
        },
        create_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            type: DataTypes.DATE
        },
        deleted_at: {
            type: DataTypes.DATE
        },
    })
PaymentMethod.associate = function (models) {
    PaymentMethod.hasMany(models.Purchase, {
        as: "purchases",
        foreingKey: "payment_method_id"
    })
}

return PaymentMethod}