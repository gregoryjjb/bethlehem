module.exports = (sequelize, DataTypes) => {
    const Playlist = sequelize.define('Playlist', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        }
    });
    
    Playlist.associate = models => {
        models.Playlist.hasMany(models.Show);
    }
    
    return Playlist;
}