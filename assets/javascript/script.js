const main = document.querySelector('.main');

const colors = ['#eae4e9ff', '#fff1e6ff', '#fde2e4ff', '#fad2e1ff', '#e2ece9ff', '#bee1e6ff', '#f0efebff',
    '#dfe7fdff', '#cddafdff', '#dfd7fcff', '#f8b4c4ff', '#ffedc2ff', '#60fbd2ff', '#7cd5f3ff', '#8fdbf5ff', '#3dccc7ff'
];

let group_elements = [];
let MOVING_ELEMENT = '';
let startX, startY;
const flight_elements = document.querySelectorAll('.drop-targets');
let hovered_flight;



/**
 * dragGroupStart: Handler called when dragging a "group" element begins
 *
 *  1. don't allow handler to trickle to a parent group
 *  2. add class to signify object is grabbed
 *  3. hide the original element to avoid user confusion
 *  4. set global for element that is being moved
 */
function dragGroupStart(e) {
    e.stopPropagation();
    this.classList.toggle('hold');
    setTimeout(() => (this.classList.toggle('hide')), 0);
    MOVING_ELEMENT = e;
}

/**
 * dragGroupEnd: Handler called when dragging a "group" element ends
 *
 *  1. don't allow handler to trickle to a parent group
 *  2. remove class for holding
 *  3. show moved element
 */
function dragGroupEnd(e) {
    e.stopPropagation();
    this.classList.toggle('hold');
    this.classList.toggle('hide');
}

/**
 * dragOverFlightElement: Handler called when dragging a group
 * over a flight Element
 *
 *  1. Prevent default to allow drop into flight element
 */
function dragOverFlightElement(e) {
   e.preventDefault();
}

/**
 * dragEnterFlightElement: Handler called when dragging a group
 * into a flight Element
 *
 *  1. Prevent default to allow drop into flight element
 *  2. add class of hovered to potential dropzone
 */
function dragEnterFlightElement(e) {
    e.preventDefault();
    this.classList.toggle('hovered');
}

/**
 * dragLeaveFlightElement: Handler called when dragging a group
 * into a flight Element
 *
 *  1. remove class of hovered to potential dropzone
 */
function dragLeaveFlightElement() {
    this.classList.toggle('hovered');
}

/**
 * groupElementTouchMove: Handler called when mobile devices
 * is moving a Group Element
 *
 *  1. prevent browser from continuing to process the touch event & prevent mouse
 *  event from being delivered
 *  2. only handle the 1 finger action as a dragging motion for group element
 *  3. Translate the x.y to stimulate moving element
 *  4. see if a valid dropzone is below object and toggle it's hovered class
 *  5. ? Should this function be debounced
 *
 *  basic touch process https://jh3y.medium.com/implementing-touch-support-in-javascript-b8e43f267a16
 */
function groupElementTouchMove(e) {
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
                if (typeof hovered_flight == 'undefined') {
                    el.classList.add('hovered');
                    hovered_flight = el;
                }
                if (hovered_flight && hovered_flight != el) {
                    hovered_flight.classList.remove('hovered');
                    el.classList.add('hovered');
                    hovered_flight = el;
                }

            }
        }

        MOVING_ELEMENT.style.setProperty('--translateX', translationX);
        MOVING_ELEMENT.style.setProperty('--translateY', translationY);
        
    }
}

/**
 * groupElementTouchEnd: Handler called when mobile device
 *  swipe to move Group Element Ends
 *
 *  1. prevent browser trickling up to parent group element
 *  2. remove translation from object being moved
 *  3. remove hovered effect from any drop zones
 *  4. remove special classes to allow a child group object to be seen
 *  5. append the moved group element to tne new dropzone object
 *  6. kick off flight calculation
 */
