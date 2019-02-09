const fs = require('fs');
const lodash = require('lodash');
const { DAYS, MEALS, EMPTY_DAY, EMPTY_WEEK, validateMenuData } = require('./data');

let menuData = EMPTY_WEEK;

function saveMenuData() {
    fs.writeFile(`${__dirname}/menuData.txt`, JSON.stringify(menuData), function (err) {
        if (err) throw err;
        console.log('saved', menuData);
    });
}

const debouncedSaveMenuData = lodash.debounce(saveMenuData, 500);

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
    menuData[day] = EMPTY_DAY;
    renderMenu();
    debouncedSaveMenuData();
}

function onClearWeekClick() {
    menuData = EMPTY_WEEK;
    renderMenu();
    debouncedSaveMenuData();
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

document.addEventListener('DOMContentLoaded', function(){
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
});
