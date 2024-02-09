class StringUtils {
    /**
     * Generates a random string of (length) length.
     * @param {number} length 
     * @returns {string} Generated String
     */
    stringGenerator(length = 32) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return str;
    }

    /**
     * Converts a number into a string with commas
     * Example: 130456 -> 130,456
     * @param {number} num 
     * @returns {string}
     */
    comma(num) {
        if (!num) return "0";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Converts the number into smaller form:
     * Examples:
     * 1357283 -> 1.4M
     * 1357 -> 1.4K
     * @param {number} num 
     * @returns {string}
     */
    formatNumberSmall(num) {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        } else {
            return this.comma(num);
        }
    }

    /**
     * Generates a table-like format from tabular rows
     * @param {[...[...string]]} rows 
     * @param {number} padding
     * @param {number} minimumWidth
     * @param {boolean} alignRight
     * @returns {string}
     */
    stringTable(rows, padding = 3, minimumWidth = 5, alignRight = false) {
        let cellWidth = [];
        
        rows.forEach(row => {
            row.forEach((cell, cellNum) => {
                if (!cellWidth[cellNum]) cellWidth[cellNum] = minimumWidth;
                if (cellWidth[cellNum] < cell.length + padding) cellWidth[cellNum] = String(cell).length + padding;
            });
        });
        
        let result = "";

        rows.forEach(row => {
            if (result !== "") result += "\n";

            row.forEach((cell, cellNum) => {
                if (!alignRight) result += " ".repeat(Math.max(cellWidth[cellNum] - cell.length), 0);
                
                result += cell;

                if (alignRight) result += " ".repeat(Math.max(cellWidth[cellNum] - cell.length), 0);
            })
        });

        return result;
    }

    /**
     * 
     * @param {Date} date 
     * @returns {string}
     */
    formatTime(date) {
        let hours = String(date.getHours());
        let minutes = String(date.getMinutes());
        let seconds = String(date.getSeconds());

        if (hours.length < 2)
            hours = "0" + hours;
        if (minutes.length < 2)
            minutes = "0" + minutes;
        if (seconds.length < 2)
            seconds = "0" + seconds;

        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * @param {Number} day - 0-6 as a representation of the day of the week (0 = Sunday)
     * @returns {String} The corresponding day of the week as a 3 character String
    */
    parseDay(day) {
        let result = "";

        switch (day) {
            case 0:
                result = "Sun";
                break;
            case 1:
                result = "Mon";
                break;
            case 2:
                result = "Tue";
                break;
            case 3:
                result = "Wed";
                break;
            case 4:
                result = "Thu";
                break;
            case 5:
                result = "Fri";
                break;
            case 6:
                result = "Sat";
        }

        return result;
    }

    /**
     * Parses date from a timestamp to MM:DD:YY HH:MM:SS
     * @param { Number | String | Date | undefined } timestamp - The timestamp to parse, if provided, otherwise the current time is parsed
     * @returns {String} The parsed Date in the format MM:DD:YY HH:MM:SS
     */
    parseDate(timestamp) {
        let dte = new Date(timestamp);

        let hr = "" + dte.getHours();
        let mn = "" + dte.getMinutes();
        let sc = "" + dte.getSeconds();

        if (hr.length === 1) hr = "0" + hr;
        if (mn.length === 1) mn = "0" + mn;
        if (sc.length === 1) sc = "0" + sc;

        let mo = "" + (dte.getMonth() + 1);
        let dy = "" + dte.getDate();
        let yr = dte.getFullYear();

        if (mo.length === 1) mo = "0" + mo;
        if (dy.length === 1) dy = "0" + dy;

        return `${this.parseDay(dte.getDay())} ${mo}.${dy}.${yr} ${hr}:${mn}:${sc}`;
    }

    /**
     * Formats a time (in seconds) to a clock HH:MM:SS
     * @param {number} time 
     */
    formatElapsed(time) {
        let hour = Math.floor(time / 60 / 60);
        time -= hour * 60 * 60;
        let minute = Math.floor(time / 60);
        time -= minute * 60;
        let second = time;

        hour = String(hour);
        minute = String(minute);
        second = String(second);

        if (hour.length === 1) hour = "0" + hour;
        if (minute.length === 1) minute = "0" + minute;
        if (second.length === 1) second = "0" + second;
        return `${hour}:${minute}:${second}`;
    }

    /**
     * Escapes all RegExp characters
     * @param {string} str
     * @returns {string}
     */
    escapeRegExp(str) {
        return String(str).replace(/[.*+?^${}()|[\]\\]/g, "");
    }
}

module.exports = StringUtils;
