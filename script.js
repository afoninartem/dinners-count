const artisDB = JSON.parse(localStorage.getItem(`artisDB`)) || {};
const lastUpload =
  JSON.parse(localStorage.getItem(`lastUploadDate`)) ||
  `никогда, загрузите данные`;
//prepare to forming data
let rawDinners;
let fileIsLoaded = false;
const mainArrayOfCompanies = [];

const formDBText = () => {
  document.querySelector(
    `.data-base__text`
  ).textContent = `Последняя загрузка данных осуществлялась ${lastUpload}`;
};
formDBText();

const thisDate = () => {
  const date = new Date();
  const day = date.getDate() > 9 ? date.getDate() : `0` + date.getDate();
  let month = date.getMonth() + 1;
  month > 9 ? null : (month = `0` + month);
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

//add or replace company data in the array
const changeMainArray = (arr, obj) => {
  arr.some((el) => el.name === obj.name)
    ? arr.splice(
        arr.findIndex((el) => el.name === obj.name),
        1,
        obj
      )
    : arr.push(obj);
};

//common function for getting final data
const getFinalData = (arr, str) => {
  const company = {};
  company.name = str;
  company.employees = {};
  company.totalTolal = 0;
  arr.forEach((item) => {
    const name = item[6]
      .split(` `)
      .filter((el) => el != ``)
      .join(` `);
    if (name !== ``) {
      if (company.employees[name] === undefined) {
        company.employees[name] = {};
        company.employees[name].name = name;
        company.employees[name].marks = [];
        company.employees[name].total = 0;
        company.employees[name].marks.push({
          date: item[0],
          meal: item[5] !== `` ? 2 : 1,
        });
      } else {
        company.employees[name].marks.push({
          date: item[0],
          meal: item[5] !== `` ? 2 : 1,
        });
      }
    }
  });
  if (str === `Артис`) {
    company.groups = [];
    for (imp in company.employees) {
      if (artisDB.hasOwnProperty(imp)) {
        company.employees[imp].group = artisDB[imp];
      } else {
        for (data in artisDB) {
          const arrData = data.split(` `);
          const arrImp = imp.split(` `);
          if (arrImp[0] === arrData[0]) {
            if (arrImp[1] === arrData[1]) {
              arrImp.length > arrData.length
                ? company.employees[imp].group = artisDB[data]
                : (company.employees[imp].name = data,
                  company.employees[imp].group = artisDB[data]);
            }
          } 
        }
      }
    }
  }
  for (employee in company.employees) {
    company.employees[employee].total = 0;
    for (mark in company.employees[employee].marks) {
      company.employees[employee].total +=
        company.employees[employee].marks[mark].meal;
      company.totalTolal += company.employees[employee].marks[mark].meal;
    }
  }
  for (employee in company.employees) {
    const imp = company.employees[employee];
    if (!company.groups.some(el => el.name === imp.group)) {
      company.groups.push({name: imp.group, imps: [imp], groupTotal: imp.total})
    } else {
      company.groups.forEach(group => {
        if (group.name === imp.group) {
          group.imps.push(imp);
          group.groupTotal += imp.total;
        }
      })
    }
  };
  for (group in company.groups) {
    console.log(company.groups[group])
    if (company.groups[group].name === undefined) company.groups[group].name = `Уволенные и т.д., необходима проверка:`
  }
  changeMainArray(mainArrayOfCompanies, company);
  return printFinalData(arr, str, company);
};

const printFinalData = (arr, str, company) => {
  const output =
    str === `Артис`
      ? document.querySelector(`.artis-block__output`)
      : str === `Гуд Вуд`
      ? document.querySelector(`.gwd-block__output`)
      : document.querySelector(`.emul-block__output`);

  output.innerHTML = ``;

  if (str === `Артис`) {
  } else {
    //title
    const companyTitle = document.createElement(`h1`);
    companyTitle.classList.add(`company-title`);
    companyTitle.innerHTML = `<div class="company-title__name">${str}</div><div class="company-title__total">${company.totalTolal}</div><button type="button" class="dnld">Скачать</button>`;
    output.appendChild(companyTitle);

    //main list
    const employeeList = document.createElement(`ul`);
    employeeList.classList.add(`employee-list`);
    output.appendChild(employeeList);

    //individual lists
    const employees = company.employees;
    for (eater in employees) {
      // console.log(eater)
      // console.log(employees[eater])
      const eaterLi = document.createElement(`li`);
      eaterLi.classList.add(`employee-list__li`);
      const individualList = document.createElement(`details`);
      individualList.classList.add(`indi-list`);
      eaterLi.appendChild(individualList);
      const eaterTitle = document.createElement(`summary`);
      eaterTitle.innerHTML = `<div class="eater">${eater}</div><div class="total">${employees[eater].total}</div>`;
      individualList.appendChild(eaterTitle);
      const markList = document.createElement(`ul`);
      markList.classList.add(`mark-list`);
      employees[eater].marks.forEach((item) => {
        const li = document.createElement(`li`);
        li.classList.add(`mark-list__li`);
        li.innerHTML = `<div class="item-date">${item.date}</div><div class="item-meal">${item.meal}</div>`;
        markList.appendChild(li);
      });
      individualList.appendChild(markList);
      employeeList.appendChild(eaterLi);
    }
  }
  const buttons = document.querySelectorAll(`.dnld`);
  buttons.forEach((btn) => {
    btn.addEventListener(`click`, function () {
      // console.log(company)
      let csv = `${company.name};${company.totalTolal}`;
      csv += `\n`;
      const employees = company.employees;
      for (imp in employees) {
        csv += `${employees[imp].name};${employees[imp].total}`;
        csv += `\n`;
      }
      var hiddenElement = document.createElement("a");
      hiddenElement.href =
        "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
      hiddenElement.target = "_blank";
      hiddenElement.download = `${company.name}.csv`;
      hiddenElement.click();
    });
  });
};

//Emulcom
const getEmul = () => {
  if (fileIsLoaded) {
    const rawEmul = Array.from(rawDinners).filter((el) => el[9] === `Эмульсии`);
    return getFinalData(rawEmul, `Эмульком`);
  } else alert(`Загрузите данные по обедам`);
};

//GoodWood
const getGWD = () => {
  if (fileIsLoaded) {
    const rawGWD = Array.from(rawDinners).filter((el) => el[9] === `Гуд Вуд`);
    return getFinalData(rawGWD, `Гуд Вуд`);
  } else alert(`Загрузите данные по обедам`);
};

//Artis
const getArtis = () => {
  if (fileIsLoaded) {
    const rawArtis = Array.from(rawDinners).filter((el) => {
      if (el[9] !== `Эмульсии` && el[9] !== `Гуд Вуд`) return el;
    });
    return getFinalData(rawArtis, `Артис`);
  } else alert(`Загрузите данные по обедам`);
};

//load dinners list
document.querySelector(`#dinnersList`).onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  fileIsLoaded = true;
  reader.onload = function (progressEvent) {
    rawDinners = this.result
      .split(`\n`)
      .map((el) => el.split(`;`))
      .filter((el) => /\d\d\.\d\d\.\d\d\d\d/g.test(el[0]));
  };
  reader.readAsText(file, `windows-1251`);
};

//load database file
document.getElementById("dataBase").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let primary = this.result.split(`\n`).map((el) => el.split(`;`));
    Array.from(primary).forEach((el) => {
      el[0] != ``
        ? (artisDB[
            el[0]
              .split(` `)
              .filter((el) => el != ``)
              .join(` `)
          ] = el[2])
        : null;
    });
    localStorage.setItem(`lastUploadDate`, JSON.stringify(thisDate()));
    localStorage.setItem(`artisDB`, JSON.stringify(artisDB));
  };
  reader.readAsText(file, "windows-1251");
};
