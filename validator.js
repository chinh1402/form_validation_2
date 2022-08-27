
function Validator (formSelector) {
    // when you use var form = new Validator; this will convert to form (which was assigned)
    var _this = this;

    // typical getParent
    var getParent = function(element,selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }   

    // this include: {input.name} : [f(rule1),f(rule2)]}
    var formRules = {}

    // to access this, use validatorRules[rule]
    var validatorRules = {
        required : function(value){
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email : function(value){
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : 'Trường này phải là email';
        },
        min : function(min){
            return function(value){
                return value.length>=min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
            }
        },
        max : function(max){
            return function(value){
                return value.length<=max ? undefined : `Vui lòng nhập tối đa ${max} kí tự`
            }
        },
    }

    // form
    var formElement = document.querySelector(formSelector);
    
    // if form is valid
    if (formElement) {
        // take all input which has both attributes: name; rules
        var inputs = formElement.querySelectorAll("[name][rules]")
        // take input out of inputs (it's a nodeList)
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|');
            // split rules; but still, need more spliting
            
             
            
            for (var rule of rules) {
                // both of these serve for the value part of the rule;
                // ruleInfo is the array of that rule which has value
                // Isrulehavingvalue is just checking if it has : or not

                // with common sense; ruleInfo[0] is rule; ruleInfo[1] is value
                var ruleInfo;
                var IsRuleHavingValue = rule.includes(':');
                if (IsRuleHavingValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }
                
                var ruleFunc = validatorRules[rule];
                
                if (IsRuleHavingValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            // event target is input because the event should be targeted on inputs

            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        function handleValidate(event){
            // event.target = input
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules) {
                // each rule is a func; so call
                errorMessage = rule(event.target.value);

                // input values

                if (errorMessage) break;

                // errorMessage is either undefined or have a string
            }
            
            if (errorMessage) {
                var formGroup = getParent(event.target,'.form-group')
                if (formGroup) {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    } if (formMessage) {
                        formMessage.innerText = errorMessage;   
                         }
            }
            return !errorMessage
            // This return is to serve if the form is valid or not
        }
        function handleClearError(event) {
            var formGroup = getParent(event.target,'.form-group');
            if (formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid');
                var formMessage = formGroup.querySelector('.form-message');
                    } if (formMessage) {
                        formMessage.innerText = '';   
                    }
        }
        
        formElement.onsubmit = function(event) {
            event.preventDefault();
            var inputs = formElement.querySelectorAll("[name][rules]")
            var isValid = true;
            for (var input of inputs) {
                if(!handleValidate({
                    target:input
                })) {isValid = false}
                // has errorMessage ==> not valid
                
            }
    
    
            if (isValid) {
                if (typeof _this.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce((values,input)=>
                    {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = "";
                                    return values;
                                }
    
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
    
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default: {
                                values[input.name] = input.value;   
                            }
                        }
                        return values;
                    }
                    ,{})
                    _this.onSubmit(formValues);
                    
                } 
                else {
                    formElement.submit();
                }
            }
        }
    }
}