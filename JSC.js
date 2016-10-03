var JSC = function(undefined) {
// Javascript calculator (JSC).
//
// V 0.1:
//   Has a display and buttons for entering data (digits, dot), elementary operations (+, -, *, /) and execute (=).
//
//   Display is a div with a frame.
 
    var copies = 0;
    var i;                 // Loop counter.
    var buttonList = [];   // List of entered digit buttons (digits, ., exp and +/-).
    var vAcc;              // Value in accumulator.
    var vCur;              // Current value (on display).
    var lastOperator;      // Operator to execute after the = button.

    var newElement = function(tag, classes, id, title) {
// Create new element.
        
// Tag has to be a string.
        if (typeof tag != 'string') return undefined;
        
        try { var elem = document.createElement(tag);}
        catch(err) {return undefined;}
        
// Classes can be value or a list of values, separated by spaces.
        if (typeof classes != undefined) {
            try {elem.className = classes;}
            catch(err) {return undefined;}
        }

        if (typeof id != undefined) {
            try {elem.id = id;}
            catch(err) {return undefined;}
        }
        
        if (typeof title == 'string') {
            try {elem.appendChild(document.createTextNode(title));}
            catch(err) {return undefined;}
        }
        
        return elem;
    }

    var calcReset = function () {
        vCur = undefined;
        buttonList = [];
    }

    var refreshDisplay = function(value) {
console.log('Value = ' + value, 'vCur = ' + vCur);
        if (value != undefined) {
            document.getElementById('display').innerHTML = value;
            return;
        }
        
        var vDisplay = '';   // String that is displayed.
        var len;
        var exponent = false;
        var signV = '+';
        var signE = '+';
        
        console.log (buttonList);

// If button list is empty clear display.
        len = buttonList.length;
        if (len > 0) {
// Construct string to be displayed according to the buttons in buttonList.
            for (i = 0; i < len; i++) {
                switch (buttonList[i]) {
                    case 'exp':
                        vDisplay += 'E';
                        exponent = true;
                        break;
                    case '+/-':
// Change sign of value or exponent, depending on the position (before or after exp).
                        if (exponent) {
                            signE = (signE == '+') ? '-' : '+';
                        }
                        else {
                            signV = (signV == '+') ? '-' : '+';
                        }
                        break;
                    default:
                       vDisplay += buttonList[i];
                }
            }
        
// If sign of value or exponent is negative, display it at the right position.
            if (signV == '-') vDisplay = '-' + vDisplay;
            if (signE == '-') {
                var ind = vDisplay.indexOf('E') + 1;
                if (ind > 0) {
                    vDisplay = vDisplay.slice(0, ind) + '-' + vDisplay.slice(ind);
                }
            }
        }
        
// Try to convert this string to number.
        vCur = Number(vDisplay);
console.log ('refresh display ' + vDisplay, 'vCur = ' + vCur, 'vAcc = ' + vAcc);       
        if (vDisplay.length > 20) {
            vDisplay = 'overflow';
        }

        document.getElementById('display').innerHTML = vDisplay;
    };
    
    var calcLayout = function () {
// Create layout.
// Returns element which contains complete layout of calculator.

// Create HTML element to hold a calculator.
        var calc = document.createElement('div');
        calc.className = 'calculator';
        
// Create containers for different groups of elements.
        var contDisplay = newElement('div', 'container', 'cDisplay');
        calc.appendChild(contDisplay);
        var contInfo = newElement('div', 'container', 'cInfo', 'JavaScript Calculator V1.0');
        calc.appendChild(contInfo);
        var contButtons = newElement('div', 'container', 'cButtons');
        calc.appendChild(contButtons);
        var contFunctions = newElement('div', 'container', 'cFunctions');
        contButtons.appendChild(contFunctions);
        var contDigits = newElement('div', 'container', 'cDigits');
        contButtons.appendChild(contDigits);
        var contOperators = newElement('div', 'container', 'cOperators');
        contButtons.appendChild(contOperators);

// Create display and position it in calc.
        var disp = newElement('div', 'display', 'display', '');
        contDisplay.appendChild(disp);

// Create digits buttons.
        var digs = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', 'exp'];
        for (var i in digs) {
            var but = newElement('button', 'button-digit', 'button' + digs[i], digs[i]);
            but.addEventListener('click', execButton);
            contDigits.appendChild(but);
        }

// Create operators buttons.
        var ops = ['<-', 'AC', '*', '/', '+', '-', '+/-', '='];
        for (var i in ops) {
            if ((ops[i] == '+/-') || (ops[i] == '<-')) {
                var but = newElement('button', 'button-digit', 'button' + ops[i], ops[i]);
            }
            else {
                var but = newElement('button', 'button-operation', 'button' + ops[i], ops[i]);
            }
            but.addEventListener('click', execButton);
            contOperators.appendChild(but);
        }
        
        return calc;
    }

    var blinkDisplay = function(interval, count) {
// Blink display count times with iterval miliseconds interval.
// Set default values if parameters are undefined.
        interval = (interval || 100) / 2;
        count = 2 * (count || 3);
        var blinking;

        var blinkIt = function() {
            if (count-- <= 0) {
                blinking = false;
                return;
            }
        
            if ((count % 2) == 1) {
                display.style.backgroundColor = inverted;
            }
            else {
                display.style.backgroundColor = color;
            }
            setTimeout(blinkIt, interval);
        };
        
        var display = document.getElementById('display');
        if (display && (count > 0)) {
            var color = 'rgb(250,250,255)';
            var inverted = 'rgb(6, 6, 6)';
            if (!blinking) {
                blinking = true;
                blinkIt();
            }
        }
    };
        
    var execButton = function() {
// Executes an operation according to button id.
        
// If this is a digit button (including . and exp), change current value.
        if (this.className.search('button-digit') > -1) {
            insertDigit(this.id.slice(6));
            refreshDisplay();
        }
// If operation - execute operation.
        else if (this.className.search('button-operation') > -1) {
            executeOperation(this.id.slice(6));
        }
    };

    var insertDigit = function(button) {
// Entering current value (shown on display).
// A list of pressed values is saved to enable delete button to remove the last entered button.
//
// Each operation or function clears buttonList but display may still show a value.

        switch (button) {
            case 'exp':
// Check if exp is pressed as the first digit button.
                if (buttonList.length == 0) {
                    blinkDisplay();
                    return;
                }
                break;
            case '.':
// Dot can only be entered once but not after exp is pressed (only integer exponents).
                if ((buttonList.indexOf('.') > -1) || (buttonList.indexOf('exp') > -1)) {
                    blinkDisplay();
                    return;
                }
                break;
            case '<-':
                if (buttonList.length == 0) {
                    blinkDisplay();
                }
                else {
                    buttonList.pop();
                }
                return;
                break;
            default:
        }
        buttonList.push(button);
    };

    var executeOperation = function(button) {
// End input and save value into accumulator (except AC which clears it).
// Remember operation or execute it in case of =.
        switch (button) {
            case '+':
            case '-':
            case '*':
            case '/':
                if (vCur == undefined) {
                    blinkDisplay();
                    return;
                }
// Save operator, save displayed number into accumulator and reset input list
// to start entering new number.
                lastOperator = button;
                vAcc = vCur;
                buttonList = [];
                break;
            case 'AC':
// Clear accumulator and display and start entering new number.
                vAcc = undefined;
                buttonList = [];
                refreshDisplay();
                lastOperator = undefined;
                break;
            case '=':
// Execute last operation.
// If accumulator is empty or no operation is defined, exit.
                if ((vCur == undefined) || (vAcc == undefined) || (lastOperator == undefined)) {
                    blinkDisplay();
                    return;
                }
                switch (lastOperator) {
                    case '+':
                        vAcc = vAcc + vCur;
                        break;
                    case '-':
                        vAcc = vAcc - vCur;
                        break;
                    case '*':
                        vAcc = vAcc * vCur;
                        break;
                    case '/':
                        vAcc = vAcc / vCur;
                        break;
                    default:
                        blinkDisplay();
                        return;
                }
                lastOperator = undefined;
                buttonList = [];
                vCur = vAcc;
                refreshDisplay(vCur);
        }
    }
    
// Initializes JSC - creates HTML elements and set events on buttons.
// At the end insert element in parent.

// Allow only one copy of JSC for now.
    var init = function(parent) {
        if (copies++ > 0) {
            window.alert ('Only one copy allowed!');
            return;
        }

        document.getElementById(parent).appendChild(calcLayout());
        calcReset();
    };

	return {
		init: init
	};
} ();
