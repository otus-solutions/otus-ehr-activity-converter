const Rule = require('./Rule');

class Branch {

    constructor(questionPageId, ehrBranch) {
        this.originPageId = questionPageId;
        this.targetPageId = ehrBranch.targetPageId;
        this.rules = [];
        for(let rule of ehrBranch.rule){
            this.rules.push(new Rule(rule));
        }
    }

}

module.exports = Branch;