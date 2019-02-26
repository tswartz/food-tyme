const fs = require('fs');
const lodash = require('lodash');
const { TABS, DAYS, MEALS, EMPTY_DAY, EMPTY_WEEK, validateMenuData } = require('./data');
const { updateLinks } = require('./linkify');

let activeTabId = TABS.MENU;
let menuData = clone(EMPTY_WEEK);

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function saveMenuData() {
    fs.writeFile(`${__dirname}/menuData.txt`, JSON.stringify(menuData), function (err) {
        if (err) throw err;
        console.log('saved', menuData);
    });
}

function saveRecipesData(data) {
    fs.writeFile(`${__dirname}/recipesData.txt`, data, function (err) {
        if (err) throw err;
        console.log('saved', data);
    });
}

const debouncedSaveMenuData = lodash.debounce(saveMenuData, 500);
const debouncedSaveRecipesData = lodash.debounce(saveRecipesData, 500);

function getTitleCasedString(str) {
    return str.charAt(0).concat(str.slice(1).toLowerCase())
}

function onCheckboxChange(day, meal) {
    const checkbox = document.querySelector(`input[data-meal="${day}-${meal}-checked"]`);
    if (checkbox) {
        menuData[day][meal]['checked'] = checkbox.checked;
        debouncedSaveMenuData();
    }
}

function onTextChange(day, meal) {
    const textInput = document.querySelector(`input[data-meal="${day}-${meal}-text"]`);
    if (textInput) {
        menuData[day][meal]['text'] = textInput.value;
        debouncedSaveMenuData();
    }
}

function onClearDayClick(day) {
    menuData[day] = clone(EMPTY_DAY);
    renderMenu();
    debouncedSaveMenuData();
}

function onClearWeekClick() {
    menuData = clone(EMPTY_WEEK);
    renderMenu();
    debouncedSaveMenuData();
}

const ENTER_KEY_CODE = 32;

function onRecipeTextChange(event) {
    const textArea = document.getElementById('recipes-content');
    if (event.keyCode === ENTER_KEY_CODE) {
        updateLinks(textArea);
    }
    debouncedSaveRecipesData(textArea.innerHTML);
}

function renderMeal(day, meal) {
    const mealContainer = document.createElement('div');
    mealContainer.setAttribute('class', 'meal');
    const mealData = menuData[day][meal];
    mealContainer.innerHTML = `
        <label class="checkbox-container">
            <input
                data-meal="${day}-${meal}-checked"
                type="checkbox"
                onclick="onCheckboxChange('${day}', '${meal}')"
                ${mealData.checked ? 'checked' : ''}>
            <span class="checkmark"></span>
        </label>
        <div class="meal-label">${getTitleCasedString(meal)}</div>        
        <input
            onkeyup="onTextChange('${day}', '${meal}')"
            data-meal="${day}-${meal}-text"
            class="meal-input"
            value="${mealData.text}"
        />
    `;
    return mealContainer;
}

function renderDay(day) {
    const dayContainer = document.createElement('div');
    dayContainer.setAttribute('class', 'day')
    dayContainer.innerHTML = `
        <div class="day-label">
            <h5>${getTitleCasedString(day)}</h5>
            <a onclick="onClearDayClick('${day}')">Clear</a>
        </div>
    `;
    Object.keys(MEALS).forEach(meal => {
        dayContainer.appendChild(renderMeal(day, meal));
    });
    return dayContainer;
}

function renderMenu() {
    const container = document.getElementById('container');
    container.innerHTML = '';
    Object.keys(DAYS).forEach((day, index) => {
        container.appendChild(renderDay(day));
        if (index < Object.keys(DAYS).length - 1) {
            container.appendChild(document.createElement('hr'));
        }
    });
}

function setActiveTab(tabId) {
    activeTabId = tabId;
    const tabs = document.getElementsByClassName('tab');
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("is--active");
    }
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }
    document.querySelector(`.tab[data-tab-id="${tabId}"]`).classList.add('is--active');
    document.querySelector(`.tab-content[data-tab-id="${tabId}"]`).style.display = "block";
}

document.addEventListener('DOMContentLoaded', function(){
    setActiveTab(activeTabId);
    fs.readFile(`${__dirname}/menuData.txt`, (err, data) => { 
        try {
            const rawData = data && data.toString();
            const parsedData = JSON.parse(rawData || "{}");
            if (validateMenuData(parsedData)) {
                menuData = parsedData;
            }
        } catch (e) {
            console.log('error while reading saved menu data');
        }
        renderMenu();
        if (err) throw err;
    });
    fs.readFile(`${__dirname}/recipesData.txt`, (err, data) => { 
        try {
            const rawData = data ? data.toString() : '';
            const textArea = document.getElementById('recipes-content');
            textArea.innerHTML = rawData;
        } catch (e) {
            console.log('error while reading saved recipes data');
        }
        renderMenu();
        if (err) throw err;
    });
});
