var b = [] //board
var score
var l = false
var w = false
var flags = 0
var time = 0
var uncovered = 0
var width = 0
var height = 0
var bomnum = 0
var num = 0
var begun = false
var timerInter
var btnCounter = 0
var generating = false
var flagged = []
const p = "<p style='opacity:100%'>"
window.addEventListener("contextmenu", e => e.preventDefault())
const $ = function (id) {
    return document.getElementById(id)
}

async function build() {
    if (!generating) {
        if ($("width").value.length && $("height").value.length && $("bombs").value.length){
            begun = false
            $("field").innerHTML = ""
            reset()
            document.documentElement.style.setProperty('--width', width);
            document.documentElement.style.setProperty('--height', height);

            if (bomnum >= width * height || !parseInt(bomnum) && bomnum != 0) { //weryfikacja formsa bomb
                bomnum = width * height - 1
                $("bombs").value = bomnum
            }
            $("left").innerHTML = "LEFT: " + bomnum

            b = []
            btnCounter = width * height
            generating = true
            addBtn(width * height > 400)
            clearInterval(timerInter)
        } else {
            // alert("dokończ wypełnianie")
            // $("width").value = "10"
            // $("height").value = "10"
            // $("bombs").value = "10"
            // build()
        }
    }
}

function addBtn(long) {
    if (long) {
        boardCode = ''
        for(var i = btnCounter; i > 0; i--) {
            b.push(0)
            boardCode += `
        <button class="btn" id="f` + (width * height - i) +
            `" oncontextmenu="flag(this.id)" onclick="reveal(this.id)"><p>1</button>`
        }
        $("field").innerHTML = boardCode
    } else {
        b.push(0)
        $("field").innerHTML += `
        <button class="btn" id="f` + (width * height - btnCounter) +
            `" oncontextmenu="flag(this.id)" onclick="reveal(this.id)"><p>1</button>`
        btnCounter--
        if (btnCounter > 0) setTimeout(addBtn, 10);
        else generating = false
    }
}

function reset() {
    width = parseInt($("width").value)
    height = parseInt($("height").value)
    bomnum = parseInt($("bombs").value)
    // var cookie = getCookies()
    // if(cookie){
    //     showBests()
    //     num = cookie.length
    // }
    $("timer").innerHTML = "TIME: " + 0
    // if ($("nick").value) nick = $("nick").value + num
    // else nick = "nick" + num
    l = false
    w = false
    flags = 0
    uncovered = 0
}

function putMines(revealed) {
    var temp = 0
    var bombs = 0
    for (bombs = 0; bombs < bomnum; bombs++) { //stawianie bomb
        temp = Math.floor(Math.random() * (width * height))
        if (b[temp] == 69 || temp == revealed) bombs--
        else b[temp] = 69
    }
    begun = true
}

function mineDetecting() {
    for (i = 0; i < width * height; i++) {
        if (b[i] == 0) {
            if (i >= width) { //bez 1. wiersza
                if (i % width != 0) { //bez lewej kol
                    if (b[i - width - 1] == 69) b[i]++
                }
                if (b[i - width] == 69) b[i]++
                if (i % width != (width - 1)) { //bez prawej kol
                    if (b[i - width + 1] == 69) b[i]++
                }
            }
            if (i % width != 0) { //bez lewej kol
                if (b[i - 1] == 69) b[i]++
            }
            if (i % width != (width - 1)) { //bez prawej kol
                if (b[i + 1] == 69) b[i]++
            }
            if (i < (width * (height - 1))) { //bez ostatniego wiersza
                if (i % width != 0) { //bez lewej kol
                    if (b[i + width - 1] == 69) b[i]++
                }
                if (b[i + width] == 69) b[i]++
                if (i % width != (width - 1)) { //bez prawej kol
                    if (b[i + width + 1] == 69) b[i]++
                }
            }
        }
    }
}

function timer() {
    time = 0
    var start = Date.now()
    timerInter = setInterval(function () { //licznik czasu
        if (!l && !w) { //nie wygrana nie przegrana 
            time = Date.now() - start
            $("timer").innerHTML = "TIME: " + Math.floor(time / 1000)
        } else {
            start = Date.now()
        }
    }, 1)
}

function reveal(id) {
    if (!$(id).classList.contains("unhidden")){
        var it = id.substr(1)
        if (!begun) {
            putMines(it)
            mineDetecting()
            timer()
        }
        if (!$(id).classList.contains("flagged")) {
            if (b[it] != 69) { // odkryj pole bez bomby
                openOne(it)
                if (b[it] == 0) openMany()
                winCheck()
            } else lost()
        }
    }
}

function lost() { // przegrana
    l = true
    score = $("timer").innerHTML
    $("timer").innerHTML = score
    for (i = 0; i < width * height; i++) {
        if ($('f' + i).classList.contains("flagged")) $('f' + i).classList.remove("flagged")
        if (b[i] == 69) {
            $('f' + i).innerHTML = p + "💣"
            $('f' + i).style.animation = "bombScreen infinite 1s ease-in-out"
            $('f' + i).classList.add("unhidden")
        } else $('f' + i).innerHTML = p + b[i]
        $('f' + i).disabled = true
    }
}

