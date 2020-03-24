const logger = require("../config/appconfig").logger;
const nodemailer = require("nodemailer");
const utf8 = require("utf8");

var fillConfirmationEmailTemplate = function(firstName, workshopList) {
    var htmlWorkshopBullets = "";
    workshopList.forEach(workshop => {
        htmlWorkshopBullets = htmlWorkshopBullets.concat(`<li><span style="font-size:12px"><span style="font-family:verdana,geneva,sans-serif">${workshop}</span></span></li>`);
    });
    const htmlWorkshopList = `<ul>${htmlWorkshopBullets}</ul>`;

    var emailTemplate = `
    <html>
      <head>
        <title></title>
      </head>
      <body aria-readonly="false">
        <p>
          <span style="font-size:12px">
            <span style="font-family:verdana,geneva,sans-serif"
              >Beste ${firstName},
    
              <br />
              <br />
              Je hebt je succesvol ingeschreven voor de volgende workshop(s):
            </span>
          </span>
        </p>
        ${htmlWorkshopList}
        <p>
          <span style="font-size:12px">
            <span style="font-family:verdana,geneva,sans-serif"
              >Met vriendelijke groet,
    
              <br />
              Skool Workshop
            </span>
          </span>
        </p>
        <hr style="width: 500px; margin-left:0;" />
        <img
          alt=""
          src="https://skoolworkshop.nl/wp-content/uploads/2017/05/logo.png"
          style="height:75px; width:233px; margin-top:15px; margin-bottom:15px"
        />
        <p>
          Telefoon: 085 - 0653923
          <br />
          Whatsapp: +31 (0)6 - 28318842
          <br />
          E-mail: info@skoolworkshop.nl
          <br />
          Website:
          <a href="https://skoolworkshop.nl/" target="_blank"
            >www.skoolworkshop.nl</a
          >
        </p>
        <p>
          Volg ons via:
          <br />
          <a href="https://facebook.com/skoolworkshop/" target="_blank"
            >www.facebook.com/skoolworkshop</a
          >
          <br />
          <a href="https://twitter.com/skoolworkshop/" target="_blank"
            >www.twitter.com/skoolworkshop</a
          >
        </p>
      </body>
    </html>
    `

    return emailTemplate;
}

var fillRegisteredLaterEmailTemplate = function(firstName) {
  var emailTemplate = `
  <html>
    <head>
      <title></title>
    </head>
    <body aria-readonly="false">
      <p>
        <span style="font-size:12px">
          <span style="font-family:verdana,geneva,sans-serif"
            >Beste ${firstName},
  
            <br />
            <br />
            Je gekoppelde e-mail adres is succesvol bijgewerkt.
            <br />
            <br />
          </span>
        </span>
        <span style="font-size:12px">
          <span style="font-family:verdana,geneva,sans-serif"
            >Met vriendelijke groet,
  
            <br />
            Skool Workshop
          </span>
        </span>
      </p>
      <hr style="width: 500px; margin-left:0;" />
      <img
        alt=""
        src="https://skoolworkshop.nl/wp-content/uploads/2017/05/logo.png"
        style="height:75px; width:233px; margin-top:15px; margin-bottom:15px"
      />
      <p>
        Telefoon: 085 - 0653923
        <br />
        Whatsapp: +31 (0)6 - 28318842
        <br />
        E-mail: info@skoolworkshop.nl
        <br />
        Website:
        <a href="https://skoolworkshop.nl/" target="_blank"
          >www.skoolworkshop.nl</a
        >
      </p>
      <p>
        Volg ons via:
        <br />
        <a href="https://facebook.com/skoolworkshop/" target="_blank"
          >www.facebook.com/skoolworkshop</a
        >
        <br />
        <a href="https://twitter.com/skoolworkshop/" target="_blank"
          >www.twitter.com/skoolworkshop</a
        >
      </p>
    </body>
  </html>
  `

  return emailTemplate;
}

function sendEmail(type, destination, firstName, workshopList=[]) {
  logger.trace("sendConfirmationEmail called");

  const testDestination = "neus2benen@gmail.com";
  const testName = "Gilbert";
  const testList = ["Stampen", "Klappen", "Juichen"];
  
  var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'skoolworkshopnoreply@gmail.com',
        pass: 'skoolworkshop'
      }
    });

  var emailBody = "";

  if (type == "CONFIRMATION") {
    // emailBody = utf8.encode(utils.fillConfirmationEmailTemplate(firstName, workshopList))
    emailBody = utf8.encode(utils.fillConfirmationEmailTemplate(testName, testList))
  }
  else if (type == "REGISTEREDLATER") {
    // emailBody = utf8.encode(utils.fillRegisteredLaterEmailTemplate(firstName))
    emailBody = utf8.encode(utils.fillRegisteredLaterEmailTemplate(testName))
  }
  else {
    res.status(400).json({
      "error": "invalid type"
    }).end();
  }

  
    
  var mailOptions = {
    from: 'noreply@skoolworkshop.nl',
    to: testDestination,
    headers: {'Content-Type': 'text/html; charset=UTF-8'},
    subject: 'Skool Workshop bevestiging',
    html: emailBody
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        logger.error('Error: ' + error.message);
        const err = {
            "code": 400,
            "message": error.message
        };
        next(err);
    } else {
        logger.trace("Email sent successfully.");
    }
  });
  res.status(200).json({
    "status": "ok"
  }).end();
}


module.exports = {
    fillConfirmationEmailTemplate: fillConfirmationEmailTemplate,
    fillRegisteredLaterEmailTemplate: fillRegisteredLaterEmailTemplate,
    sendEmail: sendEmail
}