function groupElementTouchEnd(e) {
    e.stopPropagation();
    const finishingTouch = e.changedTouches[0];

    MOVING_ELEMENT.classList.remove('hold');
    MOVING_ELEMENT.style.setProperty('--translateX', '0');
    MOVING_ELEMENT.style.setProperty('--translateY', '0');
    MOVING_ELEMENT.style.removeProperty('z-index');
    try {
        hovered_flight.classList.remove('hovered');
        if (MOVING_ELEMENT.parentElement.parentElement.classList.contains('group')) {
            MOVING_ELEMENT.parentElement.parentElement.style.removeProperty('z-index');
            MOVING_ELEMENT.parentElement.parentElement.style.removeProperty('overflow');
        }
    } catch {
        //do nothing timing issue might not realize hover is already off
    }
    hovered_flight = undefined;

    const destination_element = document.elementFromPoint(finishingTouch.clientX, finishingTouch.clientY);
    if (destination_element && destination_element.classList.contains('drop-targets')) {
        destination_element.append(MOVING_ELEMENT);
        updateWeights();
    }

}

/**
 * groupElementTouchStart: Handler called when mobile device
 *  touches a Group Element
 *
 *  1. prevent browser trickling up to parent group element
 *  2. pay attention to only the moving touch
 *  3. start adding translation to the element
 *  4. add hold class to element
 *  5. if it's a child override CSS so it's visible above parent & other objecst
 *  placed on DOM after it
 *  6. create the moving handler
 */
function groupElementTouchStart(e) {

    e.stopPropagation();
    const {touches} = e
    // only 1 finger touch is actionable
    if (touches && touches.length === 1) {
        const touch = touches[0]
        startX = touch.clientX;
        startY = touch.clientY;
        MOVING_ELEMENT = e.currentTarget;
        MOVING_ELEMENT.classList.add('hold');

        MOVING_ELEMENT.style.setProperty('z-index', '200');

        if (MOVING_ELEMENT.parentElement.parentElement.classList.contains('group')) {
            MOVING_ELEMENT.parentElement.parentElement.style.setProperty('z-index', '200');
            MOVING_ELEMENT.parentElement.parentElement.style.setProperty('overflow', 'visible');
        }
        MOVING_ELEMENT.removeEventListener('touchmove', groupElementTouchMove);
        MOVING_ELEMENT.removeEventListener('touchend', groupElementTouchEnd);
        MOVING_ELEMENT.addEventListener('touchmove', function (e) {
            e.preventDefault();
            groupElementTouchMove(e);
        }, {passive: false});
        MOVING_ELEMENT.addEventListener('touchend', groupElementTouchEnd);

    }
}

/**
 * dragDropIntoFlightElement: Handler called when mouse release
 * dragged group into Flight Element
 *
 *  1. toggle the flight element's hovered state
 *  2. append the moved element to the destination drop zone
 *  3. kick off UX update of counts & weights
 */
function dragDropIntoFlightElement(e) {
    this.classList.toggle('hovered');
    this.append(MOVING_ELEMENT.target);
    updateWeights();

}

/**
 * updateWeights: called after DOM manipulation of a group is done
 * AKA drag & drop or touch move
 *
 *  1. hides empty parent groups
 *  2. recalculates parent group weights
 *  3. recalculates left and right counts & weights for each flight
 *  4. updates flight totals
 *  5. updates grand totals
 *
 */
function updateWeights() {

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
        group_element.parentElement.dataset.weight = group_total.toString();
    }


    // update left-right weights & counts
    for (const flight of flight_elements) {
        if (!flight.classList.contains('names')) {

            let total = 0;
            let count = 0;
            for (const person of flight.querySelectorAll('.person')) {
                total += parseInt(person.dataset.weight);
                count++;
            }
            let weight_elm = document.querySelector(flight.dataset.weight_elm);
            weight_elm.innerHTML = total.toString();
            flight.dataset.weight = total.toString();
            let count_elm = document.querySelector(flight.dataset.count_elm);
            count_elm.innerHTML = count.toString();
            flight.dataset.count = count.toString();
        }

    }

    // update total weights & counts
    let grand_total = 0;
    let grand_count = 0;
    for (const flight of document.querySelectorAll('.flight')) {
        let total = 0;
        let count = 0;
        for (const side of flight.querySelectorAll('.drop-targets')) {
            total += parseInt(side.dataset.weight);
            count += parseInt(side.dataset.count);
        }
        flight.querySelector('.total-weight').innerHTML = total.toString();
        flight.querySelector('.total-count').innerHTML = count.toString();
        if (flight.getAttribute('id') === "flight-1") {
            document.querySelector('.first-weight').innerHTML = total.toString();
            document.querySelector('.first-count').innerHTML = count.toString();
        } else {
            document.querySelector('.second-weight').innerHTML = total.toString();
            document.querySelector('.second-count').innerHTML = count.toString();

        }

        grand_total += total;
        grand_count += count;

    }

    //update grand totals
    document.querySelector('.grand-total-weight').innerHTML = grand_total.toString();
    document.querySelector('.grand-total-count').innerHTML = grand_count.toString();


}


