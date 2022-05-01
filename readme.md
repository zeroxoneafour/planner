# planner
A school planner written in client-side JavaScript, using localStorage

Features -
- [X] Can view and create plans client-side
- [X] Can create plans via links
- [X] CSS looks acceptable
- [ ] Sync planner across computers, somehow

## creating links
A major feature of this planner is the ability to share assignments via links. Soon, there will be a tool to automate the creation of these links. The available params in the link use the `location.search` property, and are as follows -
* `date` - The date for the assignment, in YYYY-MM-DD format
* `period` - The assigment period number
* `severity` - The assigment severity, one of `assignment`, `homework`, `quiz`, `test`, or `project`
* `desc` - The assignment description
* `noconfirm` - Set to `true` if you want to enter the assignment without user confirmation