function openOne(id) {
    if (!$('f' + id).classList.contains("unhidden")){
        uncovered++
        $('f' + id).innerHTML = p + b[id]
        $('f' + id).classList.add("unhidden")
        $('f' + id).classList.add(addColor(b[id]))
    }
}

function addColor(it) {
    switch (it) {
        case 0:
            return("zero")
        case 1:
            return("one")
        case 2:
            return("two")
        case 3:
            return("thr")
        default:
            return("more")
    }
}

function openMany() {
    for (i = 0; i < width * height; i++) {
        if (b[i] == 0) {
            openOne(i)
            if (i >= width) { //bez 1. wiersza
                if (b[i - width] != 0) openOne(i - width)
            }
            if (i % width != 0) { //bez lewej kol
                if (b[i - 1] != 0) openOne(i - 1)
            }
            if (i % width != (width - 1)) { //bez prawej kol
                if (b[i + 1] != 0) openOne(i + 1)
            }
            if (i < (width * (height - 1))) { //bez ostatniego wiersza
                if (b[i + width] != 0) openOne(i + width)
            }
        }
    }
}

function flag(id) {
    if (!w && !l){
        if (flagged.includes(id)) {
            $(id).classList.remove("flagged")
            flagged.splice(flagged.indexOf(id), 1)
            flags--
        } else {
            if (bomnum - flags != 0) {
                if ($(id).innerHTML == "<p>1</p>") {
                    flags++
                    flagged.push(id)
                    $(id).classList.add("flagged")
                }
            }
        }
        $("left").innerHTML = `LEFT: ${bomnum - flags}`
        winCheck()
    }
}

function winCheck() {
    if (uncovered == width * height - bomnum && flags == bomnum) {
        w = true
        for (var j = 0; j < width * height; j++) {
            $('f' + j).disabled = true
            if (b[j] == 69) $('f' + j).classList.add("flagged")
            $('f' + j).classList.add("won")
        }
        // var bundle = `${time}^${width}>${height}<${bomnum}`
        // var data = [nick, bundle] //pakiet danych
        // document.cookie = `${nick}=${data}; expires=2023; path=/`
        // showBests()
    }
}

// function getBest() {
//     var scBoard = getCookies()
//     if (scBoard) {
//         document.querySelectorAll('ol > li').forEach((e) => e.remove()) //wyczysc
//         scBoard.sort((a, b) => {
//             //wytnij czasy i porownaj
//             st = parseInt((a.slice((a.indexOf(',')), (b.indexOf('^')+1))).substr(1))
//             nd = parseInt((b.slice((b.indexOf(',')), (b.indexOf('^')+1))).substr(1))
//             if (st > nd) {
//                 return 1
//             } else return -1
//         })
//         scBoard = scBoard.slice(0, 10) //top10
//         return scBoard
//     }
// }

// function showBests() {
//     var scores = getBest()
//     scores.forEach((SC) => {
//         var CWid = parseInt(SC.slice(SC.indexOf('^'), SC.indexOf('>')).substr(1))
//         var CHgt = parseInt(SC.slice(SC.indexOf('>'), SC.indexOf('<')).substr(1))
//         var CBomb = parseInt(SC.slice(SC.indexOf('<'), SC.length).substr(1))
//         var li = document.createElement('li') //staty do diva
//         var name = SC.substring(SC.indexOf('=') + 1, SC.indexOf(','))
//         var mins = '0' + parseInt(((SC.slice((SC.indexOf(',')), (SC.indexOf('^'))).substr(1)) / 1000) / 60)
//         var secs = ('0' + parseInt(((SC.slice((SC.indexOf(',')), (SC.indexOf('^')))).substr(1)) / 1000) % 60).slice(-2)
//         var milisecs = SC.slice((SC.indexOf('^') - 4), (SC.indexOf('^'))).substr(1)
//         li.textContent = `${name} - ${mins}.${secs}.${milisecs} (${CWid}/${CHgt}/${CBomb})`
//         $("scores-list").append(li) //na koniec
//     })
//     scores.forEach((SC) => {
//         CWid = parseInt(SC.slice(SC.indexOf('^'), SC.indexOf('>')).substr(1))
//         CHgt = parseInt(SC.slice(SC.indexOf('>'), SC.indexOf('<')).substr(1))
//         CBomb = parseInt(SC.slice(SC.indexOf('<'), SC.length).substr(1))
//         if (CWid == width && CHgt == height && CBomb == bomnum) {// dla trybu
//             li = document.createElement('li')
//             name = SC.substring(SC.indexOf('=') + 1, SC.indexOf(','))
//             mins = '0' + parseInt(((SC.slice((SC.indexOf(',')), (SC.indexOf('^'))).substr(1)) / 1000) / 60)
//             secs = ('0' + parseInt(((SC.slice((SC.indexOf(',')), (SC.indexOf('^')))).substr(1)) / 1000) % 60).slice(-2)
//             milisecs = SC.slice((SC.indexOf('^') - 4), (SC.indexOf('^'))).substr(1)
//             li.textContent = `${name} - ${mins}.${secs}.${milisecs} (${CWid}/${CHgt}/${CBomb})`
//             $("mode-scores-list").append(li) //na koniec
//         }
//     })
// }

// function getCookies() {
//     var cookies = decodeURIComponent(document.cookie).split('; ') //tablica ze statami
//     if (cookies[0] == '') return null
//     return cookies
// }

// showBests()