/**
 * applyPatronDropZoneHandlers: sets handlers to the drop zones for the patrons & flight
 * sides
 *
 */
function applyPatronDropZoneHandlers() {

    for (const flight_element of flight_elements) {
        flight_element.addEventListener('dragover', dragOverFlightElement);
        flight_element.addEventListener('dragenter', dragEnterFlightElement);
        flight_element.addEventListener('dragleave', dragLeaveFlightElement);
        flight_element.addEventListener('drop', dragDropIntoFlightElement);
    }
}

/**
 * applyGroupHandlers: apply handlers for groups
 *
 *  1. remove any existing handlers
 *  2. reset for drag star & dragend
 *  3. reset touchstart
 */
function applyGroupHandlers() {
    group_elements = document.querySelectorAll('.group');

    //drop any existing group/name listeners
    for (const group_element of group_elements) {
        group_element.removeEventListener('dragstart', dragGroupStart);
        group_element.removeEventListener('dragend', dragGroupEnd);
        group_element.removeEventListener('touchstart', groupElementTouchStart);
    }

    // apply  group/name listeners
    for (const group_element of group_elements) {
        group_element.addEventListener('dragstart', dragGroupStart);
        group_element.addEventListener('dragend', dragGroupEnd);
        group_element.addEventListener('touchstart', groupElementTouchStart);
    }
}



/**
 * ReadyFunction: once DOM is complete
 *
 *  1. apply import handler (still needs to be hooked up to build DOM)
 *  2. set handlers for drag start & dragend
 *  3. set touchstart handlers for groups being moved around
 *  4. set add patron processing
 */
document.onreadystatechange = function () {
    let state = document.readyState;
    if (state == 'complete') {


        // these two lines switch the view to simulate data already being loaded, would remove them eventually
        main.classList.toggle('hide');
         upload.classList.toggle('hide');

        applyImportHandler();
        applyPatronDropZoneHandlers();
        applyGroupHandlers();

        // add patron submit processing
        document.getElementById('add-patron').addEventListener('submit', function (e) {
            e.preventDefault();
            let modal = bootstrap.Modal.getInstance(myModal)
            modal.hide();
            addPatron(e);
            applyGroupHandlers();
        });

    }
}


// THINGS TO TRY:
/*
1. touch scroll issue: https://stackoverflow.com/questions/36596562/detect-touch-scroll-up-or-down
2. number keypad for number input vs text
3. drop person into group
4. add people count to bigger group display
4. balancing logic: hill algorithm:
 - https://www.geeksforgeeks.org/introduction-hill-climbing-artificial-intelligence/
 - https://www.geeksforgeeks.org/minimum-cost-to-reach-the-top-of-the-floor-by-climbing-stairs/
 - https://www.geeksforgeeks.org/n-queen-problem-local-search-using-hill-climbing-with-random-neighbour/
 - https://www.educba.com/hill-climbing-algorithm/
 - https://gist.github.com/sunetos/444396
 7. get info from ILLYA
 - max weight for balloons (can hard code)
 - max weight to reserve
 - what exact steps does it take to balance, any hints to first picks per F1-R F1-L, F2-R, F2-L
 - example data
 - picture of balloon for favicon
 - link to reservation site
 */