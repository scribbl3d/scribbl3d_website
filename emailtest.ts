const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    to: "riya.rg3010@gmail.com",
    from: {
        email: "supplychain@scribbl3d.com",
        name: "Scribbl3D",
    },
    subject: "First automated message",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};
sgMail
    .send(msg)
    .then(() => {
        console.log("Email sent");
    })
    .catch((error) => {
        console.error(error);
    });
