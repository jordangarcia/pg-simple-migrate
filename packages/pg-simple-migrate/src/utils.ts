function padZero(input: number): string {
  return ('0' + input).slice(-2)
}

export function getNow(): string {
  let dateObj = new Date()

  // current date
  // adjust 0 before single digit date
  let date = ('0' + dateObj.getDate()).slice(-2)

  // current month
  let month = ('0' + (dateObj.getMonth() + 1)).slice(-2)

  // current year
  let year = dateObj.getFullYear()

  // current hours
  let hours = padZero(dateObj.getHours())

  // current minutes
  let minutes = padZero(dateObj.getMinutes())

  // current seconds
  let seconds = padZero(dateObj.getSeconds())

  return `${year}_${month}_${date}_${hours}${minutes}${seconds}`
}
