
const flatten = arr => {
    const headers = []
    const _flatter = obj => {
        const _flatObject = {}
        const inner = _obj => {
            for (const key in _obj) {
                if (typeof _obj[key] === 'object') {
                    inner(_obj[key])
                } else {
                    _flatObject[key] = _obj[key]
                    if (!(headers.includes(key))) {
                        headers.push(key)
                    }
                }
            }
        }
        inner(obj)
        return _flatObject
    }
    return { headers, rows: arr.map(_flatter) }
}
const fetchRender = async q => {
    const users = (await fetch(`https://randomuser.me/api?results=${q ?? 20}`).then(res => res.json())).results
    const flattendData = flatten(users.map(user => ({ ...user.name, ...user.location })))


    const table = document.querySelector('table')
    const tHeaderRow = table.tHead.rows[0]
    const tBody = table.tBodies[0]

    tHeaderRow.innerHTML = ''
    tBody.innerHTML = ''

    const maxNumber = Math.max(...flattendData.rows.map(row => row.number))


    flattendData.headers.forEach(col => {
        const headCell = document.createElement('th')
        headCell.scope = 'col'
        headCell.textContent = col
        tHeaderRow.appendChild(headCell)
    })

    flattendData.rows.forEach(location => {
        const row = tBody.insertRow()
        if (location.number === maxNumber) {
            row.setAttribute('data-peak', 'true')
        }
        for (const key in location) {
            const cell = row.insertCell()
            cell.textContent = location[key]
            cell.title = location[key]
        }
        row.style.setProperty('--color-sat', `${(location.number / maxNumber) * 100}%`)
        row.style.setProperty('--color-hue', `${(location.number / maxNumber)}`)
    })
}
fetchRender()


document.querySelector('.tableContainer input[type=range]').addEventListener('input', e => {
    fetchRender(e.target.value)
})