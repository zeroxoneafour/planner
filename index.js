let mainDate = new Date()
let sundayDate = mainDate // is used and set later
const params = new URLSearchParams(location.search) // search params for adding new assignments in batch

// convert date to YYYY-MM-DD
function dateToDay(date) {
	let year = date.getFullYear().toString()
	while (year.length < 4) {
		year = "0" + year
	}
	let month = (date.getMonth() + 1).toString()
	while (month.length < 2) {
		month = "0" + month
	}
	let day = date.getDate().toString()
	while (day.length < 2) {
		day = "0" + day
	}
	return year + "-" + month + "-" + day
}

// convert day format (YYYY-MM-DD) to date
function dayToDate(day) {
	let ret = new Date(0)
	let strs = day.split("-")
	ret.setDate(strs[2])
	ret.setMonth(parseInt(strs[1])-1)
	ret.setFullYear(strs[0])
	return ret
}

// severity levels go - assignment, homework, quiz, test, project
function openNewPlanModal(date = dateToDay(mainDate), period = 1, severity = "assignment", desc = "") {
	let modalOutside = document.getElementById("newPlanModalOutside")
	modalOutside.style.display = "block"
	document.getElementById("newDate").value = date
	document.getElementById("newPeriod").value = period
	document.getElementById("newSeverity").value = severity
	document.getElementById("newDesc").value = desc
}

function closeModal(modalId) {
	document.getElementById(modalId).style.display = "none"
}

// local storage key:value organization is "<date>:<number>":"<period>\0<severity>\0<desc>"
// \0 is obviously null
// ex. "2022-01-07:0":"1\0homework\0Winter Break Homework"
// is returned as an array of arrays, where the arrays inside the main array are [period, severity, desc]
function readLocalStorageForDate(date) {
	let ret = []
	for (i = 0; window.localStorage.getItem(date + ":" + i) != null; i++) {
		value = window.localStorage.getItem(date + ":" + i)
		ret.push(value.split("\0"))
	}
	return ret
}

// takes a date string (YYYY-MM-DD) and a plans array
function writeLocalStorageForDate(date, plans) {
	for (i = 0; window.localStorage.getItem(date + ":" + i) != null; i++) {
		window.localStorage.removeItem(date + ":" + i)
	}
	for (i = 0; i < plans.length; i++) {
		window.localStorage.setItem(date + ":" + i, plans[i].join("\0"))
	}
	rebuildMain()
}

// delete an element in the plans array by getting the localStorage key, then rebuild main
function deletePlan(planStr) {
	let plan = planStr.split(":")
	let plans = readLocalStorageForDate(plan[0])
	plans.splice(plan[1], 1)
	writeLocalStorageForDate(plan[0], plans)
}

// save new plan
function saveNewPlan() {
	let date = document.getElementById("newDate").value
	let period = document.getElementById("newPeriod").value
	let severity = document.getElementById("newSeverity").value
	let desc = document.getElementById("newDesc").value
	// has to have some description
	if (desc == "") {
		return
	}
	let plans = readLocalStorageForDate(date)
	plans.push([period, severity, desc])
	writeLocalStorageForDate(date, plans)
	rebuildMain()
	closeModal("newPlanModalOutside")
}

function rebuildMain() {
	let main = document.getElementById("main")
	// clear all nodes in main from previous calls to rebuildMain()
	while (main.firstChild) {
		main.removeChild(main.firstChild)
	}
	// get sunday date
	let currentDate = structuredClone(mainDate)
	while (currentDate.getDay() != 0) {
		currentDate.setDate(currentDate.getDate()-1)
	}
	for (let i = 0; i < 7; i++) {
		let currentDateStr = dateToDay(currentDate)
		// day slot
		let newDaySlot = document.createElement("div")
		newDaySlot.classList.add("dayslot")
		newDaySlot.addEventListener("click", function(event) {
			// make sure it doesn't override clicks on child elements, but allow clicks on the title
			if (event.target != this && !(event.target.classList[0] == "dayslot-title")) {
				return
			}
			openNewPlanModal(this.querySelector(".time").innerHTML)
		})
		// day slot title
		let title = document.createElement("p")
		title.innerHTML = currentDate.toDateString()
		title.classList.add("dayslot-title")
		newDaySlot.appendChild(title)
		// store information about the time inside the HTML, because y'know, why not
		let time = document.createElement("p")
		time.innerHTML = currentDateStr
		time.classList.add("hidden")
		time.classList.add("time")
		newDaySlot.appendChild(time)
		// actually create the plans now
		let plans = readLocalStorageForDate(currentDateStr)
		for (let j = 0; j < plans.length; j++) {
			let plan = document.createElement("p")
			let period = newDaySlot.querySelector(".period-" + plans[j][0])

			if (period === null) {
				period = document.createElement("div")
				periodTitle = document.createElement("p")
				period.classList.add("period-" + plans[j][0])
				periodTitle.classList.add("period-title")
				periodTitle.innerHTML = "Period " + plans[j][0]
				period.appendChild(periodTitle)

				// add assignments directly to pre-created periods
				period.addEventListener("click", function(event) {
					if (event.target != this && !(event.target.classList[0] == "period-title")) {
						return
					}
					let date = this.parentElement.querySelector(".time").innerHTML
					let periodNumber = this.querySelector(".period-title").innerHTML.split(" ")[1] // hey, it works
					openNewPlanModal(date, periodNumber)
				})

				newDaySlot.appendChild(period)
			}

			plan.innerHTML = plans[j][2]
			plan.classList.add("severity-" + plans[j][1])
			plan.classList.add("plan")
			
			// metadata about the assignment
			let metadata = document.createElement("p")
			metadata.innerHTML = [currentDateStr, j].join(":")
			metadata.classList.add("hidden")
			metadata.classList.add("metadata")
			plan.appendChild(metadata)
			// delete plan when clicked
			plan.addEventListener("dblclick", function() {deletePlan(this.querySelector(".metadata").innerHTML)})

			period.appendChild(plan)
		}

		main.appendChild(newDaySlot)
		currentDate.setDate(currentDate.getDate()+1)
	}
}

// handle params, possible params are documented in readme
if (params.get("date") != null) {
	let date = dayToDate(params.get("date"))
	let period = params.get("period")
	let severity = params.get("severity")
	let desc = params.get("desc")
	if (period != null && severity != null && desc != null) {
		if (params.get("noconfirm") == "true") {
			let plans = readLocalStorageForDate(date)
			plans.push([period, severity, desc])
			writeLocalStorageForDate(date, plans)
		} else {
			openNewPlanModal(date, period, severity, desc)
		}
	}
}

document.getElementById("mainDate").value = dateToDay(mainDate)

// date listenner
document.getElementById("mainDate").addEventListener("change", function() {
	mainDate = dayToDate(this.value)
	rebuildMain()
})

// general modal handling
window.onclick = function(event) {
	if (Array.from(document.getElementsByClassName("modal")).includes(event.target)) {
		event.target.style.display = "none"
	}
}

rebuildMain()
