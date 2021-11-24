/**
 * 
 * @param {String} hex 
 */
function HEXToHSL(hex) {

    const r = ('0x' + hex.slice(1, 3)) / 255
    const g = ('0x' + hex.slice(3, 5)) / 255
    const b = ('0x' + hex.slice(5, 7)) / 255

    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l]
}

window.setHSL = value => {
    const hsl = HEXToHSL(value)
    document.body.style.setProperty('--base-hue', `${hsl[0]}`)
    document.body.style.setProperty('--base-sat', `${hsl[1]}%`)
    document.body.style.setProperty('--base-light', `${hsl[2]}%`)

    const spans = document.querySelectorAll('.color-input label[for=colorPicker]')[1].children
    spans[0].textContent = hsl[0].toString()
    spans[1].textContent = hsl[1].toString()
    spans[2].textContent = hsl[2].toString()
}

window.onload = e => {
    setHSL(document.querySelector('.color-input input[type=color]').value)
}

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
        row.style.setProperty('--color-sat', `${(location.number / maxNumber) * 0.75 + 0.25}`)
        row.style.setProperty('--color-hue', `${(location.number / maxNumber)}`)
    })
}
fetchRender()


document.querySelector('.tableContainer input[type=range]').addEventListener('input', e => {
    fetchRender(e.target.value)
})