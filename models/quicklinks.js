const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    epublic:{
            type:Boolean,
            require:true
    }
});

const quickLinkSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    links: [linkSchema]
})


module.exports = mongoose.model('QuickLink', quickLinkSchema);
