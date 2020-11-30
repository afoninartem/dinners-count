const artisDB = JSON.parse(localStorage.getItem(`artisDB`)) || {};
let lastUpload =
  JSON.parse(localStorage.getItem(`lastUploadDate`)) ||
  `никогда, загрузите данные`;
//prepare to forming data
let rawDinners;
let fileIsLoaded = false;
const mainArrayOfCompanies = [];

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
    const name = item[7]
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
          meal: item[6] !== `` ? 2 : 1,
        });
      } else {
        company.employees[name].marks.push({
          date: item[0],
          meal: item[6] !== `` ? 2 : 1,
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
                ? (company.employees[imp].group = artisDB[data])
                : ((company.employees[imp].name = data),
                  (company.employees[imp].group = artisDB[data]));
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
  if (str === `Артис`) {
    for (employee in company.employees) {
      const imp = company.employees[employee];
      if (!company.groups.some((el) => el.name === imp.group)) {
        company.groups.push({
          name: imp.group,
          imps: [imp],
          groupTotal: imp.total,
        });
      } else {
        company.groups.forEach((group) => {
          if (group.name === imp.group) {
            group.imps.push(imp);
            group.groupTotal += imp.total;
          }
        });
      }
    }
    company.groups.sort((a, b) => (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0);
    company.groups.forEach(group => {
      group.imps.sort((a, b) => (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0)
    })
  }
  for (group in company.groups) {
    // console.log(company.groups[group]);
    if (company.groups[group].name === undefined)
      company.groups[group].name = `Уволенные и т.д., необходима проверка:`;
  }
  changeMainArray(mainArrayOfCompanies, company);
  return printFinalData(str, company);
};

const printFinalData = (str, company) => {
  const output = document.querySelector(`.output`);
  output.innerHTML = ``;

  if (str === `Артис`) {
    //title
    const companyTitle = document.createElement(`h1`);
    companyTitle.classList.add(`company-title`);
    companyTitle.innerHTML = `<div class="company-title__name">${str}</div><div class="company-title__total">${company.totalTolal}</div><button type="button" class="hbtn hb-border-bottom-br3 artis-dnld">Скачать</button><button class="hbtn hb-border-bottom-br3 artis-print">Распечатать</button>`;
    output.appendChild(companyTitle);

    //main list
    const groupList = document.createElement(`ul`);
    output.appendChild(groupList);
    groupList.classList.add(`artis-group-list`);
    company.groups.forEach((group) => {
      const li = document.createElement(`li`);
      groupList.appendChild(li);
      const details = document.createElement(`details`);
      li.appendChild(details);
      const summary = document.createElement(`summary`);
      summary.innerHTML = `<div>${group.name}</div><div class="to-right-border">${group.groupTotal}</div>`;
      details.appendChild(summary);
      const hiddenList = document.createElement(`ul`);
      details.appendChild(hiddenList);
      group.imps.forEach((imp) => {
        const impLi = document.createElement(`li`);
        hiddenList.appendChild(impLi);
        const impDetails = document.createElement(`details`);
        impLi.appendChild(impDetails);
        const impSummary = document.createElement(`summary`);
        impDetails.appendChild(impSummary);
        const impHiddenList = document.createElement(`ul`);
        impHiddenList.classList.add(`mark-list`);
        impDetails.appendChild(impHiddenList);
        impSummary.innerHTML = `<div>${imp.name}</div><div class="to-right-border">${imp.total}</div>`;
        imp.marks.forEach((mark) => {
          impHiddenList.innerHTML += `<li class="mark-list__li"><div class="item-date">${mark.date}</div><div class="item-meal">${mark.meal}</div></li>`;
        });
      });
    });
  } else {
    //title
    const companyTitle = document.createElement(`h1`);
    companyTitle.classList.add(`company-title`);
    companyTitle.innerHTML = `<div class="company-title__name">${str}</div><div class="company-title__total">${company.totalTolal}</div><button type="button" class="hbtn hb-border-bottom-br3 dnld">Скачать</button>`;
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
      eaterTitle.innerHTML = `<div class="eater">${eater}</div><div class="total to-right-border">${employees[eater].total}</div>`;
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

  //output artis
  if (str === `Артис`) {
    //download artis
    document.querySelector(`.artis-dnld`).addEventListener(`click`, function () {
      let csv = `Компания;${company.name};${company.totalTolal}`;
      csv += `\n`;
      const depts = company.groups;
      depts.forEach((dept) => {
        csv += `Подразделение;${dept.name};${dept.groupTotal}`;
        csv += `\n`;
        dept.imps.forEach((imp) => {
          csv += `Сотрудник;${imp.name};${imp.total}`;
          csv += `\n`;
        });
      });
      var hiddenElement = document.createElement("a");
      hiddenElement.href =
        "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
      hiddenElement.target = "_blank";
      hiddenElement.download = `${company.name}.csv`;
      hiddenElement.click();
    }); 
    
    const addPageRow = (name, meals, title) => {
      const pageRow = document.createElement(`div`);
      pageRow.classList.add(`page__row`);
      const rowName = document.createElement(`div`);
      rowName.classList.add(`cell`);
      rowName.textContent = name;
      const rowMeals = document.createElement(`div`);
      rowMeals.classList.add(`cell`);
      rowMeals.textContent = meals;
      if (title) {
        rowName.classList.add(`title`);
        rowMeals.classList.add(`title`);
      }
      pageRow.appendChild(rowName);
      pageRow.appendChild(rowMeals);
      return pageRow;
    }

    //print artis
    document.querySelector(`.artis-print`).addEventListener(`click`, function () {
      const printBlock = document.querySelector(`.print`);
      let page = document.createElement(`div`);
      page.classList.add(`page`);
      printBlock.appendChild(page);
      let pageRows = 0;
      const artis = mainArrayOfCompanies.filter(company => company.name === `Артис`)[0];
      artis.groups.forEach(dept => {
        const elem = addPageRow(dept.name, dept.groupTotal, true);
        page.appendChild(elem);
        pageRows += 1;
        if (pageRows === 45) {
          const newPage = document.createElement(`div`);
          newPage.classList.add(`page`);
          printBlock.appendChild(newPage);
          pageRows = 0;
          page = printBlock.lastChild;
        }
        dept.imps.forEach(imp => {
          const elem =  addPageRow(imp.name, imp.total, false);
          page.appendChild(elem);
          pageRows += 1;
          if (pageRows === 45) {
            const newPage = document.createElement(`div`);
            newPage.classList.add(`page`);
            printBlock.appendChild(newPage);
            pageRows = 0;
            page = printBlock.lastChild;
          }
        })
      });
      print();
    });
  }

  //download gwd and emul
  const buttons = document.querySelectorAll(`.dnld`);
  buttons.forEach((btn) => {
    btn.addEventListener(`click`, function () {
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
    document.querySelector('.manual').style.display = `none`;
    const rawEmul = Array.from(rawDinners).filter((el) => el[10] === `Эмульсии`);
    return getFinalData(rawEmul, `Эмульком`);
  } else alert(`Загрузите данные из Senesys`);
};

//GoodWood
const getGWD = () => {
  if (fileIsLoaded) {
    document.querySelector('.manual').style.display = `none`;
    const rawGWD = Array.from(rawDinners).filter((el) => el[10] === `Гуд Вуд`);
    return getFinalData(rawGWD, `Гуд Вуд`);
  } else alert(`Загрузите данные из Senesys`);
};

//Artis
const getArtis = () => {
  if (fileIsLoaded) {
    document.querySelector('.manual').style.display = `none`;
    const rawArtis = Array.from(rawDinners).filter((el) => {
      if (el[10] !== `Эмульсии` && el[10] !== `Гуд Вуд`) return el;
    });
    console.log(rawArtis)
    return getFinalData(rawArtis, `Артис`);
  } else alert(`Загрузите данные из Senesys`);
};

const checkUpData = () => {
  const today = thisDate();
  // console.log(today, lastUpload)
  // console.log(today === lastUpload)
  return today === lastUpload;
}

//load dinners list
document.querySelector(`#dinnersList`).onchange = function () {
  if (checkUpData()) {
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
  } else {
    alert(`Загрузите данные из 1С`)
  }
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
    lastUpload = thisDate();
    localStorage.setItem(`lastUploadDate`, JSON.stringify(thisDate()));
    localStorage.setItem(`artisDB`, JSON.stringify(artisDB));
  };
  reader.readAsText(file, "windows-1251");
};
