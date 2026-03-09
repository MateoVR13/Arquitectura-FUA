const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('curso interactivo arquitectura. vr. 28 febrero 2026.pdf');

pdf(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(err => {
    console.error(err);
});
