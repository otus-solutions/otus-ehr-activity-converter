const Rule = require('./Rule');

class Branch {

    constructor(questionPageId, ehrBranch) {
        this.originPageId = questionPageId;
        this.targetPageId = ehrBranch.targetPageId;
        this.rules = [];
        for(let rule of ehrBranch.rule){
            this.rules.push(new Rule(rule));
        }

        // if(!this.targetPageId.includes("aux")){
        //     const originPageNumber = parseInt(this.originPageId.replace("PAGE_", ""), 10);
        //     const targetPageNumber = parseInt(this.targetPageId.replace("PAGE_", ""), 10);
        //     if(targetPageNumber - originPageNumber > 50){
        //         console.log(`${this.originPageId} -> ${this.targetPageId}`);
        //     }
        // }
    }

    fillGraphViz(graphViz){
        let orExpressions= [];
        for(let rule of this.rules){
            let andExpressions = [];
            for(let expression of rule.expressions){
                andExpressions.push(expression.toJSON());
            }
            orExpressions.push(andExpressions.join(" and "));
        }
        graphViz.addEdge(this.originPageId, this.targetPageId, orExpressions.join(" or\n"));
    }

}

module.exports = Branch;