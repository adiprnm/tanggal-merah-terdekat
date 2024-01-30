async function getNearestPublicHoliday() {
    let response = await fetch("https://api-harilibur.vercel.app/api")
    let holidays = await response.json()
    holidays = holidays.sort(
        (first, second) => {
            let firstDate = new Date(first.holiday_date)
            let secondDate = new Date(second.holiday_date)

            if (firstDate < secondDate) {
                return -1
            } else if (firstDate > secondDate) {
                return 1
            } else {
                return 0
            }
        }
    )
    holidays = holidays.filter(holiday => {
        let date = new Date(holiday.holiday_date)

        // exclude weekends and non-national holiday
        return ![6, 0].includes(date.getDay()) && holiday.is_national_holiday
    })
    let today = new Date()
    let nearestHoliday = holidays.find(
        (holiday) => {
            return new Date(holiday.holiday_date) > today
        }
    )
    let nearestHolidayDate, text;
    if (nearestHoliday) {
        nearestHolidayDate = parseDate(nearestHoliday.holiday_date)

        let type = getHolidayType(nearestHoliday, holidays)

        let dateDiff = calculateDateDiff(new Date(nearestHoliday.holiday_date), today)
        text = `${dateDiff} hari lagi nih.`

        if (type == "libur biasa") {
            text = `${text}<br /> Libur biasa sih, tapi kalau kamu perlu cuti, cuti aja 😁`
        } else {
            text = `${text} Jangan lupa cuti, ya!<br />Mumpung ${type} 😆`
        }
    } else {
        nearestHolidayDate = "Nggak ada libur bro."
        text = "Sabar ya..."
    }

    document.getElementById('nearest-holiday-date').textContent = nearestHolidayDate
    document.getElementById('nearest-holiday-name').textContent = nearestHoliday?.holiday_name
    document.getElementById('date-diff').innerHTML = text
    document.getElementById('open-calendar-button').href = getCalendarUrl(nearestHoliday.holiday_date)

    holidays = holidays.filter(
        (holiday) => {
            return holiday.is_national_holiday
        }
    )

    addNationalHolidays(holidays)
}

function getCalendarUrl(date) {
    let splitted = date.split("-")
    return `https://calendar.google.com/calendar/u/0/r/day/${splitted[0]}/${parseInt(splitted[1])}/${parseInt(splitted[2])}`
}

function getHolidayType(nearestHoliday, holidays) {
    let dates = holidays.map(holiday => new Date(holiday.holiday_date))
    let date = new Date(nearestHoliday.holiday_date)
    let day = date.getDay()

    let isMiddleWeek = [3, 4].includes(day)
    if (isMiddleWeek) {
        let isKejepit = true
        for (let i = day; i <= 5; i++) {
            let nextDate = new Date(date.setDate(date.getDate() + i))
            isKejepit = isKejepit && !dates.includes(nextDate)
        }
        if (isKejepit) {
            return "tanggal kejepit"
        } else {
            return "long weekend"
        }
    } else if (day == 5) {
        return "long weekend"
    } else {
        return "libur biasa"
    }
}

function parseDate(dateParams) {
    let dateObject = new Date(dateParams)
    let day = dateObject.getDay()
    let date = dateObject.getDate()
    let month = getMonth(dateObject.getMonth())
    let year = dateObject.getFullYear()

    return `${getDay(day)}, ${date} ${month} ${year}`
}

function calculateDateDiff(nearestHoliday, today) {
    return Math.ceil((nearestHoliday - today) / (24 * 3600 * 1000));
}

function getMonth(monthNumber) {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    return months[parseInt(monthNumber)]
}

function getDay(dayNumber) {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    return days[parseInt(dayNumber)]
}

function addNationalHolidays(nationalHolidays) {
    let today = new Date()
    let nationalHolidayContainer = document.getElementById("national-holidays")

    nationalHolidays.forEach(nationalHoliday => {
        let wrapper = document.createElement("p")
        wrapper.style.textAlign = "center"

        let holidayName = nationalHoliday.holiday_name
        let holidayDate = parseDate(nationalHoliday.holiday_date)
        let dateDiff = calculateDateDiff(new Date(nationalHoliday.holiday_date), today)
        let holidayType = getHolidayType(nationalHoliday, nationalHolidays)

        let dateText
        if (dateDiff > 0) {
            dateText = `${dateDiff} hari lagi`
        } else if (dateDiff == 0) {
            dateText = 'Hari ini'
        } else {
            dateText = "Sudah lewat"
        }

        wrapper.innerHTML = `
            <span style="color: rgb(255, 79, 79)">${holidayName}</span><br />
            ${holidayDate}<br />
            <span style="font-weight: 600; font-size: 12px">${holidayType}</span><br />
            <span style='font-size: 12px; font-style: italic;'>${dateText}</span>
        `

        nationalHolidayContainer.appendChild(wrapper)
    })

}

function toggleNationalHolidays({
    target
}) {
    let element = document.getElementById("national-holidays")
    element.hidden = !element.hidden

    if (element.hidden) {
        target.textContent = "Lihat Semua Hari Libur"
    } else {
        target.textContent = "Sembunyikan Hari Libur"
    }
}