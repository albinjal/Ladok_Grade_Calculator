const targetURL = 'https://www.student.ladok.se/student/#/avslutade';

const calcGrades = async (retries) => {
  courses = window.document.getElementsByTagName('ladok-avslutad-kurs');
  let totalCourses = 0;
  let totalCredits = 0;
  let biastSum = 0;
  let unbiastSum = 0;

  for (course of courses) {
    try {
      const gText = course.getElementsByTagName('strong')[0].innerText;
      const grade = parseInt(gText[gText.length - 1]);

      const cInfo = course.getElementsByTagName('h4')[0].innerText.split('|');
      const credits = parseFloat(cInfo[cInfo.length - 2].trim().split(' ')[0]);

      totalCourses++;
      totalCredits += credits;

      biastSum += credits * grade;
      unbiastSum += grade;
    } catch (error) {
      console.error(error);
      continue;
    }
  }

  const biastGrade = biastSum / totalCredits;
  const unbiastGrade = unbiastSum / totalCourses;

  return new Promise((resolve, reject) => {
    if (biastGrade && unbiastGrade) {
      return resolve({ biastGrade, unbiastGrade });
    }
    setTimeout(async () => {
      if (retries === 10) {
        return reject('Too many retires');
      }
      return resolve(await calcGrades(retries + 1));
    }, 500);
  });
};

const createHtml = (language, biast, unbiast, decimals) => {
  biast = biast.toFixed(decimals);
  unbiast = unbiast.toFixed(decimals);

  switch (language) {
    case 'sv': {
      return `
      <strong>
      Medelbetyg<br>
      Viktat: ${biast}<br>
      Oviktat: ${unbiast}
      </strong>
      `;
    }
    default: {
      return `
      <strong>
      Average grade<br>
      Biast: ${biast}<br>
      Unbiast: ${unbiast}
      </strong>
      `;
    }
  }
};

const displayResults = (html) => {
  const cardList = document.getElementsByClassName('col-sm-5')[0];
  boilerplate = cardList.firstElementChild.cloneNode(true);
  body = boilerplate.getElementsByClassName('card-body')[0];
  body.innerHTML = html;
  cardList.append(boilerplate);
};

const main = async () => {
  const decimals = 2;
  const lang = document.documentElement.lang;
  const grades = await calcGrades(0);
  const html = createHtml(
    lang,
    grades.biastGrade,
    grades.unbiastGrade,
    decimals
  );
  displayResults(html);
};

if (window.location.href === targetURL) {
  main();
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'url-change') {
    if (request.url === targetURL) {
      main();
    }
  }
});
