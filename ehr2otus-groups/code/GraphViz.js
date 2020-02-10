const FileHandler = require('./FileHandler');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const dotCommand = "dot"; // '"C:\\Program Files (x86)\\GraphViz\\bin\\dot.exe"'; //. on Windows

class GraphViz {

	constructor(){
		this.nodes = [];
		this.edges = [];
	}
  
	save(pathNoExtension){
		let content = "digraph G {\n";
		for(let node of this.nodes){
			content += node.toGraphViz();
		}
		content += this.edges.join("\n") + "\n}";
		FileHandler.write(pathNoExtension + ".dot", content);
		dotToPng(pathNoExtension + ".dot", pathNoExtension + ".png");
	}
	 
	addNode(id){
		if(this._indexOfNode(id) < 0){
			this.nodes.push(new Node(id));
		}
	}

	addNodeWithLabel(id, label){
		try {
			let index = this._indexOfNode(id);
			this.nodes[index].label = label;
		} 
		catch (e) {
			this.nodes.push(new Node(id, label));
		}
	}

	_indexOfNode(id){
		let i = 0, found = false;
		while(!found && i < this.nodes.length){
			found = (this.nodes[i++].id === id);
		}
		return (found? i-1 : -1);
	}

	addEdge(originNodeId, targetNodeId, label=''){
		const color = (label==='' ? "blue" : "black");
		this.edges.push(`${originNodeId} -> ${targetNodeId} [label=\"${label}\" color=${color}];`);
	}
}

module.exports = GraphViz;

/*
 * Private things
 */

class Node {

	constructor(id, label){
		this.id = id;
		this.label = label;
	}

	toGraphViz(){
		if(!this.label){
			return this.id + "\n";
		}
		return `${this.id} [label=\"${this.label}\"]\n`;
	}
}

function dotToPng(dotFilePath, pngFilePath){
	const command = `${dotCommand} -Tpng ${dotFilePath} > ${pngFilePath}`;
	// exec(command,
	// 	function (error) {
	// 		if (error) {
	// 			console.error('\nexec error in command: ' + command);
	// 			console.error(error);
	// 			throw error;
	// 		}
	// 	}
	// );
	execSync(command);
	console.log('Saved ' + pngFilePath);//.
}
