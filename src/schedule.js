/**
 * CONST
 */
const ROW_CLASS = 'js-schedule-day';
const CELL_CLASS = 'js-schedule-cell';
const COLUMN_CLASS = 'js-schedule-hour';
const SELECTED_CLASS = '__selected';
const HOVERED_CLASS = '__hovered';
const WEEKDAY_ATTR = 'data-weekday';
const HOUR_ATTR = 'data-hour';

/**
 * @param {HTMLElement} root
 * @param {string} className
 * @returns {HTMLElement[]}
 */
function byClass(root, className) {
    if (root) {
        if (root.nodeType === 11) { // == Node.DOCUMENT_FRAGMENT_NODE
            let result = [];
            for (let df = 0; df < root.childNodes.length; df++) {
                let childNode = root.childNodes[df];
                if (childNode.getElementsByClassName) {
                    result = result.concat([...childNode.getElementsByClassName(className)]);
                }
            }
            return result;
        }
        return [...root.getElementsByClassName(className)];
    }
    return [];
}

export default class Schedule {

    constructor (element) {

        this.__element = element;
        
        this.rows = byClass(element, ROW_CLASS);
        this.cells = byClass(element, CELL_CLASS);

        let weekdays = this.weekdays = [];
        this.rows.forEach(function (row) {
            weekdays.push(row.getAttribute(WEEKDAY_ATTR));
        });
        
        this.modelSelected = {};
        this.modelHovered = {};

        this.weekdays.forEach((weekday) => {
            this.modelSelected[weekday] = [];
            this.modelHovered[weekday] = [];
        });

        this.boundOnMouseUp = this.onMouseUp.bind(this);
        window.addEventListener('mouseup', this.boundOnMouseUp);
        this.__element.addEventListener('click', this);
        this.__element.addEventListener('mousedown', this);
        this.__element.addEventListener('mouseup', this);
        this.__element.addEventListener('mouseover', this);
        this.__element.addEventListener('mouseout', this);
    };

    /**
     * @param {Event} event
     */
    handleEvent(event) {
        let target = event.target.classList;
        switch(event.type) {
            case 'click':
                if (target.contains(ROW_CLASS)) {
                    this.onChooseRow(event);
                }
                if (target.contains(COLUMN_CLASS)) {
                    this.onChooseColumn(event);
                }
                break;
            case 'mousedown':
                if (target.contains(CELL_CLASS)) {
                    this.onMouseDown(event);
                }
                break;
            case 'mouseup':
                if (target.contains(CELL_CLASS)) {
                    this.onMouseUp(event);
                }
                break;
            case 'mouseover':
                if (target.contains(CELL_CLASS)) {
                    this.onHover(event);
                }
                if (target.contains(ROW_CLASS)) {
                    this.onHoveredRow(event, true);
                }
                if (target.contains(COLUMN_CLASS)) {
                    this.onHoveredColumn(event, true);
                }
                break;
            case 'mouseout':
                if (target.contains(ROW_CLASS)) {
                    this.onHoveredRow(event, false);
                }
                if (target.contains(COLUMN_CLASS)) {
                    this.onHoveredColumn(event, false);
                }
                break;
        }
    }

    /**
     * @param {Object} model
     */
    setDefaults(model) {
        this.weekdays.forEach(function (weekday) {
            if (!model[weekday]) {
                model[weekday] = {};
            }
        });
    };

    /**
     *
     */
    render() {
        let modelSelected = this.modelSelected;
        let modelHovered = this.modelHovered;
        let count = 0;

        this.cells.forEach(function (cell) {
            let weekday = cell.getAttribute(WEEKDAY_ATTR);
            let hour = cell.getAttribute(HOUR_ATTR);
            let selected = modelSelected[weekday][hour];
            let hovered = modelHovered[weekday][hour];

            if (selected) {
                count += 1;
            }

            cell.classList.toggle(SELECTED_CLASS, selected === true);
            cell.classList.toggle(HOVERED_CLASS, hovered === true);
        });
    };

    /**
     * @param {Event} event
     */
    onChooseRow(event) {
        let weekday = event.target.getAttribute(WEEKDAY_ATTR);
        let model = this.modelSelected;
        let hour, select = false;

        for (hour = 0; hour < 24; hour++) {
            if (!model[weekday][hour.toString()]) {
                select = true;
            }
        }

        for (hour = 0; hour < 24; hour++) {
            model[weekday][hour.toString()] = select;
        }

        this.render();
    };

