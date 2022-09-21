// Default SortableJS


const upload = document.querySelector('.upload');
const main = document.querySelector('.main');

const colors = ['#eae4e9ff', '#fff1e6ff', '#fde2e4ff', '#fad2e1ff', '#e2ece9ff', '#bee1e6ff', '#f0efebff',
    '#dfe7fdff', '#cddafdff', '#dfd7fcff', '#f8b4c4ff', '#ffedc2ff', '#60fbd2ff', '#7cd5f3ff', '#8fdbf5ff', '#3dccc7ff'
];

const flight_elements = document.querySelectorAll('.drop-targets');


// drop drag functions
const flightOneRight = document.getElementById('f1-right');
const flightOneLeft = document.getElementById('f1-left');
const flightTwoRight = document.getElementById('f2-right');
const flightTwoLeft = document.getElementById('f2-left');
const names = document.getElementById('names');


function applyGroupHandlers() {
    new Sortable(flightOneRight, {
        group: 'shared', // all drop areas to same group to allow access across elements
        animation: 150
    });

    new Sortable(flightOneLeft, {
        group: 'shared', // all drop areas to same group to allow access across elements
        animation: 150
    });
    new Sortable(flightTwoRight, {
        group: 'shared', // all drop areas to same group to allow access across elements
        animation: 150
    });
    new Sortable(flightTwoLeft, {
        group: 'shared', // all drop areas to same group to allow access across elements
        animation: 150
    });
    new Sortable(names, {
        group: 'shared', // all drop areas to same group to allow access across elements
        animation: 150
    });

    let nestedSortables = [].slice.call(document.querySelectorAll('.nested-sortable'));
    // Loop through each nested sortable element
    for (let i = 0; i < nestedSortables.length; i++) {
        new Sortable(nestedSortables[i], {
            group: 'nested',
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.65
        });
    }
}


function afterTheDrop() {

    // when names is empty, show the names-empty div
    if (document.querySelectorAll('#names .person').length == 0) {
        document.querySelector('.names-empty').classList.remove('hide');
        document.getElementById('names').classList.add('hide');
    }

    // check if group in  names is empty and hide it
    const groups_in_names = document.querySelectorAll('#names .group .details');
    for (const group_element of groups_in_names) {
        if (group_element.childElementCount === 0) {
            group_element.parentElement.classList.add('hide');
        }
    }

    // calculate the left/right flight totals
    for (const flight of flight_elements) {
        let total = 0;
        for (const person of flight.querySelectorAll('.person')) {
            total += parseInt(person.dataset.weight);
        }
        flight.parentElement.querySelector('.total-weight').innerHTML = total.toString();
        flight.parentElement.querySelector('.total-weight').dataset.weight = total.toString();
    }

    // calculate the flight totals
    let total = 0;
    for (const side of document.querySelectorAll('#flight-1 .total-weight')) {
        total += parseInt(side.dataset.weight);
    }
    document.querySelector('.flight-weight-1').innerHTML = total.toString();
    total = 0;
    for (const side of document.querySelectorAll('#flight-2 .total-weight')) {
        total += parseInt(side.dataset.weight);
    }
    document.querySelector('.flight-weight-2').innerHTML = total.toString();


}


function switchView() {
    upload.classList.toggle('hide');
    main.classList.toggle('hide');
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
        //console.log(sorted)

        applyGroupHandlers();
    }

    fr.readAsText(files.item(0));
});


document.onreadystatechange = function () {
    let state = document.readyState;
    if (state == 'complete') {
        document.querySelector('.names-empty').classList.add('hide');
        switchView();
        document.getElementById('load').classList.add('hide');
        applyGroupHandlers();

    }
}