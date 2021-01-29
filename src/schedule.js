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
            var result = [];
            for (var df = 0; df < root.childNodes.length; df++) {
                var childNode = root.childNodes[df];
                if (childNode.getElementsByClassName) {
                    result = result.concat(Array.prototype.slice.call(childNode.getElementsByClassName(className)));
                }
            }
            return result;
        }
        return Array.prototype.slice.call(root.getElementsByClassName(className));
    }
    return [];
}

export default class Schedule {

    constructor (element) {

        this._element = element;
        
        this.rows = byClass(element, ROW_CLASS);
        this.cells = byClass(element, CELL_CLASS);

        var weekdays = this.weekdays = [];
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
        this._element.addEventListener('click', this, false);
        this._element.addEventListener('mousedown', this, false);
        this._element.addEventListener('mouseup', this, false);
        this._element.addEventListener('mouseover', this, false);
        this._element.addEventListener('mouseout', this, false);
    };

    /**
     * @param {Event} event
     */
    handleEvent(event) {
        switch(event.type) {
            case 'click':
                if (event.target.classList.contains(ROW_CLASS)) {
                    this.onChooseRow(event);
                }
                if (event.target.classList.contains(COLUMN_CLASS)) {
                    this.onChooseColumn(event);
                }
                break;
            case 'mousedown':
                if (event.target.classList.contains(CELL_CLASS)) {
                    this.onMouseDown(event);
                }
                break;
            case 'mouseup':
                if (event.target.classList.contains(CELL_CLASS)) {
                    this.onMouseUp(event);
                }
                break;
            case 'mouseover':
                if (event.target.classList.contains(CELL_CLASS)) {
                    this.onHover(event);
                }
                if (event.target.classList.contains(ROW_CLASS)) {
                    this.onHoveredRow(event, true);
                }
                if (event.target.classList.contains(COLUMN_CLASS)) {
                    this.onHoveredColumn(event, true);
                }
                break;
            case 'mouseout':
                if (event.target.classList.contains(ROW_CLASS)) {
                    this.onHoveredRow(event, false);
                }
                if (event.target.classList.contains(COLUMN_CLASS)) {
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
        var modelSelected = this.modelSelected;
        var modelHovered = this.modelHovered;
        var count = 0;

        this.cells.forEach(function (cell) {
            var weekday = cell.getAttribute(WEEKDAY_ATTR);
            var hour = cell.getAttribute(HOUR_ATTR);
            var selected = modelSelected[weekday][hour];
            var hovered = modelHovered[weekday][hour];

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
        var weekday = event.target.getAttribute(WEEKDAY_ATTR);
        var model = this.modelSelected;
        var hour, select = false;

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
        var hour = event.target.getAttribute(HOUR_ATTR);
        var model = this.modelSelected;
        var select = false;

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

        var weekday = event.target.getAttribute(WEEKDAY_ATTR);

        for (var hour = 0; hour < 24; hour++) {
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

        var hour = event.target.getAttribute(HOUR_ATTR);
        var modelHovered = this.modelHovered;

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

        var weekday = event.target.getAttribute(WEEKDAY_ATTR);
        var hour = event.target.getAttribute(HOUR_ATTR);

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

        var modelSelected = this.modelSelected;
        var select = false;

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
        var weekday = event.target.getAttribute(WEEKDAY_ATTR);
        var hour = event.target.getAttribute(HOUR_ATTR);

        if (!this.selection) {
            return;
        }

        this.selection.end = {
            weekday: weekday,
            hour: hour
        };

        var modelHovered = this.modelHovered = {};
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
        var firsWeekdayIndex =  this.weekdays.indexOf(start.weekday);
        var lastWeekdayIndex = this.weekdays.indexOf(end.weekday);
        var startWeekdayIndex = Math.min(firsWeekdayIndex,lastWeekdayIndex);
        var endWeekdayIndex = Math.max(firsWeekdayIndex,lastWeekdayIndex);

        var startHour = Math.min(end.hour, parseInt(start.hour));
        var endHour = Math.max(end.hour, parseInt(start.hour));

        for (var weekdayIndex = startWeekdayIndex; weekdayIndex <= endWeekdayIndex; weekdayIndex++) {
            var weekday = this.weekdays[weekdayIndex];
            for (var hour = startHour; hour <= endHour; hour++) {
                fn(weekday, hour);
            }
        }
    };

    destroy() {
        window.removeEventListener('mouseup', this.boundOnMouseUp);
        this._element.removeEventListener('click', this, false);
        this._element.removeEventListener('mousedown', this, false);
        this._element.removeEventListener('mouseup', this, false);
        this._element.removeEventListener('mouseover', this, false);
        this._element.removeEventListener('mouseout', this, false);
    }
}