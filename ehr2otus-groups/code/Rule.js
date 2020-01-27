const ANDExpression = require('./ANDExpression');
const NavigationHandler = require('./NavigationHandler');

/* Its a AND expression in EHR template */

class Rule {

    constructor(ehrAndExpressionArr) {
        this.andExpression = new ANDExpression(ehrAndExpressionArr.expression);
    }

    toOtusTemplate(index){
        return NavigationHandler.getConditionRouteObj(index, this.andExpression.toOtusTemplate());
    }

}

module.exports = Rule;