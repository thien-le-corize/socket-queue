export const getCurrentDate = () => {
    const dateCurrent = new Date()
    const getDay = dateCurrent.getDate()
    const getMonth = dateCurrent.getMonth() + 1 // January is 0!
    const getyear = dateCurrent.getFullYear()
    const getHours = dateCurrent.getHours()
    const getMinutes = dateCurrent.getMinutes()
    const getSeconds = dateCurrent.getSeconds()

    const day = getDay < 10 ? '0' + getDay : getDay
    const month = getMonth < 10 ? '0' + getMonth : getMonth
    const hours = getHours < 10 ? '0' + getHours : getHours
    const minutes = getMinutes < 10 ? '0' + getMinutes : getMinutes
    const seconds = getSeconds < 10 ? '0' + getSeconds : getSeconds

    return `${day}/${month}/${getyear} ${hours}:${minutes}:${seconds}`
}
