const upload = document.querySelector('.upload');
const main = document.querySelector('.main');
const names_block = document.getElementById('names');
const colors = ['#eae4e9ff', '#fff1e6ff', '#fde2e4ff', '#fad2e1ff', '#e2ece9ff', '#bee1e6ff', '#f0efebff',
    '#dfe7fdff', '#cddafdff', '#dfd7fcff', '#f8b4c4ff', '#ffedc2ff', '#60fbd2ff', '#7cd5f3ff', '#8fdbf5ff', '#3dccc7ff'
];

let group_elements = [];
let moving_element = '';
let start_swipe;
const flight_elements = document.querySelectorAll('.drop-targets');


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

    //only 1 finger action detected
    if (e.targetTouches.length == 1) {
        const progressX = startX - e.touches[0].clientX
        const translation =
            progressX > 0
                ? parseInt(-Math.abs(progressX))
                : parseInt(Math.abs(progressX))
        moving_element.style.setProperty('--translate', translation)

        let touch = e.targetTouches[0];
        const destination_element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (destination_element && destination_element.classList.contains('drop-targets')) {
            destination_element.classList.add('hovered');
        } else {
            const hovered_elements = document.querySelectorAll('.hovered.drop-targets');
            try {
                if (hovered_elements && hovered_elements.length > 0) {
                    for (const flight_element in hovered_elements) {
                        flight_element.classList.remove('hovered');
                    }
                }
            }
            catch(err){
            // do nothing, probably have a race condition
            }
        }

    }
}

const touchEnd = e => {

    const finishingTouch = e.changedTouches[0]

    moving_element.classList.remove('hold');

    const destination_element = document.elementFromPoint(finishingTouch.clientX, finishingTouch.clientY);
    if (destination_element && destination_element.classList.contains('drop-targets')) {
        destination_element.append(moving_element);
        destination_element.classList.remove('hovered');
        // need to remove original element

    }

}

const touchStart = e => {

    e.stopPropagation();
    const {touches} = e
    // only 1 finger touch is actionable
    if (touches && touches.length === 1) {
        const touch = touches[0]
        startX = touch.clientX;
        moving_element = e.currentTarget;
        moving_element.classList.add('hold');
        moving_element.removeEventListener('touchmove', touchMove);
        moving_element.removeEventListener('touchend', touchEnd);
        moving_element.addEventListener('touchmove', touchMove);
        moving_element.addEventListener('touchend', touchEnd);

    }
}


function dragDrop(e) {
    this.classList.toggle('hovered');
    console.log(e);
    this.append(moving_element.target);


    //TODO RECALCULATE
    /*
    1. check if group in names column is empty, if yes, remove it
    2. if person is moved out of group, re cal group weight
    3. when group or person put into a flight, recalc balances
     */

    // when names is empty, show the names-empty div
    if (document.querySelectorAll('#names .person').length == 0) {
        document.querySelector('.names-empty').classList.toggle('hide');
        document.getElementById('names').classList.add('hide');
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

    document.querySelector('.names-empty').classList.add('hide');
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
        console.log(sorted)


        applyGroupHandlers();
    }

    fr.readAsText(files.item(0));
});


//
// fetch('./Data.json')
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.log(error));