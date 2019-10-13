import '../styles/index.scss';

import Mustache from 'mustache';

import RawMailThread from '../raw-mail-thread.json';
import RawMail from '../raw-mail.json';

const data = {
  header: {
    title: "Re: Hello Nate",
    metas: [
      {
        title: 'MAIL TYPE',
        subtitle: 'Consultants Advice Notice'
      },
      {
        title: 'MAIL NUMBER',
        subtitle: 'MAJ-CAN-000004'
      },
      {
        title: 'REFERENCE NUMBER',
        subtitle: 'MAJ-CAN-000004'
      }
    ],
    info: [
      {
        title: 'From',
        value: 'Nate Harrison - Majestic Builders'
      },
      {
        title: 'To',
        value: 'Test1 User - Majestic Builders'
      },
      {
        title: 'Sent',
        value: 'Wednesday, 12 September 2012 5:47:47 PM AEST (GMT +10:00)'
      },
      {
        title: 'Status',
        value: 'N/A'
      },
    ],
  },
  attachments: {
    files: [
      {
        name: 'OutlookEmail.msg',
      },
      {
        name: 'GMail.msg',
      },
      {
        name: 'OtherMails.msg',
      }
    ],
    mails: [
      {
        number: 'MAJ-CAN-000004',
        subject: 'Re: Hello Nate',
        from: 'Nate Harrison - Majestic Builders',
        sent: '12/09/2012'
      },
      {
        number: 'MAJ-CAN-000006',
        subject: 'Re: Hello Nate',
        from: 'Nate Harrison - Majestic Builders',
        sent: '12/09/2012'
      }
    ],
    docs: [
      {
        file: 'icon',
        number: '002-7029-C-0003',
        revision: 'A',
        revisionDate: '20/09/2012',
        title: 'Revised Drawing',
        status: 'For Approval'
      },
      {
        file: 'icon',
        number: '002-7029-C-0004',
        revision: 'A',
        revisionDate: '20/09/2012',
        title: 'Revised Drawing',
        status: 'For Approval'
      },
      {
        file: 'icon',
        number: '002-7029-C-0005',
        revision: 'A',
        revisionDate: '20/09/2012',
        title: 'Revised Drawing',
        status: 'For Approval'
      }
    ],
    numberOfFiles: () => data.attachments
      && data.attachments.files
      && data.attachments.files.length || 0,
    numberOfMails: () => data.attachments
      && data.attachments.mails
      && data.attachments.mails.length || 0,
    numberOfDocs: () => data.attachments
      && data.attachments.docs
      && data.attachments.docs.length || 0
  }
};

const attachMail = (thread, mail) => {
  const mailId = mail.MailId;
  Object.entries(thread).forEach(([key, value]) => {
    if (key === 'MailId' && value === mailId) {
      Object.entries(mail).forEach(([key, value]) => {
        thread[key] = value;
      });
    } else if (typeof value === 'object') {
      thread[key] = attachMail(value, mail);
    }
  });
  return thread;
};
const beautifyJSON = (raw) => {
  const fixValues = ['ReplyType', 'AttributeTypeNames', 'AttributeType', 'ApprovalStatus', 'Attribute1'];
  Object.entries(raw).forEach(([key, value]) => {
    if (key === '$') {
      raw[Object.keys(value)[0]] = Object.values(value)[0];
      delete raw[key];
    } else if (key === 'InRefTo') {
      raw[key] = Object.values(value[0]['$'])[0];
    } else if (fixValues.includes(key)) {
      raw[key] = beautifyJSON(value[0]);
    } else if (typeof value === 'object') {
      raw[key] = beautifyJSON(value);
    }
  });
  return raw;
};
const readyForOutput = () => {
  let mailThread = beautifyJSON(RawMailThread);
  const mails = beautifyJSON(RawMail);

  mails.forEach(mail => {
    mailThread = attachMail(mailThread, mail);
  });
  console.log(mailThread);
  // document.getElementById('output').innerHTML = JSON.stringify(attachMail(mailThread, mail), undefined, 2);

  const source = document.getElementById("email-template").innerHTML;
  const template = Mustache.render(source, data);
  document.getElementById('output').innerHTML = template;
};


readyForOutput();