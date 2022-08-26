
function Validator (formSelector) {
    var _this = this;

    var getParent = function(element,selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var formRules = {}

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

    var formElement = document.querySelector(formSelector);
    
    if (formElement) {

        var inputs = formElement.querySelectorAll("[name][rules]")
        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
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
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
        function handleValidate(event){
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage) break;
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

    }
    formElement.onsubmit = function(event) {
        event.preventDefault();
        var inputs = formElement.querySelectorAll("[name][rules]")
        var isValid = true;
        for (var input of inputs) {
            if(!handleValidate({
                target:input
            })) {isValid = false}
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