    /**
     * @param {Event} event
     */
    onChooseColumn(event) {
        let hour = event.target.getAttribute(HOUR_ATTR);
        let model = this.modelSelected;
        let select = false;

        this.weekdays.forEach(function (weekday) {
            if (!model[weekday][hour]) {
                select = true;
            }
        });

        this.weekdays.forEach(function (weekday) {
            model[weekday][hour] = select;
        });

        this.render();
    };

    /**
     * @param {Boolean} flag
     * @param {Event} event
     */
    onHoveredRow(event, flag) {
        if (this.start || this.end) {
            return;
        }

        let weekday = event.target.getAttribute(WEEKDAY_ATTR);

        for (let hour = 0; hour < 24; hour++) {
            this.modelHovered[weekday][hour] = flag;
        }

        this.render();
    };

    /**
     * @param {Event} event
     * @param {Boolean} flag
     */
    onHoveredColumn(event, flag) {
        if (this.selection) {
            return;
        }

        let hour = event.target.getAttribute(HOUR_ATTR);
        let modelHovered = this.modelHovered;

        this.weekdays.forEach(function (weekday) {
            modelHovered[weekday][hour] = flag;
        });

        this.render();
    };

    /**
     * @param {Event} event
     */
    onMouseDown(event) {
        event.preventDefault();

        let weekday = event.target.getAttribute(WEEKDAY_ATTR);
        let hour = event.target.getAttribute(HOUR_ATTR);

        this.selection = {
            start: {
                weekday: weekday,
                hour: hour
            },

            end: {
                weekday: weekday,
                hour: hour
            }
        };
    };

    /**
     *
     */
    onMouseUp() {
        if (!this.selection) {
            return;
        }

        let modelSelected = this.modelSelected;
        let select = false;

        this.overRectangle(this.selection.start, this.selection.end, function (weekday, hour) {
            if (!modelSelected[weekday][hour]) {
                select = true;
            }
        });

        this.overRectangle(this.selection.start, this.selection.end, function (weekday, hour) {
            modelSelected[weekday][hour] = select;
        });

        this.modelHovered = {};
        this.setDefaults(this.modelHovered);

        this.selection = null;

        this.render();
    };

    /**
     * @param {Event} event
     */
    onHover(event) {
        let weekday = event.target.getAttribute(WEEKDAY_ATTR);
        let hour = event.target.getAttribute(HOUR_ATTR);

        if (!this.selection) {
            return;
        }

        this.selection.end = {
            weekday: weekday,
            hour: hour
        };

        let modelHovered = this.modelHovered = {};
        this.setDefaults(this.modelHovered);

        this.overRectangle(this.selection.start, this.selection.end, function (weekday, hour) {
            modelHovered[weekday][hour] = true;
        });

        this.render();
    };

    /**
     * @param {Object} start
     * @param {Object} end
     * @param {Function} fn
     */
    overRectangle(start, end, fn) {
        let firsWeekdayIndex =  this.weekdays.indexOf(start.weekday);
        let lastWeekdayIndex = this.weekdays.indexOf(end.weekday);
        let startWeekdayIndex = Math.min(firsWeekdayIndex,lastWeekdayIndex);
        let endWeekdayIndex = Math.max(firsWeekdayIndex,lastWeekdayIndex);

        let startHour = Math.min(end.hour, parseInt(start.hour));
        let endHour = Math.max(end.hour, parseInt(start.hour));

        for (let weekdayIndex = startWeekdayIndex; weekdayIndex <= endWeekdayIndex; weekdayIndex++) {
            let weekday = this.weekdays[weekdayIndex];
            for (let hour = startHour; hour <= endHour; hour++) {
                fn(weekday, hour);
            }
        }
    };

    destroy() {
        window.removeEventListener('mouseup', this.boundOnMouseUp);
        this.__element.removeEventListener('click', this, false);
        this.__element.removeEventListener('mousedown', this, false);
        this.__element.removeEventListener('mouseup', this, false);
        this.__element.removeEventListener('mouseover', this, false);
        this.__element.removeEventListener('mouseout', this, false);
    }
}