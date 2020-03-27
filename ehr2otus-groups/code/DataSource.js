class DataSource {

    constructor(id, name=null) {
        this.objectType = "DataSourceDefinition";
        this.id = id;
        this.name = (name? name : id);
        this.bindTo = [];
    }

    addQuestionAtBindTo(questionId){
        this.bindTo.push(questionId);
    }

}

module.exports = DataSource;