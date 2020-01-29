
class Route {

    constructor(originQuestion, destinyQuestion, conditionsArr) {
        this.origin = originQuestion;
        this.destination = destinyQuestion;
        this.conditions = conditionsArr;
    }

    toOtusTemplate(){
        let conditions = [];
        for (let i = 0; i < this.conditions.length; i++) {
            conditions.push(this.conditions[i].toOtusTemplate(i)); //TODO
        }
        const isDefault = (conditions.length === 0);
        return NavigationHandler._getRouteObject(this.origin, this.destination, isDefault, conditions);
    }
}

module.exports = Route;