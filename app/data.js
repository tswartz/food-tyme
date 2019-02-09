const TABS = {
    MENU: 'MENU',
    RECIPES: 'RECIPES',
};

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

const EMPTY_DAY = Object.keys(MEALS).reduce((_obj, meal) => {
    _obj[meal] = { checked: false, text: '' };
    return _obj;
}, {});

const EMPTY_WEEK = Object.keys(DAYS).reduce((obj, day) => {
    obj[day] = EMPTY_DAY;
    return obj
}, {});

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

module.exports = {
    TABS,
    DAYS,
    MEALS,
    EMPTY_DAY,
    EMPTY_WEEK,
    validateMenuData,
};
