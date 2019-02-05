const fs = require('fs');
const lodash = require('lodash');

const DAYS = {
    MONDAY: 'MONDAY',
    TUESDAY: 'TUESDAY',
    WEDNESDAY: 'WEDNESDAY',
    THURSDAY: 'THURSDAY',
    FRIDAY: 'FRIDAY',
    SATURDAY: 'SATURDAY',
    SUNDAY: 'SUNDAY',
};

const MEALS = {
    BREAKFAST: 'BREAKFAST',
    LUNCH: 'LUNCH',
    DINNER: 'DINNER',
};

let menuData = {};

function saveMenuData() {
    fs.writeFile('menuData.txt', JSON.stringify(menuData), function (err) {
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

function renderMeal(day, meal) {
    const mealContainer = document.createElement('div');
    mealContainer.setAttribute('class', 'meal');
    const mealData = menuData[day][meal];
    mealContainer.innerHTML = `
        <span>
            <input
                data-meal="${day}-${meal}-checked"
                type="checkbox"
                onclick="onCheckboxChange('${day}', '${meal}')"
                ${mealData.checked ? 'checked' : ''}>
            <span class="meal-label">${getTitleCasedString(meal)}</span>
        </span>
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
    const dayLabel = document.createElement('div');
    dayLabel.setAttribute('class', 'day-label');
    dayLabel.innerHTML = day;
    dayContainer.appendChild(dayLabel);
    Object.keys(MEALS).forEach(meal => {
        dayContainer.appendChild(renderMeal(day, meal));
    });
    return dayContainer;
}

function renderMenu() {
    const container = document.getElementById('container');
    Object.keys(DAYS).forEach((day, index) => {
        container.appendChild(renderDay(day));
        if (index < Object.keys(DAYS).length - 1) {
            container.appendChild(document.createElement('hr'));
        }
    });
}

function validateMenuData(parsedData) {
    for (const dayKey of Object.keys(DAYS)) {
        const day = parsedData[dayKey];
        if (!day) {
            return false;
        }
        for (const mealKey of Object.keys(MEALS)) {
            if (!day[mealKey]) {
                return false;
            }
        }
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function(){
    menuData = Object.keys(DAYS).reduce((obj, day) => {
        obj[day] = Object.keys(MEALS).reduce((_obj, meal) => {
            _obj[meal] = { checked: false, text: '' };
            return _obj;
        }, {});
        return obj
    }, {});
    fs.readFile('menuData.txt', (err, data) => { 
        if (err) throw err; 
        try {
            const rawData = data.toString() || "{}";
            const parsedData = JSON.parse(rawData);
            if (validateMenuData(parsedData)) {
                menuData = parsedData;
            }
        } catch (e) {
            console.log('error while reading saved menu data');
        }
        renderMenu();
    });
});
