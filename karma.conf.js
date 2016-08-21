var karmaConfig = require('./apy.conf').gulp.karma;
module.exports = function(config) {
    config.set(karmaConfig);
};
