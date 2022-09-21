/* basic touch process https://jh3y.medium.com/implementing-touch-support-in-javascript-b8e43f267a16 */

const upload = document.querySelector('.upload');
const main = document.querySelector('.main');

const colors = ['#eae4e9ff', '#fff1e6ff', '#fde2e4ff', '#fad2e1ff', '#e2ece9ff', '#bee1e6ff', '#f0efebff',
    '#dfe7fdff', '#cddafdff', '#dfd7fcff', '#f8b4c4ff', '#ffedc2ff', '#60fbd2ff', '#7cd5f3ff', '#8fdbf5ff', '#3dccc7ff'
];

let group_elements = [];
let moving_element = '';
let startX, startY;
const flight_elements = document.querySelectorAll('.drop-targets:not(.names)');
let hovered_flight;

// flight drag functions

function dragStart(e) {
    //don't want to hide to propagate up to group parent
    e.stopPropagation();
    this.classList.toggle('hold');
    setTimeout(() => (this.classList.toggle('hide')), 0);
    moving_element = e;
}

function dragEnd(e) {
    // don't want to hold/hide to propagate up to group parent
    e.stopPropagation()
    this.classList.toggle('hold');
    this.classList.toggle('hide');
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.toggle('hovered');
}

function dragLeave() {
    this.classList.toggle('hovered');
}

const touchMove = e => {
    e.preventDefault();
    //only 1 finger action detected
    if (e.targetTouches.length == 1) {
        const progressX = startX - e.touches[0].clientX
        const progressY = startY - e.touches[0].clientY
        const translationX =
            progressX > 0
                ? parseInt(-Math.abs(progressX))
                : parseInt(Math.abs(progressX))
        const translationY =
            progressY > 0
                ? parseInt(-Math.abs(progressY))
                : parseInt(Math.abs(progressY))

        let els = document.elementsFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        for (const el of els) {
            if (el.classList.contains('drop-targets')) {
                if(typeof hovered_flight == 'undefined'){
                    el.classList.add('hovered');
                    hovered_flight = el;
                }
                if (hovered_flight && hovered_flight != el){
                    hovered_flight.classList.remove('hovered');
                    el.classList.add('hovered');
                    hovered_flight = el;
                }

            }
        }

        moving_element.style.setProperty('--translateX', translationX);
        moving_element.style.setProperty('--translateY', translationY);


    }
}

const touchEnd = e => {
    e.stopPropagation();
    const finishingTouch = e.changedTouches[0];

    moving_element.classList.remove('hold');
    moving_element.style.setProperty('--translateX', '0');
    moving_element.style.setProperty('--translateY', '0');
    try {
        hovered_flight.classList.remove('hovered');

        if (moving_element.parentElement.parentElement.classList.contains('group')) {
            moving_element.parentElement.parentElement.style.setProperty('overflow', 'hidden');
        }
    } catch {
        //do nothing timing issue might not realize hover is already off
    }
    hovered_flight = undefined;


    const destination_element = document.elementFromPoint(finishingTouch.clientX, finishingTouch.clientY);
    if (destination_element && destination_element.classList.contains('drop-targets')) {
        destination_element.append(moving_element);
        afterTheDrop();
    }

}

const touchStart = e => {

    e.stopPropagation();
    const {touches} = e
    // only 1 finger touch is actionable
    if (touches && touches.length === 1) {
        const touch = touches[0]
        startX = touch.clientX;
        startY = touch.clientY;
        moving_element = e.currentTarget;
        moving_element.classList.add('hold');
        if (moving_element.parentElement.parentElement.classList.contains('group')) {
            moving_element.parentElement.parentElement.style.setProperty('overflow', 'visible');
        }
        moving_element.removeEventListener('touchmove', touchMove);
        moving_element.removeEventListener('touchend', touchEnd);
        moving_element.addEventListener('touchmove', function(e) {
            e.preventDefault();
            touchMove(e);
        }, {passive:false});
        moving_element.addEventListener('touchend', touchEnd);

    }
}


function dragDrop(e) {
    this.classList.toggle('hovered');
    this.append(moving_element.target);

    afterTheDrop();


}

function afterTheDrop() {

    const groups_parents = document.querySelectorAll('.group .details');

    for (const group_element of groups_parents) {
        // check if group  is empty and hide it
        if (group_element.childElementCount === 0) {
            group_element.parentElement.classList.add('hide');
        }
        // recalculate group weight
        let group_total = 0;
        for (const person of group_element.querySelectorAll('.person')) {
                group_total += parseInt(person.dataset.weight);
            }
        group_element.parentElement.querySelector('.group-weight').innerHTML = group_total.toString();
        group_element.parentElement.dataset.weight=group_total.toString();
    }


    // update left-right weights
    for (const flight of flight_elements) {

            let total = 0;
            for (const person of flight.querySelectorAll('.person')) {
                total += parseInt(person.dataset.weight);
            }
            let weight_elm = document.querySelector(flight.dataset.weight_elm);
            weight_elm.innerHTML = total.toString();
            flight.dataset.weight=total.toString();

    }

    // update total weights
    for (const flight of document.querySelectorAll('.flight')) {
        let total = 0;
        for (const side of flight.querySelectorAll('.drop-targets')) {
                total += parseInt(side.dataset.weight);
            }
        flight.querySelector('.total-weight').innerHTML = total.toString();

    }




}


// flight listeners
for (const flight_element of flight_elements) {
    flight_element.addEventListener('dragover', dragOver);
    flight_element.addEventListener('dragenter', dragEnter);
    flight_element.addEventListener('dragleave', dragLeave);
    flight_element.addEventListener('drop', dragDrop);
}

function switchView() {
    upload.classList.toggle('hide');
    main.classList.toggle('hide');
}

function applyGroupHandlers() {
    group_elements = document.querySelectorAll('.group');

    //drop any existing group/name listeners
    for (const group_element of group_elements) {
        group_element.removeEventListener('dragstart', dragStart);
        group_element.removeEventListener('dragend', dragEnd);
        group_element.removeEventListener('touchstart', touchStart);
    }

    // apply  group/name listeners
    for (const group_element of group_elements) {
        group_element.addEventListener('dragstart', dragStart);
        group_element.addEventListener('dragend', dragEnd);
        group_element.addEventListener('touchstart', touchStart);
    }
}

document.getElementById('load').addEventListener('click', () => {
    switchView();
})

document.getElementById('import').addEventListener('click', (e) => {
    let files = document.getElementById('selectFiles').files;

    if (files.length <= 0) {
        return false;
    }

    let fr = new FileReader();

    document.getElementById('names').classList.remove('hide');

    fr.onload = function (e) {

        let result = JSON.parse(e.target.result);
        let formatted = JSON.stringify(result, null, 2);
        // TODO check that file has right structure

        switchView();


        let names_html = "";
        const groups = [];
        result.forEach((value, index) => {
            if (groups.indexOf(value.group) === -1) {
                groups.push(value.group);
            }
        });


        //sort incoming data by groups then by largest to smallest weight
        const sorted = result.sort((a, b) => {
            if (a.group == b.group) {
                return a.weight > b.weight ? -1 : 1
            } else {
                return a.group < b.group ? -1 : 1
            }
        });
        //console.log(sorted)

        applyGroupHandlers();
    }

    fr.readAsText(files.item(0));
});


document.onreadystatechange = function () {
    let state = document.readyState;
    if (state == 'complete') {

        switchView();
        document.getElementById('load').classList.add('hide');
        applyGroupHandlers();

    }
}